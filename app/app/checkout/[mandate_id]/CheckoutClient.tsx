'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createApproveCheckedInstruction, createRevokeInstruction } from '@solana/spl-token';
import { formatAmount } from '@/lib/serialize';
import { Wordmark, Footer } from '@/app/components/Chrome';
import { Skeleton } from '@/app/components/Skeleton';

interface Mandate {
  id: string; merchant: string; payer: string | null; mint: string; decimals: number;
  tokenSymbol: string | null; frequency?: string;
  maxAmount: string; debitAmount: string; totalCycles: number;
  status: string; collected?: number;
}
interface Config { delegate: string; rpcUrl: string; network: string; mockChain: boolean; }

const CADENCE: Record<string, string> = {
  daily: 'every day', weekly: 'every week', monthly: 'every month', testing_10m: 'every 10 minutes',
};

export default function CheckoutClient({ mandateId }: { mandateId: string }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const load = useCallback(async () => {
    const [m, c] = await Promise.all([
      fetch(`/api/v1/mandates/${mandateId}`, { cache: 'no-store' }),
      fetch('/api/v1/config', { cache: 'no-store' }),
    ]);
    if (m.ok) setMandate(await m.json());
    if (c.ok) setConfig(await c.json());
  }, [mandateId]);

  useEffect(() => { load(); }, [load]);

  const authorize = async () => {
    if (!mandate || !config || !publicKey) return;
    setBusy(true);
    setError('');
    try {
      let approveTx = '';

      if (!config.mockChain) {
        // Build & send the one-time on-chain approve (delegates the allowance).
        const mintPk = new PublicKey(mandate.mint);
        const ata = await getAssociatedTokenAddress(mintPk, publicKey);

        const ataInfo = await connection.getAccountInfo(ata);
        if (!ataInfo) {
          throw new Error('Your wallet has no account for this token yet — fund it with the token first.');
        }

        const ix = createApproveCheckedInstruction(
          ata,
          mintPk,
          new PublicKey(config.delegate),  // platform delegate
          publicKey,                        // owner (payer)
          BigInt(mandate.maxAmount),        // total allowance
          mandate.decimals,
        );
        // Priority fee helps the approve land while devnet is congested.
        const tx = new Transaction()
          .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }))
          .add(ix);
        const sig = await sendTransaction(tx, connection);
        approveTx = sig;
        // Don't hard-fail if confirmation is slow — the backend re-checks the
        // delegate on-chain, so a late-landing tx still activates the mandate.
        try {
          await connection.confirmTransaction(sig, 'confirmed');
        } catch {
          /* confirmation timed out; backend verification will catch up */
        }
      }

      // Tell the backend to verify & activate the mandate.
      const res = await fetch(`/api/v1/mandates/${mandateId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payer: publicKey.toBase58(), approveTx }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'authorization failed');

      setDone(true);
      load();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  // Customer-initiated cancel: revoke the on-chain delegation, so the platform
  // can never pull again, then tell the backend to stop the mandate.
  const cancel = async () => {
    if (!mandate || !config || !publicKey) return;
    setBusy(true);
    setError('');
    try {
      let revokeTx = '';
      if (!config.mockChain) {
        const mintPk = new PublicKey(mandate.mint);
        const ata = await getAssociatedTokenAddress(mintPk, publicKey);
        const tx = new Transaction()
          .add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 }))
          .add(createRevokeInstruction(ata, publicKey)); // owner revokes their own delegate
        const sig = await sendTransaction(tx, connection);
        revokeTx = sig;
        try { await connection.confirmTransaction(sig, 'confirmed'); } catch { /* slow devnet */ }
      }
      const res = await fetch(`/api/v1/mandates/${mandateId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revokeTx, by: 'customer' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'cancel failed');
      setCanceled(true);
      load();
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  if (!mandate || !config) {
    return (
      <>
        <CheckoutHeader />
        <main className="container container-narrow">
          <div className="stack-lg">
            <div className="glass-card pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Skeleton className="sk-circle" style={{ width: 96, height: 96 }} />
              <Skeleton className="sk-line lg" style={{ width: 220 }} />
              <Skeleton className="sk-line sm" style={{ width: 280 }} />
            </div>
            <div className="glass-card center" style={{ padding: '48px var(--gutter)' }}>
              <Skeleton className="sk-line sm" style={{ width: 140, margin: '0 auto 16px' }} />
              <Skeleton className="sk-line" style={{ width: 200, height: 40, margin: '0 auto' }} />
              <Skeleton className="sk-line sm" style={{ width: 120, margin: '14px auto 0' }} />
            </div>
          </div>
        </main>
      </>
    );
  }

  const sym = mandate.tokenSymbol || 'tokens';
  const perCycle = formatAmount(mandate.debitAmount, mandate.decimals);
  const total = formatAmount(mandate.maxAmount, mandate.decimals);
  const cadence = CADENCE[mandate.frequency || ''] || 'each cycle';
  const status = canceled ? 'REVOKED' : done ? 'ACTIVE' : mandate.status;
  const isStopped = ['REVOKED', 'COMPLETED', 'EXHAUSTED'].includes(status);
  const isActive = status === 'ACTIVE';
  const isPayer = connected && publicKey?.toBase58() === mandate.payer;

  const statusMeta = isStopped
    ? { dot: 'dot-grey', label: status.charAt(0) + status.slice(1).toLowerCase(), color: 'var(--outline)' }
    : isActive
      ? { dot: 'dot-green', label: 'Active', color: 'var(--tertiary)' }
      : { dot: 'dot-gold', label: 'Ready', color: 'var(--secondary)' };

  return (
    <>
      <CheckoutHeader />

      <main className="container container-narrow">
        <div className="stack-lg">
          {/* ── Merchant identity ── */}
          <div className="glass-card pad" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', border: '2px solid rgba(211,187,255,0.3)', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-container-high)' }}>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>storefront</span>
              </div>
              <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--surface-container)', borderRadius: '50%', padding: 4, filter: 'drop-shadow(0 0 8px rgba(255,198,64,0.4))' }}>
                <span className="material-symbols-outlined icon-fill text-secondary">verified</span>
              </div>
            </div>
            <div className="center">
              <div className="flex-between" style={{ justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                <h1 className="card-title" style={{ margin: 0 }}>Merchant mandate</h1>
                <span className="pill" style={{ background: 'rgba(255,198,64,0.1)', color: 'var(--secondary)', border: '1px solid rgba(255,198,64,0.2)' }}>On-chain</span>
              </div>
              <p className="mono dim" style={{ marginBottom: 8 }}>{mandate.merchant}</p>
              <p className="muted" style={{ maxWidth: 460 }}>
                You're authorizing a non-custodial recurring payment. The protocol can pull at
                most your approved total — and you can revoke any time.
              </p>
            </div>
          </div>

          {/* ── Mandate commitment ── */}
          <div style={{ position: 'relative' }}>
            <div className="glass-card center" style={{ padding: '48px var(--gutter)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(to right, #6d28d9, #ffc640)' }} />
              <p className="label-eyebrow" style={{ marginBottom: 16 }}>Mandate Commitment</p>
              <span style={{ color: 'var(--on-surface-variant)', fontSize: 18 }}>You will pay</span>
              <h2 className="big-amount text-gradient">{perCycle} {sym}</h2>
              <span className="text-secondary" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 600 }}>{cadence}</span>

              <div style={{ marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, textAlign: 'left' }}>
                <Field label="Start Date" value="On approval" />
                <Field label="Cycles" value={`${mandate.totalCycles}`} />
                <Field label="Max Total Allowance" value={`${total} ${sym}`} />
                <div>
                  <p className="label-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>Status</p>
                  <div className="status-dot" style={{ color: statusMeta.color }}>
                    <span className={`d ${statusMeta.dot} pulse`} style={{ width: 6, height: 6, borderRadius: 999 }} />
                    <span className="mono">{statusMeta.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Transparency cards ── */}
          <div className="grid">
            <div className="glass-card pad hover-lift">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span className="bento-ico tint-purple"><span className="material-symbols-outlined">security</span></span>
                <div>
                  <h3 className="card-title" style={{ fontSize: 18, margin: '0 0 8px' }}>How it works</h3>
                  <p className="muted" style={{ lineHeight: 1.6 }}>
                    You sign one on-chain approval delegating a fixed allowance. The protocol pulls
                    the set amount each cycle — never more — and gas is on us.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-card pad hover-lift">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <span className="bento-ico tint-gold"><span className="material-symbols-outlined">event_busy</span></span>
                <div>
                  <h3 className="card-title" style={{ fontSize: 18, margin: '0 0 8px' }}>Cancellation policy</h3>
                  <p className="muted" style={{ lineHeight: 1.6 }}>
                    Cancel anytime by revoking the on-chain delegation from this page. No lock-ins,
                    no hidden fees, no clawbacks on already-settled cycles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <WalletMultiButton />

            {config.mockChain && (
              <div className="banner warn" style={{ width: '100%', maxWidth: 400, marginBottom: 0 }}>
                Mock mode — no on-chain approve will be sent.
              </div>
            )}
            {error && <div className="banner err" style={{ width: '100%', maxWidth: 400, marginBottom: 0 }}>{error}</div>}

            {isStopped ? (
              <div className="banner info" style={{ width: '100%', maxWidth: 400, marginBottom: 0 }}>
                This subscription is {status.toLowerCase()}. No further payments will be collected.
              </div>
            ) : isActive ? (
              <>
                <div className="banner ok" style={{ width: '100%', maxWidth: 400, marginBottom: 0 }}>
                  ✓ Mandate active. {perCycle} {sym} is pulled {cadence} automatically — gas on us.
                </div>
                {isPayer ? (
                  <button className="secondary btn-block" style={{ maxWidth: 400 }} disabled={busy} onClick={cancel}>
                    {busy ? 'Canceling…' : 'Cancel subscription (revoke on-chain)'}
                  </button>
                ) : (
                  <p className="muted center" style={{ fontSize: 12 }}>
                    Connect the wallet that authorized this mandate to cancel it.
                  </p>
                )}
              </>
            ) : (
              <button className="btn-primary btn-block" style={{ maxWidth: 400, height: 56 }} disabled={!connected || busy} onClick={authorize}>
                <span className="material-symbols-outlined">{busy ? 'sync' : 'account_balance_wallet'}</span>
                {busy ? 'Authorizing…' : connected ? `Approve ${total} ${sym} allowance` : 'Connect wallet to continue'}
              </button>
            )}

            <div className="status-dot dim" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
              Secured by Solana smart contracts
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function CheckoutHeader() {
  return (
    <header className="topnav">
      <div className="topnav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>verified_user</span>
          <Wordmark />
        </div>
        <div className="status-dot muted" style={{ gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
          Secure Checkout
        </div>
      </div>
    </header>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{label}</p>
      <p className="mono" style={{ color: 'var(--on-surface)' }}>{value}</p>
    </div>
  );
}
