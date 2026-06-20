// Default settlement token. Hard-coded to Circle's devnet USDC so merchants
// never need to paste a mint. Override is still possible via the form's
// "Advanced" section (or by sending `mint` in the API body).
export const DEFAULT_TOKEN = {
  mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Circle devnet USDC
  symbol: 'USDC',
  decimals: 6,
  label: 'USDC · devnet',
};
