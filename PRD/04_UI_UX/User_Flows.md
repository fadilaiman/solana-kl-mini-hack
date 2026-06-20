# User Flows

> Status: Planning. Screen-level flows the UI must support.

## Surfaces (proposed)
- **Operator dashboard** (`/`) — create mandates; list all; stop mandates; wallet lookup; nav to activity/my-dashboard.
- **Hosted checkout** (`/checkout/{mandateId}`) — customer authorize + cancel.
- **My dashboard** (`/dashboard`) — enter a wallet → stats + receiving/paying lists.
- **Activity feed** (`/activity`) — global payments + cancellations with explorer links.

## Flow 1 — Create mandate (operator)
```
[/] Enter terms ──▶ live summary updates ──▶ Submit
        │                                       │
        └──────── validation error ◀───────────┘
Submit ──▶ mandate created (PENDING_AUTH) ──▶ checkout link shown ──▶ copy/share
```

## Flow 2 — Authorize (customer)
```
[/checkout/{id}] review amount + cadence + CAP
        │
   Connect wallet ──▶ wallet not detected? ──▶ guidance (use Solana wallet / in-app browser)
        │
   Approve (sign once) ──▶ slow confirm? ──▶ backend re-verifies ──▶ ACTIVE ✓
```

## Flow 3 — Recurring collection (system, visible in UI)
```
schedule due ──▶ debit pulled (gas-absorbed) ──▶ ledger increments ──▶ explorer link appears
(repeats each cycle until COMPLETED or canceled)
```

## Flow 4 — Cancel (customer)
```
[/dashboard] find subscription ──▶ "manage / cancel" ──▶ [/checkout/{id}]
        │
   Connect authorizing wallet ──▶ Cancel ──▶ sign revoke ──▶ REVOKED ✓ (no more pulls)
```

## Flow 5 — Lookup / proof
```
[/dashboard] enter wallet ──▶ stats (active, pending, awaiting sig, failed) + receiving/paying
[/activity] payment/cancel rows ──▶ "verify on Solana Explorer ↗"
```

## State → UI mapping
| Mandate state | Checkout shows | Dashboard pill |
|---------------|----------------|----------------|
| PENDING_AUTH | Approve button | PENDING_AUTH |
| ACTIVE | "Active" + Cancel (for payer) | ACTIVE |
| COMPLETED | "Completed" notice | COMPLETED |
| EXHAUSTED | "Stopped" notice | EXHAUSTED |
| REVOKED | "Canceled" notice | REVOKED |
```
