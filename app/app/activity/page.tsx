'use client';

import { useEffect, useState } from 'react';
import { formatAmount } from '@/lib/serialize';
import { type Mandate, explorerUrl, shortAddr } from '@/app/components/MandateCard';
import { TopNav, Footer } from '@/app/components/Chrome';
import { SkeletonFeed } from '@/app/components/Skeleton';
import { InlineError, EmptyState } from '@/app/components/States';

type Event =
  | { kind: 'payment'; time: string; sym: string; amount: string; decimals: number; sig: string; status: string; payer: string | null; merchant: string }
  | { kind: 'cancel'; time: string; sym: string; payer: string | null; merchant: string; canceledBy: string | null; revokeTx: string | null };

const relTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return 'Just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function Activity() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadErr, setLoadErr] = useState('');
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

  const load = async () => {
    let mandates: Mandate[];
    try {
      const res = await fetch('/api/v1/mandates', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      mandates = await res.json();
      setLoadErr('');
    } catch (err: any) {
      setLoadErr(err?.message || 'Live feed is unreachable.');
      setLoaded(true);
      return;
    }
    const rows: Event[] = [];
    for (const m of mandates) {
      for (const l of m.debitLogs) {
        rows.push({
          kind: 'payment', time: l.executedAt, sym: m.tokenSymbol || 'tokens',
          amount: l.amountDebited, decimals: m.decimals, sig: l.txSignature,
          status: l.status, payer: m.payer, merchant: m.merchant,
        });
      }
      if (m.status === 'REVOKED') {
        rows.push({
          kind: 'cancel', time: m.updatedAt || m.createdAt, sym: m.tokenSymbol || 'tokens',
          payer: m.payer, merchant: m.merchant, canceledBy: m.canceledBy ?? null, revokeTx: m.revokeTx ?? null,
        });
      }
    }
    rows.sort((a, b) => +new Date(b.time) - +new Date(a.time));
    setEvents(rows);
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const success = events.filter((e) => e.kind === 'payment' && e.status === 'SUCCESS') as Extract<Event, { kind: 'payment' }>[];
  const totals: Record<string, { amt: bigint; decimals: number }> = {};
  for (const p of success) {
    totals[p.sym] = totals[p.sym] || { amt: 0n, decimals: p.decimals };
    totals[p.sym].amt += BigInt(p.amount);
  }
  const volume = Object.entries(totals).map(([sym, v]) => `${formatAmount(v.amt, v.decimals)} ${sym}`).join(' · ') || '$0.00';
  const cancels = events.filter((e) => e.kind === 'cancel').length;

  return (
    <>
      <TopNav active="activity" />

      <main className="container">
        {/* ── Header ── */}
        <section className="flex-between" style={{ flexWrap: 'wrap', gap: 24, alignItems: 'flex-end', marginBottom: 'var(--stack-lg)' }}>
          <div style={{ maxWidth: 640 }}>
            <h1 className="display-lg text-primary" style={{ marginBottom: 8 }}>Protocol Activity</h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--on-surface-variant)' }}>
              Real-time execution feed of recurring mandates on Solana. Every on-chain
              debit and cancellation, the moment it settles.
            </p>
          </div>
          <div className="live-badge">
            <span className="ping" />
            Live Feed Active
          </div>
        </section>

        {loadErr && <InlineError message={loadErr} onRetry={load} />}

        {/* ── Metrics bento ── */}
        <div className="bento stagger" style={{ marginBottom: 48 }}>
          <div className="glass-card bento-card hover-lift" style={{ ['--i' as string]: 0 }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>Total Volume Settled</div>
            <div className="bento-val text-secondary" style={{ fontSize: 32 }}>{volume}</div>
            <div className="status-dot text-tertiary" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>trending_up</span> on-chain &amp; verifiable
            </div>
          </div>
          <div className="glass-card bento-card hover-lift" style={{ ['--i' as string]: 1 }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>Total Charges Executed</div>
            <div className="bento-val" style={{ fontSize: 32 }}>{success.length.toLocaleString()}</div>
            <div className="status-dot text-primary" style={{ marginTop: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span> automated by the protocol
            </div>
          </div>
          <div className="glass-card bento-card hover-lift" style={{ ['--i' as string]: 2 }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>Cancellations</div>
            <div className="bento-val" style={{ fontSize: 32 }}>{cancels.toLocaleString()}</div>
            <div className="status-dot" style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>event_busy</span> revoked or stopped
            </div>
          </div>
        </div>

        {/* ── Live transactions feed ── */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div className="flex-between" style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
            <h3 className="card-title" style={{ margin: 0 }}>Live Transactions</h3>
          </div>

          {/* header row (desktop) */}
          <div className="feed-head">
            <div style={{ gridColumn: 'span 3' }}>Amount</div>
            <div style={{ gridColumn: 'span 3' }}>Payer</div>
            <div style={{ gridColumn: 'span 1', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>east</span>
            </div>
            <div style={{ gridColumn: 'span 3' }}>Merchant</div>
            <div style={{ gridColumn: 'span 1' }}>When</div>
            <div style={{ gridColumn: 'span 1', textAlign: 'right' }}>Tx</div>
          </div>

          <div>
            {!loaded && <SkeletonFeed rows={6} />}
            {loaded && events.length === 0 && (
              <EmptyState icon="bolt" title="No activity yet"
                hint="Once a mandate is authorized and the protocol starts collecting, debits stream in here in real time." />
            )}
            {events.map((e, i) => {
              if (e.kind === 'cancel') {
                const url = e.revokeTx ? explorerUrl(e.revokeTx, network) : null;
                return (
                  <div className="feed-row cancel" key={'c' + i}>
                    <div className="amount" style={{ gridColumn: 'span 3' }}>
                      <span className="d dot-grey" style={{ width: 8, height: 8, borderRadius: 999, display: 'inline-block' }} />
                      <span className="mono" style={{ color: 'var(--primary)' }}>⊘ Canceled</span>
                    </div>
                    <div className="mono dim" style={{ gridColumn: 'span 3' }}>{e.payer ? shortAddr(e.payer) : '—'}</div>
                    <div className="feed-arrow" style={{ gridColumn: 'span 1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>block</span>
                    </div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{shortAddr(e.merchant)}</span>
                      <span className="muted" style={{ fontSize: 12 }}>{e.canceledBy === 'customer' ? 'revoked on-chain' : 'stopped by operator'}</span>
                    </div>
                    <div className="dim mono" style={{ gridColumn: 'span 1' }}>{relTime(e.time)}</div>
                    <div style={{ gridColumn: 'span 1', textAlign: 'right' }}>
                      {url ? <a href={url} target="_blank" rel="noreferrer" className="text-primary"><span className="material-symbols-outlined">open_in_new</span></a> : <span className="dim">—</span>}
                    </div>
                  </div>
                );
              }
              const url = explorerUrl(e.sig, network);
              const ok = e.status === 'SUCCESS';
              return (
                <div className={`feed-row${i === 0 ? ' fresh' : ''}`} key={'p' + i}>
                  <div className="amount" style={{ gridColumn: 'span 3' }}>
                    <span className="d" style={{ width: 8, height: 8, borderRadius: 999, display: 'inline-block', background: ok ? 'var(--tertiary)' : 'var(--error)', boxShadow: ok ? '0 0 8px rgba(74,225,118,0.5)' : 'none' }} />
                    <span className="mono" style={{ color: ok ? 'var(--on-surface)' : 'var(--error)' }}>
                      {ok ? '' : '⚠ '}{formatAmount(e.amount, e.decimals)} {e.sym}
                    </span>
                  </div>
                  <div className="mono dim" style={{ gridColumn: 'span 3' }}>{e.payer ? shortAddr(e.payer) : '—'}</div>
                  <div className="feed-arrow" style={{ gridColumn: 'span 1' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </div>
                  <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{shortAddr(e.merchant)}</span>
                    {ok && <span className="material-symbols-outlined icon-fill text-primary" style={{ fontSize: 16 }}>verified</span>}
                  </div>
                  <div className="dim mono" style={{ gridColumn: 'span 1' }}>{relTime(e.time)}</div>
                  <div style={{ gridColumn: 'span 1', textAlign: 'right' }}>
                    {url
                      ? <a href={url} target="_blank" rel="noreferrer" className="text-primary"><span className="material-symbols-outlined">open_in_new</span></a>
                      : <span className="dim mono" title={e.sig}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── network status anchor ── */}
        <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ height: 1, width: 128, background: 'linear-gradient(to right, transparent, rgba(211,187,255,0.3), transparent)', marginBottom: 32 }} />
          <p className="mono dim" style={{ marginBottom: 16, letterSpacing: '0.1em' }}>SOLANA NETWORK · {network.toUpperCase()}</p>
          <div style={{ display: 'flex', gap: 32 }}>
            <div className="status-dot"><span className="d dot-green pulse" style={{ width: 8, height: 8, borderRadius: 999 }} /><span className="muted">Live polling every 5s</span></div>
            <div className="status-dot"><span className="material-symbols-outlined dim" style={{ fontSize: 18 }}>schedule</span><span className="muted">Non-custodial settlement</span></div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
