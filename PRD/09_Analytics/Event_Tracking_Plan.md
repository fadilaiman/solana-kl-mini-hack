# Event Tracking Plan

> Status: Planning. Events to instrument for product + operational analytics.

## Principles
- Track the **mandate lifecycle** and **funnel** events.
- Prefer deriving truth from the **debit log + mandate state** (server-side) over client events.
- Avoid PII; use wallet addresses and mandate ids as identifiers.

## Lifecycle events (server-side, source of truth)

| Event | When | Key properties |
|-------|------|----------------|
| `mandate_created` | POST /mandates succeeds | mandateId, merchant, mint, debitAmount, frequency, totalCycles |
| `mandate_authorized` | status → ACTIVE | mandateId, payer, approveTx |
| `debit_succeeded` | SUCCESS log written | mandateId, amount, txSignature, cycleIndex |
| `debit_failed` | FAILED log written | mandateId, amount, reason |
| `mandate_completed` | status → COMPLETED | mandateId, totalCollected |
| `mandate_exhausted` | status → EXHAUSTED | mandateId, reason |
| `mandate_canceled` | status → REVOKED | mandateId, canceledBy, revokeTx?, cyclesCollected |

## Funnel events (checkout)

| Event | When | Properties |
|-------|------|-----------|
| `checkout_opened` | checkout page loaded | mandateId |
| `wallet_connected` | wallet connect succeeds | mandateId, walletKind |
| `approve_submitted` | approve tx sent | mandateId |
| `approve_confirmed` | activation succeeds | mandateId |
| `approve_failed` | error/timeout | mandateId, stage |

## Operational events

| Event | When | Properties |
|-------|------|-----------|
| `sweep_run` | sweep executes | processedCount, dueCount |
| `feepayer_low` | balance below threshold | balance |
| `rpc_error` | RPC failure during op | op, reason |

## Identifiers & hygiene
- `mandateId` (primary), `merchant`/`payer` wallet addresses, `txSignature`.
- No emails/PII in v1.
- Timestamps in UTC.

## Implementation notes
- Lifecycle/operational events emitted from the backend at state transitions.
- Funnel events may be emitted client-side but reconciled against server truth.
- A future warehouse/export can consume these for dashboards (see Reporting_Requirements.md).
