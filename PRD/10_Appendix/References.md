# References

> Status: Planning. Pointers to standards, tools, and internal docs.

## Blockchain & protocol
- **Solana documentation** — core concepts, transactions, fees, compute budget / priority fees.
- **SPL Token program** — `approveChecked`, `transferChecked`, `revoke`, delegation semantics, Associated Token Accounts.
- **Wallet Standard** — wallet ↔ dapp connection interface used by modern Solana wallets.
- **Solana Explorer** — public transaction verification (devnet/mainnet clusters).

## Tooling (proposed stack)
- **Server-rendered React framework** (e.g., Next.js) — UI + REST API in one deployable.
- **ORM** (e.g., Prisma) — schema + database access.
- **PostgreSQL** — relational store for mandates and debit logs.
- **Solana web3 + SPL token client libraries** — building/sending instructions.
- **Container runtime (Docker)** + **reverse proxy (nginx)** + **edge TLS**.

## Test resources (devnet)
- Native SOL faucet(s) for gas.
- Stablecoin (e.g., USDC) devnet faucet, or self-minted SPL test tokens.

## Internal documents
- `CLAUDE.md` — infrastructure/operational conventions for the deployment environment.
- `README.md` (repo) — run/deploy and demo runbook (once built).
- This PRD set (`PRD/`).

## Comparable products (context)
- **Stripe Billing / Checkout** — recurring billing UX reference.
- Existing crypto subscription experiments — for contrast on signing friction.

## Notes
- Specific versions, endpoints, and addresses are environment-specific and will be recorded in deployment config (not committed secrets).
