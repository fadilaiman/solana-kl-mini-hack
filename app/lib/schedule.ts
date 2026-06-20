// Per-mandate billing cadence. Each mandate stores its own frequency, so the
// schedule is computed from that — not a global env toggle.
export type Frequency = 'testing_10m' | 'daily' | 'weekly' | 'monthly';

export const FREQUENCIES: Record<Frequency, { label: string; durationUnit: string }> = {
  testing_10m: { label: 'Testing — every 10 min (demo)', durationUnit: '10-min cycles' },
  daily:       { label: 'Daily',   durationUnit: 'days' },
  weekly:      { label: 'Weekly',  durationUnit: 'weeks' },
  monthly:     { label: 'Monthly', durationUnit: 'months' },
};

export function isFrequency(v: string): v is Frequency {
  return v === 'testing_10m' || v === 'daily' || v === 'weekly' || v === 'monthly';
}

function addDays(base: Date, n: number): Date {
  return new Date(base.getTime() + n * 24 * 60 * 60 * 1000);
}

// Next debit timestamp from a base time, per the mandate's frequency.
export function nextDebitForFrequency(base: Date, freq: string): Date {
  switch (freq) {
    case 'daily':   return addDays(base, 1);
    case 'weekly':  return addDays(base, 7);
    case 'monthly':
      return new Date(base.getFullYear(), base.getMonth() + 1, base.getDate(),
        base.getHours(), base.getMinutes(), base.getSeconds());
    case 'testing_10m':
    default:        return new Date(base.getTime() + 10 * 60 * 1000);
  }
}

// Human "Over N days / weeks / months" summary for the create form.
export function durationSummary(freq: string, payments: number): string {
  const meta = FREQUENCIES[(isFrequency(freq) ? freq : 'testing_10m')];
  return `Over ${payments} ${meta.durationUnit}`;
}
