# Data Model

> Status: Planning. Proposed relational schema (indicative).

## Entities

### User (optional in v1)
Reserved for future merchant accounts; not required for the open v1.
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| email | string | unique |
| createdAt | datetime | |

### Mandate
The core agreement: who pays whom, how much, how often, and its lifecycle.
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK; used in checkout URL |
| payer | string? | customer wallet (set on authorize) |
| merchant | string | receiving wallet |
| mint | string | SPL token mint (defaults to configured token) |
| decimals | int | cached from chain |
| tokenSymbol | string? | display label |
| currency | string | display currency label (defaults to token symbol) |
| maxAmount | bigint | total allowance approved (base units) |
| debitAmount | bigint | fixed amount per cycle (base units) |
| frequency | string | `testing_10m`/`daily`/`weekly`/`monthly` |
| totalCycles | int | number of payments |
| lastDebitedAt | datetime? | |
| nextDebitAt | datetime | drives the sweep |
| approveTx | string? | authorization signature |
| revokeTx | string? | on-chain cancel signature |
| canceledBy | string? | `customer`/`operator` |
| status | string | `PENDING_AUTH`/`ACTIVE`/`COMPLETED`/`EXHAUSTED`/`REVOKED` |
| createdAt / updatedAt | datetime | |

Indexes: `(status, nextDebitAt)` for efficient sweep selection; lookups by `merchant`/`payer`.

### DebitLog
Append-only record of every collection attempt.
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| mandateId | uuid | FK → Mandate (cascade delete) |
| txSignature | string | unique; on-chain signature (or mock/failed marker) |
| amountDebited | bigint | base units |
| status | string | `SUCCESS`/`FAILED` |
| errorMessage | string? | reason on failure |
| executedAt | datetime | |

## Relationships
```
User (0..1) ──< Mandate (1) ──< DebitLog (0..*)
```

## Lifecycle (state machine)
```
PENDING_AUTH ──authorize──▶ ACTIVE ──last cycle──▶ COMPLETED
                              │  ├─ allowance/balance short ──▶ EXHAUSTED
                              │  └─ customer revoke / operator stop ──▶ REVOKED
```

## Derived/computed values
- `collected` = count of `SUCCESS` debit logs.
- `pendingPayments` = `totalCycles − collected` for `ACTIVE` mandates.
- Human amount = `baseUnits / 10^decimals`.

## Money & precision rules
- Store all amounts as **integer base units** (`bigint`); never floats.
- Resolve `decimals` from the mint (or known default) at creation.
- BigInt values are serialized as strings over the API.

## Data integrity
- `txSignature` unique → prevents duplicate log rows.
- Per-cycle update + log written in a single transaction → no double-charge within a cycle.
- `nextDebitAt` stored in UTC.
