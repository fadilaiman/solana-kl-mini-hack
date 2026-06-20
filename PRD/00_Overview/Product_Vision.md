# Product Vision

> Status: Planning. Describes the intended end-state of the product.

## Vision statement

**Solemandate will be the "Stripe Billing" of stablecoins** — the simplest way for any business to charge recurring payments on-chain, where the customer authorizes once and never has to think about it again, and never pays a network fee.

## The future we are building toward

Today, recurring revenue businesses that want to accept crypto face an impossible trade-off: card rails are expensive and exclude the unbanked, while existing Web3 "subscriptions" force the customer to manually sign a transaction every single billing cycle — which no real subscription business can survive.

Solemandate will close that gap. We envision a world where:

- A SaaS company, gym, streaming service, or lender can offer **"pay with stablecoin"** as a first-class recurring option.
- A customer signs **one** approval and is billed automatically, exactly like a card on file — but **self-custodial** and **revocable at will**.
- The business pays a fraction of card fees, settles instantly, and reaches a global, wallet-native audience.
- The customer is mathematically protected: the protocol can never pull more than the cap they approved, and they can cut off access in one click.

## Guiding principles

1. **One signature, then invisible.** The customer's only on-chain action is the initial authorization. Everything after is automatic.
2. **Gas is the platform's problem, not the customer's.** Customers pay the exact sticker price; the platform absorbs network fees.
3. **Trustless by default.** The customer holds the off-switch (on-chain revoke). No support ticket required to cancel.
4. **Token-agnostic.** Any SPL token can be the settlement asset; stablecoins are the primary use case.
5. **Developer-friendly.** A clean REST API and hosted checkout so a merchant can integrate in an afternoon.

## What success looks like (north star)

Merchants choose Solemandate because it is **cheaper, faster, and more global** than cards, and customers accept it because it is **as easy as a card but safer**. The protocol becomes the default recurring-payments primitive for stablecoin commerce.

## Non-goals for the vision

- We are **not** building a wallet, a stablecoin, or an exchange.
- We are **not** building a general payments processor for one-off checkouts (recurring is the wedge).
- We are **not** custodial — we never hold customer funds.
