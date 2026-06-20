# Dependencies

> Status: Planning.

## External / blockchain
- **Solana network** (Devnet for v1, Mainnet later) — settlement layer.
- **SPL Token program** — `approveChecked`, `transferChecked`, `revoke`, associated token accounts.
- **RPC endpoint** — read state, send/confirm transactions (public devnet RPC or a provider).
- **Settlement token mint** — a stablecoin mint (e.g., devnet USDC) as the default.
- **Block explorer** — public verification of transactions.
- **Token faucet(s)** — for devnet testing (native SOL + test stablecoin).

## Wallets
- **Wallet Standard–compatible Solana wallets** (e.g., Phantom, Solflare) for connect + sign on checkout.

## Platform / runtime
- **Container runtime** (Docker) — all services run in containers; no host installs.
- **Relational database** (PostgreSQL) — mandates, debit logs.
- **Web/app framework** (server-rendered React, e.g., Next.js) — UI + REST API.
- **ORM** (e.g., Prisma) — schema + DB access.
- **Reverse proxy + TLS** (nginx upstream + an edge proxy with certificates) — public HTTPS.
- **Scheduler** — a cron-style trigger (sidecar) that calls the guarded sweep endpoint.

## Secrets / configuration
- **Platform key** (delegate + fee-payer) secret — injected via env/secret store, never committed.
- **Trigger secret** — guards the sweep endpoint.
- **Environment config** — network, RPC URL, default token, cadence mode, mock flag.

## Internal cross-dependencies
- Checkout depends on the **config endpoint** (delegate pubkey, network).
- The engine depends on the **fee-payer being funded**.
- Dashboards depend on the **mandate API** (with wallet filtering).

## Risk if a dependency is unavailable
- RPC outage/congestion → degraded debit landing (mitigated by retries/priority fees; provider RPC as upgrade path).
- Fee-payer unfunded → debits cannot execute (mitigated by balance monitoring/alerts).
- Faucet limits (devnet) → testing friction (mitigated by self-minted test tokens / provider faucets).
