'use client';

import { formatAmount } from '@/lib/serialize';
import { FREQUENCIES, type Frequency } from '@/lib/schedule';

export interface DebitLog { id: string; status: string; amountDebited: string; txSignature: string; executedAt: string; errorMessage?: string | null; }
export interface Mandate {
  id: string; merchant: string; payer: string | null; mint: string; decimals: number;
  tokenSymbol: string | null; maxAmount: string; debitAmount: string; totalCycles: number;
  frequency: string; status: string; nextDebitAt: string; lastDebitedAt: string | null;
  revokeTx?: string | null; canceledBy?: string | null; updatedAt?: string;
  createdAt: string; debitLogs: DebitLog[];
}

export const explorerUrl = (sig: string, network: string) =>
  sig.startsWith('mock_') || sig.startsWith('FAILED_')
    ? null
    : `https://explorer.solana.com/tx/${sig}?cluster=${network}`;

export const shortAddr = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

export function MandateCard({ m, role, network }: { m: Mandate; role: 'merchant' | 'payer'; network: string }) {
  const collected = m.debitLogs.filter((l) => l.status === 'SUCCESS').length;
  const remaining = Math.max(0, m.totalCycles - collected);
  const pct = Math.min(100, Math.round((collected / m.totalCycles) * 100));
  const sym = m.tokenSymbol || 'tokens';
  const freqShort = FREQUENCIES[(m.frequency as Frequency)]?.label.split(' ')[0] || m.frequency;
  const movedAmt = formatAmount(BigInt(m.debitAmount) * BigInt(collected), m.decimals);

  return (
    <div className="ledger-item">
      <div className="flex-between">
        <strong>{formatAmount(m.debitAmount, m.decimals)} {sym} / {freqShort}</strong>
        <span className={`pill ${m.status}`}>{m.status}</span>
      </div>
      <div className="muted" style={{ marginTop: 4 }}>
        {role === 'merchant'
          ? <>from <span className="mono">{m.payer ? shortAddr(m.payer) : '— not yet authorized'}</span></>
          : <>to <span className="mono">{shortAddr(m.merchant)}</span></>}
        {' · '}{collected}/{m.totalCycles} cycles · {role === 'merchant' ? 'received' : 'paid'} {movedAmt} {sym}
        {m.status === 'ACTIVE' && remaining > 0 && <> · {remaining} pending</>}
      </div>
      <div className="progress"><div style={{ width: `${pct}%` }} /></div>

      {m.debitLogs.slice(0, 3).map((l) => {
        const url = explorerUrl(l.txSignature, network);
        return (
          <div key={l.id} className="flex-between" style={{ marginTop: 8 }}>
            <span className="mono" style={{ color: l.status === 'SUCCESS' ? 'var(--accent)' : 'var(--danger)' }}>
              {l.status === 'SUCCESS' ? '−' : '⚠ '}{formatAmount(l.amountDebited, m.decimals)} {sym}
            </span>
            {url
              ? <a className="mono" href={url} target="_blank" rel="noreferrer">view tx ↗</a>
              : <span className="mono muted">{l.txSignature.slice(0, 16)}…</span>}
          </div>
        );
      })}
      {m.status === 'PENDING_AUTH' && role === 'merchant' && (
        <div style={{ marginTop: 8 }}>
          <a className="mono" href={`/checkout/${m.id}`} target="_blank" rel="noreferrer">→ checkout link</a>
        </div>
      )}
      {m.status === 'ACTIVE' && role === 'payer' && (
        <div style={{ marginTop: 8 }}>
          <a className="mono" href={`/checkout/${m.id}`} style={{ color: 'var(--danger)' }} target="_blank" rel="noreferrer">
            manage / cancel subscription →
          </a>
        </div>
      )}
    </div>
  );
}
