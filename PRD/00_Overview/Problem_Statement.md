# Problem Statement

> Status: Planning.

## The core problem

**There is no good way to charge recurring payments in crypto.** Businesses that depend on subscriptions or installments cannot reliably bill a crypto-native customer, because every existing option breaks one of the two things subscriptions require: low friction and low cost.

## Why this matters now

- Stablecoins have become a mainstream settlement asset, but commerce tooling around them is still one-off and manual.
- Subscription and installment business models (SaaS, memberships, BNPL, lending repayments) are enormous and growing — yet effectively excluded from crypto rails.
- Card processors charge ~2.9% + fixed fees, hold funds for days, and exclude large unbanked populations that nonetheless hold stablecoins.

## What's broken with today's options

| Option | Why it fails for recurring billing |
|--------|-----------------------------------|
| **Card gateways** | High fees, slow settlement, chargebacks, geographic/banking exclusion. |
| **Manual crypto payment** | Customer must open a wallet and sign **every** cycle — unworkable for subscriptions; churn from forgotten payments. |
| **Custodial auto-billers** | Require handing funds/keys to a third party — defeats self-custody, adds counterparty risk and regulatory burden. |
| **Naive "pull" smart contracts** | Often over-scoped approvals, no spend cap clarity, customer pays gas each pull, poor UX. |

## The specific friction we will remove

1. **Repeated signing.** The customer should sign **once**, not every cycle.
2. **Gas friction.** The customer should never need native SOL or think about fees to be billed.
3. **Trust friction.** The customer should not have to trust the merchant/platform not to overcharge — the chain should enforce the cap.
4. **Integration friction.** The merchant should not need blockchain expertise — a hosted checkout + REST API should suffice.

## Problem in one sentence

> Crypto lacks a "card on file" — a way for a customer to authorize a capped, recurring, self-custodial pull once, and for a business to collect it automatically and cheaply.

## Evidence / assumptions to validate

- Merchants will accept stablecoin settlement if fees are materially lower than cards. *(Validate via merchant interviews.)*
- Customers will sign a one-time capped approval if cancellation is genuinely one-click and trustless. *(Validate via checkout completion rate.)*
- SPL token delegation (`approve` + `transferChecked`) is sufficient to implement capped recurring pulls without a custom on-chain program for v1. *(Technical assumption; see `05_Technical`.)*
