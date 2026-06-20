# Out of Scope (v1)

> Status: Planning. Explicitly excluded from the first build (candidates for later phases).

## Not in v1
- **Mainnet deployment** and production key custody (HSM/KMS, key rotation, multi-sig).
- **Merchant authentication / accounts** — v1 dashboards are open (no login); per-merchant auth comes later.
- **Fiat on/off ramps** — acquiring or cashing out stablecoins.
- **Multi-chain** support (EVM, etc.) — Solana only for v1.
- **Dynamic FX pricing** — billing a fixed fiat value that re-prices the token each cycle (v1 bills a fixed token amount; a fixed peg is display-only).
- **Variable/metered/usage-based billing** — v1 is fixed amount per cycle.
- **Dunning & retries beyond next-cycle** — sophisticated retry/grace logic and customer notifications.
- **Refunds/disputes/chargebacks** — crypto is push-final; merchant-side refunds are a separate flow.
- **Email/SMS notifications & receipts** — no messaging in v1.
- **Webhooks** — status changes are read via API polling in v1 (webhooks later).
- **Auto top-up of the fee-payer** — operator funds it manually in v1.
- **KYC/AML tooling** — no identity collection in v1.

## Why these are excluded now
- Keep v1 focused on proving the **core recurring-pull mechanism** end-to-end.
- Avoid premature investment in compliance/scale before product-market signal.
- Reduce surface area and risk for the initial release.

## Revisit triggers
- Merchant demand for login + multi-tenant → prioritize auth.
- Mainnet pilot interest → prioritize key custody + audits.
- Churn from failed debits → prioritize dunning + notifications.
