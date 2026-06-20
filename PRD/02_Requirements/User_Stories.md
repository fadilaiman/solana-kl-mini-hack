# User Stories

> Status: Planning. Format: *As a … I want … so that …* with acceptance hints.

## Merchant

- **US-M1** — As a merchant, I want to create a billing plan with an amount, frequency, and number of payments, so that I can charge customers on a schedule.
  - *Accept:* mandate created with correct base-unit amount; checkout link returned.
- **US-M2** — As a merchant, I want to enter either a per-payment amount or a total to auto-divide, so that I can model plans the way I think about them.
  - *Accept:* summary shows per-payment × count = total.
- **US-M3** — As a merchant, I want a shareable checkout link, so that I can send it to a customer.
  - *Accept:* opening the link shows the plan and a connect-wallet action.
- **US-M4** — As a merchant, I want to see which mandates are active, pending, or failing, so that I can manage my revenue.
- **US-M5** — As a merchant, I want to stop a mandate, so that I can end a subscription.

## Customer

- **US-C1** — As a customer, I want to see exactly what I'm authorizing (amount, cadence, cap), so that I can trust it.
- **US-C2** — As a customer, I want to authorize once, so that I don't have to sign every cycle.
  - *Accept:* after one signature the mandate is active; no further prompts.
- **US-C3** — As a customer, I don't want to pay gas for the recurring charges, so that I pay only the sticker price.
- **US-C4** — As a customer, I want to cancel anytime by revoking on-chain, so that I'm always in control.
  - *Accept:* after revoke, no further debits succeed.
- **US-C5** — As a customer, I want to view my subscriptions for my wallet, so that I can manage them.

## Operator

- **US-O1** — As an operator, I want the debit engine to run automatically, so that collections happen without me.
- **US-O2** — As an operator, I want to see failed debits and reasons, so that I can act.
- **US-O3** — As an operator, I want to keep the fee-payer funded, so that gas-absorbed debits keep working.
- **US-O4** — As an operator, I want a guarded trigger, so that no one can run the sweep without authorization.

## Developer

- **US-D1** — As a developer, I want a REST API to create and read mandates, so that I can integrate billing into my app.
- **US-D2** — As a developer, I want clear mandate states and errors, so that I can handle them deterministically.
- **US-D3** — As a developer, I want a mock mode and a fast test cadence, so that I can test recurring flows quickly.

## Prioritization (MoSCoW)

- **Must:** US-M1, US-M3, US-C1, US-C2, US-C3, US-C4, US-O1, US-O4.
- **Should:** US-M2, US-M4, US-M5, US-C5, US-O2, US-O3, US-D1, US-D2.
- **Could:** US-D3 (mock mode), per-wallet analytics.
