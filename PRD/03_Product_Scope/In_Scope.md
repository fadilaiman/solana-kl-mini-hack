# In Scope (v1)

> Status: Planning. What the first build will deliver.

## Core protocol
- One-time SPL-token authorization (`approveChecked`) delegating a capped allowance to the platform key.
- Recurring pulls (`transferChecked`) signed by the platform as delegate, with **platform-absorbed gas**.
- On-chain **revoke** for trustless customer cancellation.
- Per-mandate spend cap enforced by the token program.

## Settlement
- **Token-agnostic** settlement on any SPL mint, with a configured **default stablecoin**.
- Amounts entered and displayed in the token's own units, stored in base units.

## Scheduling
- Per-mandate cadence: a fast **testing** interval plus **daily / weekly / monthly**.
- Automated trigger (cron-style) that debits all due mandates.

## Surfaces
- **Operator dashboard** (create mandates, view all, stop mandates).
- **Hosted checkout** (customer authorize + cancel).
- **Per-wallet dashboard** (enter a wallet → receiving/paying + stats).
- **Activity feed** (payments + cancellations with explorer links).
- **REST API** for config and mandate lifecycle.

## Lifecycle & records
- States: `PENDING_AUTH → ACTIVE → COMPLETED | EXHAUSTED | REVOKED`.
- Append-only debit log; recorded revoke signatures.

## Operability
- Guarded trigger endpoint.
- **Mock mode** for fund-free demos/tests.
- Priority fee + retry for congestion resilience.
- Containerized deployment behind a reverse proxy with TLS.

## Target environment
- **Solana Devnet** for the initial build and demos.
