# Release Plan

> Status: Planning.

## Release stages

### R0 — Internal alpha (Devnet)
- Audience: founding team.
- Scope: M0–M3 (create → authorize → automatic debit).
- Goal: prove the core loop end-to-end on devnet.
- Exit: a mandate collects automatically across cycles.

### R1 — Private beta (Devnet)
- Audience: a handful of friendly merchants + test customers.
- Scope: + M4–M6 (cancellation, dashboards, activity, resilience, mock mode).
- Goal: validate UX, reliability, and the demo narrative; gather feedback.
- Exit: KPIs trend toward targets; no cap-breach incidents; positive merchant feedback.

### R2 — Mainnet pilot (gated)
- Audience: 1–3 design-partner merchants with low volume.
- Scope: + M7 (security audit, KMS key custody, rate limiting, monitoring). Possibly merchant auth.
- Goal: real value, tightly monitored.
- Exit: clean audit; stable operations; compliance gate cleared for the pilot jurisdiction.

### R3 — General availability
- Audience: open merchant onboarding.
- Scope: + stretch items prioritized by beta feedback (webhooks, notifications, exports).
- Goal: scale adoption.

## Rollout mechanics
- **Feature flags / env config** to toggle mock mode, cadence, and (later) auth.
- **Backwards-compatible migrations**; additive schema changes preferred.
- **Runbook** for deploy, rollback, and fee-payer funding.

## Go / no-go criteria (per stage)
- No open critical security findings.
- Debit success rate and cap-safety meet thresholds.
- Fee-payer monitoring/alerting in place (from R2).
- Rollback path verified.

## Rollback strategy
- App is stateless (state in DB); roll back to the previous container image.
- Pause collections by disabling the scheduler (mandates remain intact).
- On-chain authorizations are unaffected by app rollbacks; customers retain revoke control at all times.
