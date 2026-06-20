# Goals and Objectives

> Status: Planning.

## Primary goal

Deliver a working protocol + hosted product that lets a merchant collect **capped, recurring, gas-absorbed stablecoin payments** from a customer who authorizes **once** and can **revoke anytime**.

## Objectives (what we will achieve)

### O1 — One-time authorization
The customer will sign exactly one on-chain transaction (`approve`) to start a subscription. No further customer action will be required for subsequent cycles.

### O2 — Capped, enforceable spend
The total amount the platform can ever pull will be bounded by the customer's approved allowance, enforced by the SPL token program — not by platform honesty.

### O3 — Gas absorbed
The platform will pay all network fees for recurring debits (and ideally the authorization), so the customer needs only the settlement token.

### O4 — Automated scheduling
The system will automatically execute due debits on a configurable cadence (e.g., daily, weekly, monthly) without human intervention.

### O5 — Trustless cancellation
The customer will be able to cancel at any time by revoking the on-chain delegation, after which no further pulls are possible.

### O6 — Merchant simplicity
A merchant will be able to create a billing mandate and obtain a shareable checkout link without writing blockchain code, via a dashboard and REST API.

### O7 — Verifiable activity
Every payment and cancellation will be independently verifiable on a public block explorer, and surfaced in-product.

## Objectives we explicitly defer (later phases)

- Mainnet deployment and production-grade key management (HSM/KMS).
- Merchant authentication and multi-tenant accounts.
- Fiat on/off ramps, multi-chain support, and dynamic FX pricing.

## How objectives map to success

| Objective | Proven by (see Success_Metrics_KPIs.md) |
|-----------|------------------------------------------|
| O1, O3 | Checkout completion rate; "zero repeat signatures" |
| O2, O5 | On-chain cap never exceeded; revoke success rate |
| O4 | Debit success rate; on-time execution rate |
| O6 | Time-to-first-mandate for a new merchant |
| O7 | % of payments with a verifiable explorer link |
