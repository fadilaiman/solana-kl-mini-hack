# Wireframes

> Status: High-fidelity mockups approved. See [`highfidelity/`](./highfidelity/) for the
> HTML reference designs the live frontend is built to match (home/merchant, dashboard,
> checkout, activity). The low-fidelity ASCII sketches below capture the original intent.

## Operator dashboard (`/`)
```
┌───────────────────────────────────────────────┐
│ ● Solemandate          my dashboard · activity │
│ [ 🔍 look up a wallet ……………… ] [My dashboard]  │
├──────────────────────┬────────────────────────┤
│ Create mandate        │ Mandate ledger          │
│  receiving wallet [..] │  0.1 USDC / Daily  ACTIVE│
│  token: USDC ▸adv      │  3/5 collected ▮▮▮▯▯     │
│  ( ) per-payment       │  view tx ↗   Stop mandate│
│  amount [..] freq [▼]  │  …                       │
│  duration [..]         │                          │
│  ┌ summary ──────────┐ │                          │
│  │ 0.1 × 5 = 0.5 USDC│ │                          │
│  └───────────────────┘ │                          │
│  [ Create mandate ]    │                          │
└──────────────────────┴────────────────────────┘
```

## Checkout (`/checkout/{id}`)
```
┌─────────────────────────────┐
│ You are authorizing          │
│        0.1 USDC              │
│   per cycle · 5 cycles       │
│   Total allowance: 0.5 USDC  │
│   Merchant: 8BUa…qAAV         │
│   [ Select Wallet ]          │
│   [ Approve 0.5 USDC ]       │
│   (active) ✓  Cancel ↩       │
└─────────────────────────────┘
```

## My dashboard (`/dashboard`)
```
[ wallet ……… ] [View dashboard]
┌ stats ─────────────────────────────┐
│ Active 1 | Pending 4 | AwaitSig 0 | Failed 0 │
│ Collected … | Paid … | Next charge … │
└────────────────────────────────────┘
Receiving (merchant)        Paying (customer)
  card …                      card … manage/cancel →
```

## Activity (`/activity`)
```
On-chain payments: 3 · Volume: 0.14 USDC · Cancellations: 1
− 0.1 USDC  payer → merchant  settled   verify ↗
⊘ Subscription canceled  revoked on-chain  verify ↗
```
