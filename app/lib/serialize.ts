// Prisma BigInt fields can't be JSON.stringify'd directly. Convert to string.
export function jsonSafe<T>(value: T): any {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)),
  );
}

// Format a base-unit BigInt/string amount into a human decimal string.
export function formatAmount(base: bigint | string, decimals: number): string {
  const b = typeof base === 'string' ? BigInt(base) : base;
  if (decimals === 0) return b.toString();
  const neg = b < 0n;
  const s = (neg ? -b : b).toString().padStart(decimals + 1, '0');
  const intPart = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, '');
  return (neg ? '-' : '') + (frac ? `${intPart}.${frac}` : intPart);
}

// Parse a human decimal string into base units given decimals.
export function toBaseUnits(amount: string, decimals: number): bigint {
  const [int, frac = ''] = amount.trim().split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt((int || '0') + fracPadded);
}

// Convert a base-unit token amount into a currency value (e.g. RM) string,
// given the token decimals and the RM-per-token peg.
export function toCurrency(base: bigint | string, decimals: number, rmPerToken: number): string {
  const tokens = Number(formatAmount(base, decimals));
  return (tokens * rmPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
