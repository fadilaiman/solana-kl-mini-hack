# Assumptions

> Status: Planning. If any of these prove false, scope or design must change.

## Protocol assumptions
- **A1** — SPL token `approveChecked` + `transferChecked` delegation is sufficient to implement capped recurring pulls without a custom on-chain program in v1.
- **A2** — A delegate (the platform key) can transfer up to the delegated amount and the token program prevents exceeding it.
- **A3** — When delegated amount reaches zero, the delegation clears automatically, providing a natural cap.
- **A4** — Customers will primarily settle in **stablecoins**, so a fixed token amount ≈ a fixed real-world value.

## Customer/merchant assumptions
- **A5** — Customers will sign a single capped approval if cancellation is genuinely one-click and trustless.
- **A6** — Customers hold (or can easily obtain) the settlement token in a standard Solana wallet.
- **A7** — Merchants will accept stablecoin settlement given materially lower fees than cards.
- **A8** — The customer's token account exists (or is created) before authorization.

## Operational assumptions
- **A9** — The platform fee-payer can be kept funded with enough native SOL to cover gas + token-account rent.
- **A10** — A minute-level scheduler is sufficient granularity for the supported cadences.
- **A11** — Network fees remain negligible relative to payment size.
- **A12** — Public RPC (or a provider endpoint) is available and reliable enough; congestion is handled via priority fees + retries.

## Product assumptions
- **A13** — Open (no-login) dashboards are acceptable for v1 because all data is public on-chain and cancellation is wallet-gated.
- **A14** — A fixed amount per cycle (not metered/variable) covers the majority of target use cases.

## Validation plan
- A1–A3 validated by end-to-end devnet tests (authorize → debit → cap → revoke).
- A4–A7 validated via interviews and checkout completion data.
- A9–A12 validated by load and chaos testing on devnet.
