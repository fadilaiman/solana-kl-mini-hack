'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatAmount } from '@/lib/serialize';
import { MandateCard, type Mandate, shortAddr } from '@/app/components/MandateCard';
import { TopNav, Footer } from '@/app/components/Chrome';
import { SkeletonBento } from '@/app/components/Skeleton';
import { InlineError, EmptyState } from '@/app/components/States';

const fmtNextCharge = (iso: string) => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = d.getTime() - now;
  if (diff <= 0) return 'due now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `in ${hrs} h`;
  return `in ${Math.round(hrs / 24)} d`;
};

function sumSuccess(list: Mandate[]) {
  const byToken: Record<string, { amt: bigint; decimals: number }> = {};
  for (const m of list) {
    const n = m.debitLogs.filter((l) => l.status === 'SUCCESS').length;
    const sym = m.tokenSymbol || 'tokens';
    byToken[sym] = byToken[sym] || { amt: 0n, decimals: m.decimals };
    byToken[sym].amt += BigInt(m.debitAmount) * BigInt(n);
  }
  const parts = Object.entries(byToken).filter(([, v]) => v.amt > 0n)
    .map(([sym, v]) => `${formatAmount(v.amt, v.decimals)} ${sym}`);
  return parts.length ? parts.join(' · ') : '—';
}

