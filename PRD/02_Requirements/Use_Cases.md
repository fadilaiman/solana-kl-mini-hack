# Use Cases

> Status: Planning. Detailed primary/alternate/exception flows.

## UC-1 Create mandate

- **Actor:** Merchant
- **Pre:** Merchant has a receiving wallet address.
- **Main flow:**
  1. Merchant submits terms (wallet, token, amount, frequency, count).
  2. System validates inputs and resolves token decimals.
  3. System computes per-cycle base-unit amount and total cap.
  4. System persists mandate as `PENDING_AUTH` and returns id + checkout URL.
- **Alternates:** Total-amount mode → system divides by count.
- **Exceptions:** Invalid address/mint → 400; amount below smallest unit → 400.

## UC-2 Authorize mandate

- **Actor:** Customer
- **Pre:** Mandate is `PENDING_AUTH`; customer holds the settlement token.
- **Main flow:**
  1. Customer opens checkout and reviews terms + cap.
  2. Customer connects wallet and signs `approveChecked` for the total cap.
  3. System verifies delegation on-chain and sets `ACTIVE`, scheduling first debit.
- **Exceptions:**
  - No token account → prompt to fund first.
  - Slow confirmation → server re-verifies before failing.
  - Delegation not found → remain `PENDING_AUTH`, surface retry message.

## UC-3 Execute due debits

- **Actor:** Scheduler (system)
- **Pre:** One or more `ACTIVE` mandates are due.
- **Main flow:**
  1. Trigger fires (guarded by secret).
  2. System selects due mandates.
  3. For each: verify allowance ≥ cycle amount; pull funds via `transferChecked` (gas-absorbed); log success; advance schedule; mark `COMPLETED` if last cycle.
- **Exceptions:**
  - Allowance/balance insufficient → mark `EXHAUSTED`.
  - Transfer fails → log failure + reason; retry next cycle.

## UC-4 Customer cancels (on-chain revoke)

- **Actor:** Customer
- **Pre:** Mandate is `ACTIVE`; customer controls the payer wallet.
- **Main flow:**
  1. Customer opens their subscription and chooses Cancel.
  2. Customer signs `revoke`, removing delegation.
  3. System records `REVOKED` + revoke signature; engine stops.
- **Exceptions:** Wrong wallet connected → block with guidance.

## UC-5 Operator stops a mandate

- **Actor:** Operator
- **Main flow:** Operator triggers stop → status `REVOKED` (off-chain) → engine ceases collecting.
- **Note:** On-chain allowance persists until the customer revokes.

## UC-6 Lookup a wallet

- **Actor:** Any user
- **Main flow:** Enter a wallet → system returns mandates where it is merchant or payer, plus stats and history.

## UC-7 Verify a payment

- **Actor:** Any user
- **Main flow:** From activity/dashboard, open the transaction on a public block explorer to confirm settlement independently.
