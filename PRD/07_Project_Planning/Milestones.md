# Milestones

> Status: Planning. Outcome-based milestones (not dates — see Timeline.md).

## M0 — Foundations
- Containerized skeleton (app, database, proxy, scheduler), environment config, secrets handling.
- Data model and migrations for `Mandate` and `DebitLog`.
- **Exit:** services run locally; schema applied; config endpoint returns the delegate key.

## M1 — Mandate creation
- Merchant can create a mandate (per-payment & total modes); token decimals resolved; checkout link issued.
- **Exit:** valid mandate persisted as `PENDING_AUTH`; invalid input rejected with clear errors.

## M2 — Authorization
- Hosted checkout: connect wallet, sign `approveChecked`, server verifies delegation, mandate → `ACTIVE`.
- **Exit:** an authorized mandate is verifiably active on devnet.

## M3 — Debit engine + scheduler
- Guarded sweep executes due debits via `transferChecked` (gas-absorbed), logs results, advances schedule, transitions terminal states.
- Cron sidecar drives it; cadence is per-mandate.
- **Exit:** a mandate is collected automatically across multiple cycles to `COMPLETED`.

## M4 — Cancellation
- Customer on-chain `revoke` + operator stop; engine ceases collecting; idempotent.
- **Exit:** revoked mandate cannot be debited again; cancellation recorded.

## M5 — Visibility & verifiability
- Operator dashboard, per-wallet dashboard with stats, activity feed with explorer links.
- **Exit:** lifecycle is fully observable; every real payment/cancel is verifiable on a public explorer.

## M6 — Resilience & demo-readiness
- Priority fees + retries; mock mode; congestion tolerance; runbook.
- **Exit:** end-to-end flow is reliable on devnet and demoable without fund friction.

## M7 — Pre-mainnet hardening (gate)
- Security review/audit; KMS/HSM key custody; rate limiting; monitoring/alerts; (optional) merchant auth.
- **Exit:** passes the security & compliance gates required to consider mainnet.

## Stretch (post-v1)
- Webhooks, notifications/receipts, dunning, exports, dynamic fiat pegging, multi-chain.
