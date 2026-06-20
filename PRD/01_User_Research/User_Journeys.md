# User Journeys

> Status: Planning. End-to-end journeys the product must support.

## Journey A — Merchant creates a billing mandate

1. Maya opens the operator dashboard.
2. She enters her **receiving wallet**, the **settlement token** (default stablecoin), **amount per payment** (or total to auto-divide), **frequency**, and **number of payments**.
3. The product shows a live **summary** (per payment × count = total, over N periods).
4. She submits and receives a **hosted checkout link**.
5. She shares the link with her customer (email, app, QR).

**Outcome:** A `PENDING_AUTH` mandate exists with a shareable link.

## Journey B — Customer authorizes (one-time)

1. Deon opens the checkout link.
2. He sees exactly what he's authorizing: amount per cycle, cadence, and **total cap**.
3. He connects his Solana wallet.
4. He signs **one** `approve` transaction delegating the capped allowance to the platform.
5. The page confirms the subscription is **active**.

**Outcome:** Mandate becomes `ACTIVE`; no further customer action needed.

## Journey C — Automatic recurring collection

1. On schedule, the platform detects the mandate is **due**.
2. The platform pulls the fixed amount from the customer's token account to the merchant, **paying the network fee itself**.
3. The payment is recorded and made verifiable on a public explorer.
4. Steps repeat each cycle until the plan completes or is canceled.

**Outcome:** Merchant receives funds automatically; customer's balance is debited exactly the agreed amount.

## Journey D — Customer cancels (trustless)

1. Deon returns to his subscription (via dashboard → his checkout link).
2. He connects the authorizing wallet and chooses **Cancel**.
3. He signs an on-chain **revoke**, removing the platform's delegation.
4. The system marks the mandate canceled; no further pulls are possible.

**Outcome:** Mandate becomes `REVOKED`; the chain guarantees no future charges.

## Journey E — Operator monitors & intervenes

1. Priya reviews active mandates, pending payments, and failures.
2. She tops up the fee-payer when low.
3. If needed, she **stops** a mandate (off-chain) so the engine ceases collecting.

**Outcome:** Healthy operations and an auditable activity trail.

## Journey F — Merchant/customer self-service lookup

1. Any user enters a wallet address on a dashboard.
2. They see, for that wallet, what it is **receiving** (as merchant) and **paying** (as customer), with stats and transaction history.

**Outcome:** Transparent, per-wallet view without any login.
