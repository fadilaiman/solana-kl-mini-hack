# Functional Requirements

> Status: Planning. "The system shall …" — each requirement is testable.

## FR-1 Mandate creation (Merchant)
- FR-1.1 The system shall let a merchant create a mandate specifying: receiving wallet, settlement token (mint), amount, frequency, and number of payments.
- FR-1.2 The system shall support two amount-entry modes: **per-payment** and **total (auto-divided)** across the number of payments.
- FR-1.3 The system shall default the settlement token to a configured stablecoin, while allowing an advanced override to any SPL mint.
- FR-1.4 The system shall read the token's decimals from chain (or a known default) and store amounts in base units.
- FR-1.5 The system shall reject amounts below the token's smallest unit and non-positive values.
- FR-1.6 On creation, the system shall return a unique mandate id and a shareable checkout URL, with status `PENDING_AUTH`.

## FR-2 Authorization (Customer)
- FR-2.1 The system shall present a hosted checkout showing per-payment amount, cadence, number of payments, total cap, and merchant.
- FR-2.2 The system shall let the customer connect a Solana wallet and sign a single `approveChecked` delegating the total cap to the platform key.
- FR-2.3 The system shall verify on-chain that the delegation was set to the platform key for at least one cycle's amount before activating.
- FR-2.4 The system shall tolerate slow network confirmation by re-verifying the delegation server-side before failing.
- FR-2.5 On verified authorization, the system shall set the mandate to `ACTIVE` and schedule the first debit.

## FR-3 Recurring collection (Engine)
- FR-3.1 The system shall, on a recurring trigger, select all `ACTIVE` mandates whose next-debit time has elapsed.
- FR-3.2 For each due mandate, the system shall pull the fixed per-cycle amount from the customer to the merchant via `transferChecked`, signed by the platform key as delegate.
- FR-3.3 The system shall pay the network fee from the platform fee-payer (gas-absorbed) and create the merchant's token account if missing.
- FR-3.4 The system shall record each attempt in an append-only debit log with a unique transaction signature and success/failure + reason.
- FR-3.5 The system shall advance the next-debit time per the mandate's frequency after each cycle.
- FR-3.6 The system shall mark a mandate `COMPLETED` when all cycles are collected, and `EXHAUSTED` if the remaining allowance/balance can no longer cover a cycle.
- FR-3.7 The cadence shall be configurable per mandate (e.g., testing/10-min, daily, weekly, monthly).

## FR-4 Cancellation
- FR-4.1 The system shall let the **customer** cancel by signing an on-chain `revoke` that removes the platform's delegation, then mark the mandate `REVOKED`.
- FR-4.2 The system shall let the **operator** stop a mandate off-chain (status `REVOKED`) so the engine ceases collecting.
- FR-4.3 The cancel operation shall be idempotent and shall record who canceled and the revoke signature (if on-chain).
- FR-4.4 After cancellation, the engine shall never debit the mandate again.

## FR-5 Visibility & records
- FR-5.1 The system shall provide an operator view of all mandates with status and recent transactions.
- FR-5.2 The system shall provide a per-wallet dashboard (enter any wallet) showing what it is receiving (merchant) and paying (customer), plus summary stats (active, pending payments, awaiting signature, failed) and next charge.
- FR-5.3 The system shall provide a global activity feed of payments and cancellations, each with a public explorer link where applicable.
- FR-5.4 The system shall expose mandate and config data via a REST API.

## FR-6 Operability
- FR-6.1 The recurring trigger shall be guarded by a shared secret.
- FR-6.2 The system shall support a **mock mode** that exercises the full lifecycle without real on-chain transactions (for testing/demos).
- FR-6.3 The system shall add a priority fee and retry transient failures to improve transaction landing under network congestion.
