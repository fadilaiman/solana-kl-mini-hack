# Reporting Requirements

> Status: Planning.

## Audiences & their reports

### Operator (internal)
- **Engine health:** sweep throughput/latency, debit success rate, failure reason mix.
- **Fee-payer runway:** balance, burn rate, projected days remaining (with low-balance alert).
- **Pending work:** mandates awaiting authorization; due-but-failing mandates.

### Merchant (later, once accounts exist)
- **Revenue:** settled volume over time, by plan/frequency.
- **Subscribers:** active/pending/canceled counts; new vs. churned.
- **Upcoming:** projected collections (run-rate) and next charges.
- **Exports:** CSV of payments (date, payer, amount, token, signature) for accounting.

### Customer (self-service)
- **My subscriptions:** what they're paying, next charge, total paid, and a cancel path.

## In-product reporting (v1)
- **Operator dashboard:** all mandates + statuses + recent transactions.
- **Per-wallet dashboard:** stat tiles (active, pending payments, awaiting signature, failed), totals, next charge.
- **Activity feed:** chronological payments + cancellations with explorer links; headline volume + counts.

## Delivery & freshness
- v1 reporting is **live in-product** (auto-refreshing views) sourced from the API/DB.
- Later: scheduled exports (CSV), and a warehouse/BI pipeline fed by the event plan.

## Data sources
- **Authoritative financial truth:** on-chain transactions (explorer-verifiable).
- **Operational mirror:** mandates + debit logs in the database.
- **Event stream:** lifecycle/funnel/operational events (see Event_Tracking_Plan.md).

## Requirements
- Reports must **reconcile** with on-chain truth (exclude mock/failed markers from real totals).
- All times shown with clear timezone (store UTC; display may localize).
- Numbers shown in the settlement token's correct precision.

## Future reporting
- Webhook-driven external dashboards for merchants.
- Tax/accounting exports and reconciliation tooling.
- Cohort/retention analytics in a BI tool.
