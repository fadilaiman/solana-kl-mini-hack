'use client';

import { useEffect, useState } from 'react';
import { formatAmount } from '@/lib/serialize';
import { FREQUENCIES, durationSummary, type Frequency } from '@/lib/schedule';
import { DEFAULT_TOKEN } from '@/lib/constants';
import { TopNav, Footer } from '@/app/components/Chrome';
import { SkeletonTable } from '@/app/components/Skeleton';
import { InlineError, EmptyState, ErrorState } from '@/app/components/States';

interface DebitLog { id: string; status: string; amountDebited: string; txSignature: string; executedAt: string; errorMessage?: string | null; }
interface Mandate {
  id: string; merchant: string; payer: string | null; mint: string; decimals: number;
  tokenSymbol: string | null; maxAmount: string; debitAmount: string; totalCycles: number; frequency: string;
  status: string; createdAt: string; debitLogs: DebitLog[];
}

const FREQ_ORDER: Frequency[] = ['daily', 'weekly', 'monthly', 'testing_10m'];

const shortId = (id: string) => `${id.slice(0, 7)}…${id.slice(-3)}`;

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

// format a JS number trimming to at most 6 dp (USDC precision)
const fmt = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString(undefined, { maximumFractionDigits: 6 });

export default function Home() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [form, setForm] = useState({
    merchant: '', mint: DEFAULT_TOKEN.mint, tokenSymbol: DEFAULT_TOKEN.symbol,
    configMethod: 'per_payment' as 'per_payment' | 'total',
    perPayment: '', total: '',
    frequency: 'daily' as Frequency, numberOfPayments: '12',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lookup, setLookup] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Mandate | null>(null);
  const [toast, setToast] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const unit = form.tokenSymbol || 'tokens';

  const load = async () => {
    try {
      const res = await fetch('/api/v1/mandates', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      setMandates(await res.json());
      setLoadErr('');
    } catch (err: any) {
      setLoadErr(err?.message || 'Could not reach the mandate service.');
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── live summary (amounts are in the settlement token) ──
  const payments = parseInt(form.numberOfPayments, 10) || 0;
  const perPayment = form.configMethod === 'total'
    ? (payments > 0 ? Number(form.total || 0) / payments : 0)
    : Number(form.perPayment || 0);
  const total = form.configMethod === 'total'
    ? Number(form.total || 0)
    : perPayment * payments;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    setCreated(null);
    try {
      const res = await fetch('/api/v1/mandates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: form.merchant,
          mint: form.mint,
          tokenSymbol: form.tokenSymbol,
          configMethod: form.configMethod,
          perPayment: form.perPayment,
          total: form.total,
          frequency: form.frequency,
          numberOfPayments: form.numberOfPayments,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setCreated(data);
      setForm({ ...form, perPayment: '', total: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const checkoutUrl = (id: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout/${id}`;

  const copyLink = (id: string) => {
    navigator.clipboard?.writeText(checkoutUrl(id));
    showToast('Checkout link copied!');
  };

  // Operator stop: tells the cron to stop collecting. (The customer's on-chain
  // allowance stays until THEY revoke it from their checkout link.)
  const cancelMandate = async (id: string) => {
    if (!window.confirm('Stop collecting on this mandate? It will no longer be debited.')) return;
    await fetch(`/api/v1/mandates/${id}/cancel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ by: 'operator' }),
    });
    load();
  };

  // ── headline stats ──
  const activeCount = mandates.filter((m) => m.status === 'ACTIVE').length;
  const settled: Record<string, { amt: bigint; decimals: number }> = {};
  for (const m of mandates) {
    const n = m.debitLogs.filter((l) => l.status === 'SUCCESS').length;
    const sym = m.tokenSymbol || 'tokens';
    settled[sym] = settled[sym] || { amt: 0n, decimals: m.decimals };
    settled[sym].amt += BigInt(m.debitAmount) * BigInt(n);
  }
  const volume = Object.entries(settled).filter(([, v]) => v.amt > 0n)
    .map(([sym, v]) => `${formatAmount(v.amt, v.decimals)} ${sym}`).join(' · ') || '$0.00';

  return (
    <>
      <TopNav active="create" />

      <main className="container section-gap">
        {/* ── Hero ── */}
        <section style={{ position: 'relative' }}>
          <div className="orb orb-purple" style={{ top: -96, left: -96 }} />
          <div className="orb orb-gold" style={{ bottom: -96, right: -96 }} />
          <div className="center fade-up" style={{ maxWidth: 768, margin: '0 auto 64px' }}>
            <h1 className="display-lg text-gradient animated">Automate your revenue on Solana.</h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)', marginTop: 16 }}>
              Non-custodial recurring payments and subscription mandates for the Solana
              ecosystem. Secure, transparent, and fully automated.
            </p>
          </div>

          {/* ── Stats bar ── */}
          <div className="stats-bar stagger" style={{ maxWidth: 896, margin: '0 auto' }}>
            <div className="glass-card stat-hero hover-lift" style={{ ['--i' as string]: 0 }}>
              <span className="lbl">Total Settled Volume</span>
              <span className="val text-secondary">{volume}</span>
            </div>
            <div className="glass-card stat-hero hover-lift" style={{ ['--i' as string]: 1 }}>
              <span className="lbl">Active Mandates</span>
              <span className="val text-primary">{activeCount.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* ── Wallet lookup ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); const a = lookup.trim(); if (a) window.location.href = `/dashboard?wallet=${encodeURIComponent(a)}`; }}
          className="row"
        >
          <div className="search" style={{ flex: 1 }}>
            <span className="material-symbols-outlined">search</span>
            <input value={lookup} onChange={(e) => setLookup(e.target.value)}
              placeholder="Look up a wallet — see what it's paying or collecting" />
          </div>
          <button type="submit" className="secondary" style={{ flex: '0 0 150px' }}>My dashboard</button>
        </form>

        {/* ── Bento: Quick Create + Recent Mandates ── */}
        <div className="grid-bento">
          {/* Quick Create */}
          <section>
            <div className="glass-card pad" style={{ height: '100%' }}>
              <div className="card-title-row">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <h2 className="card-title" style={{ margin: 0 }}>Quick Create</h2>
              </div>
              {error && <div className="banner err">{error}</div>}

              <form onSubmit={submit}>
                <label>Your receiving wallet *</label>
                <input required placeholder="The Solana wallet that collects payments"
                  value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} />

                <label>Settlement token</label>
                <div className="token-chip">
                  <span className="token-dot" />
                  {form.mint === DEFAULT_TOKEN.mint ? DEFAULT_TOKEN.label : `${form.tokenSymbol || 'custom'} · custom mint`}
                  <span style={{ marginLeft: 'auto', fontSize: 12 }} className="dim">amounts in {unit}</span>
                </div>

                <button type="button" className="link-btn" style={{ marginTop: 12 }} onClick={() => setShowAdvanced(!showAdvanced)}>
                  {showAdvanced ? '▾ Hide advanced' : '▸ Advanced — use a different token'}
                </button>
                {showAdvanced && (
                  <div className="advanced">
                    <label style={{ marginTop: 0 }}>Custom token mint</label>
                    <input value={form.mint} onChange={(e) => setForm({ ...form, mint: e.target.value })} />
                    <label>Token label</label>
                    <input value={form.tokenSymbol} onChange={(e) => setForm({ ...form, tokenSymbol: e.target.value })} />
                    <p className="dim" style={{ fontSize: 12, marginTop: 8 }}>
                      Any SPL token works. Amounts you enter are in this token's own units.
                    </p>
                  </div>
                )}

                <label style={{ marginTop: 20 }}>Configuration method *</label>
                <div className="row" style={{ marginTop: 4 }}>
                  <label className="radio">
                    <input type="radio" name="cm" checked={form.configMethod === 'per_payment'}
                      onChange={() => setForm({ ...form, configMethod: 'per_payment' })} /> Per-payment amount
                  </label>
                  <label className="radio">
                    <input type="radio" name="cm" checked={form.configMethod === 'total'}
                      onChange={() => setForm({ ...form, configMethod: 'total' })} /> Total (auto-divide)
                  </label>
                </div>

                <div className="row">
                  <div>
                    {form.configMethod === 'per_payment' ? (
                      <>
                        <label>Amount per payment ({unit}) *</label>
                        <input required type="number" step="any" min="0" placeholder="1"
                          value={form.perPayment} onChange={(e) => setForm({ ...form, perPayment: e.target.value })} />
                      </>
                    ) : (
                      <>
                        <label>Total amount ({unit}) *</label>
                        <input required type="number" step="any" min="0" placeholder="12"
                          value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
                      </>
                    )}
                  </div>
                  <div>
                    <label>Payment frequency *</label>
                    <select value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}>
                      {FREQ_ORDER.map((f) => <option key={f} value={f}>{FREQUENCIES[f].label}</option>)}
                    </select>
                  </div>
                </div>

                <label>Duration — number of payments *</label>
                <input required type="number" min={1} value={form.numberOfPayments}
                  onChange={(e) => setForm({ ...form, numberOfPayments: e.target.value })} />

                {/* live summary */}
                <div className="summary">
                  <div className="summary-title">Mandate summary</div>
                  <div className="summary-row">
                    <div><div className="summary-label">Per payment</div><div className="summary-val">{fmt(perPayment)} {unit}</div></div>
                    <div className="summary-x">×</div>
                    <div><div className="summary-label">Payments</div><div className="summary-val">{payments}</div></div>
                    <div className="summary-x">=</div>
                    <div><div className="summary-label">Total</div><div className="summary-val accent">{fmt(total)} {unit}</div></div>
                  </div>
                  <div className="dim center" style={{ marginTop: 8, fontSize: 12 }}>{durationSummary(form.frequency, payments)}</div>
                </div>

                <button disabled={creating} className="btn-cta">{creating ? 'Deploying…' : 'Deploy Mandate'}</button>
              </form>

              {created && (
                <div className="checkout-link">
                  <div className="dim" style={{ fontSize: 12, marginBottom: 6 }}>Share this checkout link with the customer:</div>
                  <a className="mono" href={checkoutUrl(created.id)} target="_blank" rel="noreferrer">
                    {checkoutUrl(created.id)}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Recent Mandates */}
          <section>
            <div className="glass-card" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="flex-between" style={{ padding: 'var(--gutter)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex-between" style={{ gap: 8 }}>
                  <span className="material-symbols-outlined text-secondary">history</span>
                  <h2 className="card-title" style={{ margin: 0 }}>Recent Mandates</h2>
                </div>
                <a href="/activity" className="link-btn">View All</a>
              </div>

              <div className="table-wrap" style={{ flexGrow: 1 }}>
                {loadErr && mandates.length > 0 && (
                  <div style={{ padding: '12px var(--gutter) 0' }}>
                    <InlineError message={loadErr} onRetry={load} />
                  </div>
                )}

                {!loaded ? (
                  <SkeletonTable rows={5} />
                ) : loadErr && mandates.length === 0 ? (
                  <ErrorState message={loadErr} onRetry={load} />
                ) : mandates.length === 0 ? (
                  <EmptyState icon="receipt_long" title="No mandates yet"
                    hint="Create your first recurring mandate with the form on the left to see it appear here." />
                ) : (
                <table className="sm-table">
                  <thead>
                    <tr>
                      <th>Mandate</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="t-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandates.slice(0, 8).map((m) => {
                      const sym = m.tokenSymbol || 'tokens';
                      const freqShort = FREQUENCIES[(m.frequency as Frequency)]?.label.split(' ')[0] || m.frequency;
                      const canStop = m.status === 'ACTIVE' || m.status === 'PENDING_AUTH';
                      return (
                        <tr key={m.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="mono" style={{ color: 'var(--on-surface)' }}>{shortId(m.id)}</span>
                              <span className="dim" style={{ fontSize: 12 }}>Created {relTime(m.createdAt)}</span>
                            </div>
                          </td>
                          <td>
                            <span className="mono" style={{ color: 'var(--on-surface)' }}>
                              {formatAmount(m.debitAmount, m.decimals)} {sym} / {freqShort}
                            </span>
                          </td>
                          <td><span className={`pill ${m.status}`}>{m.status.replace('_', ' ')}</span></td>
                          <td className="t-right">
                            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
                              <button className="link-btn" onClick={() => copyLink(m.id)} title="Copy checkout link">
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>content_copy</span>
                                Link
                              </button>
                              {canStop && (
                                <button className="link-btn" style={{ color: 'var(--error)' }} onClick={() => cancelMandate(m.id)}>
                                  Stop
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <div className={`toast${toast ? ' show' : ''}`}>
        <span className="material-symbols-outlined text-tertiary">check_circle</span>
        <span>{toast}</span>
      </div>
    </>
  );
}