export default function MyDashboard() {
  const [wallet, setWallet] = useState('');
  const [query, setQuery] = useState('');
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const [tab, setTab] = useState<'receiving' | 'paying'>('receiving');
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  // init from ?wallet= or last-used (localStorage)
  useEffect(() => {
    const w = new URL(window.location.href).searchParams.get('wallet')
      || localStorage.getItem('sm_wallet') || '';
    if (w) { setWallet(w); setQuery(w); }
  }, []);

  const load = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`/api/v1/mandates?wallet=${encodeURIComponent(wallet)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setMandates(await res.json());
      setLoadErr('');
    } catch (err: any) {
      setLoadErr(err?.message || 'Could not load this wallet right now.');
    } finally {
      setLoaded(true);
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [wallet, load]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = query.trim();
    if (!a) return;
    localStorage.setItem('sm_wallet', a);
    setWallet(a);
    setLoaded(false);
    window.history.replaceState(null, '', `/dashboard?wallet=${encodeURIComponent(a)}`);
  };

  const asMerchant = mandates.filter((m) => m.merchant === wallet);
  const asPayer = mandates.filter((m) => m.payer === wallet);

  const active = mandates.filter((m) => m.status === 'ACTIVE');
  const pendingAuth = mandates.filter((m) => m.status === 'PENDING_AUTH').length;
  const pendingPayments = active.reduce(
    (s, m) => s + Math.max(0, m.totalCycles - m.debitLogs.filter((l) => l.status === 'SUCCESS').length), 0);
  const failed = mandates.reduce((s, m) => s + m.debitLogs.filter((l) => l.status === 'FAILED').length, 0);
  const nextCharge = active.length
    ? active.reduce((a, b) => (new Date(a.nextDebitAt) < new Date(b.nextDebitAt) ? a : b))
    : null;

  const list = tab === 'receiving' ? asMerchant : asPayer;

  return (
    <>
      <TopNav active="dashboard" />

      <main className="container">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 'var(--stack-lg)' }}>
          <div>
            <h1 className="headline-lg text-primary">Dashboard</h1>
            <p className="muted" style={{ marginTop: 4 }}>
              Read-only view of a wallet's mandates & payments · Solana {network}
            </p>
          </div>
          <div className="status-dot" style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--surface-container-high)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="d dot-green" /> <span className="muted">Solana {network}</span>
          </div>
        </div>

        {/* wallet lookup */}
        <form onSubmit={submit} className="row" style={{ marginBottom: 'var(--stack-lg)' }}>
          <div className="search" style={{ flex: 1 }}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Paste a wallet address" />
          </div>
          <button type="submit" className="btn-primary" style={{ flex: '0 0 160px' }}>View dashboard</button>
        </form>

        {!wallet && (
          <div className="glass-card pad center" style={{ padding: 56 }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>account_balance_wallet</span>
            <p className="muted" style={{ marginTop: 12 }}>
              Paste a wallet above to load its dashboard. Nothing to log in — it reads public on-chain mandates.
            </p>
          </div>
        )}

        {wallet && !loaded && <SkeletonBento />}

        {wallet && loaded && loadErr && mandates.length === 0 && (
          <div className="glass-card" style={{ marginTop: 'var(--stack-lg)' }}>
            <EmptyState icon="cloud_off" title="Couldn't load this wallet"
              hint={loadErr} />
            <div className="center" style={{ paddingBottom: 24 }}>
              <button className="secondary" style={{ width: 'auto' }} onClick={load}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span> Try again
              </button>
            </div>
          </div>
        )}

        {wallet && loaded && !(loadErr && mandates.length === 0) && (
          <>
            {loadErr && <InlineError message={loadErr} onRetry={load} />}
            {/* ── Bento stats ── */}
            <section className="bento stagger" style={{ marginBottom: 'var(--stack-lg)' }}>
              <div className="glass-card premium-border bento-card hover-lift" style={{ ['--i' as string]: 0 }}>
                <div className="bento-head">
                  <span className="label-eyebrow">Total Receiving</span>
                  <span className="bento-ico tint-green"><span className="material-symbols-outlined">trending_up</span></span>
                </div>
                <div className="bento-val text-tertiary">{sumSuccess(asMerchant)}</div>
                <div className="muted" style={{ marginTop: 12 }}>Collected as merchant</div>
              </div>

              <div className="glass-card premium-border bento-card hover-lift" style={{ ['--i' as string]: 1 }}>
                <div className="bento-head">
                  <span className="label-eyebrow">Total Paying</span>
                  <span className="bento-ico tint-gold"><span className="material-symbols-outlined">outbound</span></span>
                </div>
                <div className="bento-val text-secondary">{sumSuccess(asPayer)}</div>
                <div className="muted" style={{ marginTop: 12 }}>Active subscriptions: {asPayer.filter((m) => m.status === 'ACTIVE').length}</div>
              </div>

              <div className="glass-card premium-border bento-card hover-lift" style={{ borderColor: 'rgba(211,187,255,0.2)', ['--i' as string]: 2 }}>
                <div className="bento-head">
                  <span className="label-eyebrow">Next Scheduled Charge</span>
                  <span className="bento-ico tint-purple"><span className="material-symbols-outlined">event_upcoming</span></span>
                </div>
                <div className="bento-val">
                  {nextCharge ? `${formatAmount(nextCharge.debitAmount, nextCharge.decimals)} ${nextCharge.tokenSymbol || ''}` : '—'}
                </div>
                <div className="muted" style={{ marginTop: 12 }}>
                  {nextCharge ? (
                    <span className="mono" style={{ color: 'var(--primary)' }}>{fmtNextCharge(nextCharge.nextDebitAt)} → {shortAddr(nextCharge.merchant)}</span>
                  ) : 'No upcoming charges'}
                </div>
              </div>
            </section>

            {/* compact KPI tiles */}
            <div className="stats" style={{ marginTop: 0, marginBottom: 'var(--stack-lg)' }}>
              <div className="tile"><div className="tile-val">{active.length}</div><div className="tile-label">Active mandates</div></div>
              <div className="tile"><div className="tile-val" style={{ color: 'var(--warn)' }}>{pendingPayments}</div><div className="tile-label">Pending payments</div></div>
              <div className="tile"><div className="tile-val">{pendingAuth}</div><div className="tile-label">Awaiting signature</div></div>
              <div className="tile"><div className="tile-val" style={{ color: failed ? 'var(--error)' : 'var(--text)' }}>{failed}</div><div className="tile-label">Failed</div></div>
            </div>

            {/* ── tabs + mandate list ── */}
            <section className="glass-card" style={{ overflow: 'hidden', marginBottom: 'var(--stack-lg)' }}>
              <div className="flex-between" style={{ padding: '6px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex' }}>
                  <button
                    onClick={() => setTab('receiving')}
                    className="ghost"
                    style={{ borderRadius: 0, padding: '16px 20px', position: 'relative', color: tab === 'receiving' ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === 'receiving' ? '2px solid var(--primary)' : '2px solid transparent' }}>
                    Receiving (Merchant) · {asMerchant.length}
                  </button>
                  <button
                    onClick={() => setTab('paying')}
                    className="ghost"
                    style={{ borderRadius: 0, padding: '16px 20px', position: 'relative', color: tab === 'paying' ? 'var(--primary)' : 'var(--on-surface-variant)', borderBottom: tab === 'paying' ? '2px solid var(--primary)' : '2px solid transparent' }}>
                    Paying (Payer) · {asPayer.length}
                  </button>
                </div>
              </div>

              <div style={{ padding: 'var(--gutter)' }}>
                {loaded && list.length === 0 && (
                  <p className="muted">
                    {tab === 'receiving' ? 'No mandates where this wallet collects.' : 'No subscriptions paid from this wallet.'}
                  </p>
                )}
                {list.map((m) => (
                  <MandateCard key={m.id} m={m} role={tab === 'receiving' ? 'merchant' : 'payer'} network={network} />
                ))}
              </div>
            </section>

            {/* ── quick actions ── */}
            <section className="grid">
              <a href="/" className="glass-card pad flex-between group hover-lift" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="bento-ico tint-purple" style={{ width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined">add_link</span>
                  </span>
                  <div>
                    <h3 className="card-title" style={{ fontSize: 18, margin: 0 }}>Create New Mandate</h3>
                    <p className="muted">Set up a new recurring payment stream</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary nudge">arrow_forward</span>
              </a>
              <a href="/activity" className="glass-card pad flex-between group hover-lift" style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="bento-ico tint-gold" style={{ width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined">analytics</span>
                  </span>
                  <div>
                    <h3 className="card-title" style={{ fontSize: 18, margin: 0 }}>Protocol Activity</h3>
                    <p className="muted">Watch live on-chain debits & cancellations</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary nudge">arrow_forward</span>
              </a>
            </section>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
