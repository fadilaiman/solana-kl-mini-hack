# Personas

> Status: Planning. Hypothesized personas to be validated through interviews.

## Persona 1 — "Maya," the Web3 SaaS founder (Merchant)

- **Role:** Founder of a small crypto-native SaaS / tooling company.
- **Goal:** Accept recurring stablecoin payments without paying card fees or building blockchain infra.
- **Context:** Technical enough to paste an API key and a wallet address; does not want to write Solana programs.
- **Needs:** A dashboard to define plans, a shareable checkout link, reliable automatic collection, clear records.
- **Frustrations:** Card fees, chargebacks, geographic restrictions, customers churning on manual payments.
- **Success for Maya:** Creates a plan in minutes, shares a link, watches revenue arrive automatically.

## Persona 2 — "Deon," the wallet-native customer (Payer)

- **Role:** Crypto user who holds stablecoins and prefers self-custody.
- **Goal:** Subscribe to a service and "set and forget," without losing control of funds.
- **Context:** Comfortable connecting a wallet and signing once; wary of unlimited approvals and scams.
- **Needs:** Clear display of exactly what he's authorizing (amount, cadence, cap), and a one-click way to cancel.
- **Frustrations:** Having to sign every month; unclear or unlimited token approvals; no easy way to stop a recurring charge.
- **Success for Deon:** Signs once, sees a clear cap, and can revoke instantly when he wants out.

## Persona 3 — "Priya," the platform operator (Internal)

- **Role:** Runs the Solemandate service (initially the founding team).
- **Goal:** Keep the debit engine healthy, the fee-payer funded, and merchants happy.
- **Needs:** Visibility into mandates, failed debits, and fee-payer balance; ability to stop a mandate.
- **Frustrations:** Silent failures, an empty gas tank, no audit trail.
- **Success for Priya:** Operates the system with confidence and a clear activity log.

## Persona 4 — "Sam," the integrating developer (Merchant-side)

- **Role:** Engineer integrating Solemandate into a merchant's app/backend.
- **Goal:** Create mandates and read their status programmatically.
- **Needs:** A predictable REST API, clear data model, webhooks/polling for status changes.
- **Frustrations:** Under-documented APIs, ambiguous states, no idempotency.
- **Success for Sam:** Integrates against the API in an afternoon with no surprises.

## Secondary / future personas

- **Compliance officer** (for a regulated merchant) — needs auditable records and revocation guarantees.
- **Treasury manager** — reconciles incoming stablecoin against expected schedules.
