# Integration Points

> Status: Planning.

## 1. Solana SPL Token program (core)
- **`approveChecked`** (client-signed by customer) — delegates a capped allowance to the platform key.
- **`transferChecked`** (server-signed by platform as delegate) — pulls a cycle's amount payer → merchant.
- **`revoke`** (client-signed by customer) — removes delegation (trustless cancel).
- **Associated Token Accounts** — derive payer/merchant token accounts; create merchant's idempotently (fee-payer pays rent).
- **Compute budget** — attach a priority fee to improve landing under congestion.

## 2. Solana RPC
- Read: token account state (delegate, delegated amount, balance), mint decimals, signature status.
- Write: send + confirm transactions.
- Upgrade path: provider RPC (with key) for reliability and higher rate limits beyond public endpoints.

## 3. Wallets (client)
- Connect + sign via the **Wallet Standard** (Phantom, Solflare, etc.).
- Desktop: browser extension. Mobile: wallet in-app browser (preferred) or mobile wallet adapter.

## 4. Block explorer
- Build deep links (`/tx/<sig>?cluster=<network>`) for independent verification in UI.

## 5. Token faucets (test environments)
- Native SOL faucet (fee-payer + customer gas) and a test stablecoin faucet, or self-minted test tokens for controlled testing.

## 6. Reverse proxy / TLS (edge)
- Edge proxy terminates HTTPS for the public domain and forwards to the internal nginx → app.

## 7. Scheduler
- Cron sidecar → guarded sweep endpoint (shared secret). External schedulers (provider cron) are an alternative.

## Internal contracts
- **Client ⇄ config endpoint:** delegate pubkey + network + mock flag (the client must never see the platform secret).
- **Client ⇄ authorize/cancel:** posts the signature; server independently verifies on-chain state.
- **Scheduler ⇄ sweep:** bearer-secret-guarded.

## Future integrations (later phases)
- **Webhooks** to merchant backends on lifecycle events.
- **KMS/HSM** for platform key custody.
- **Price oracle** for fiat-pegged dynamic billing.
- **Notification providers** (email/SMS) for receipts and dunning.
- **Accounting/exports** (CSV, accounting software) for merchant finance.
