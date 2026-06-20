# Solemandate

On-chain automated **direct debit** for subscriptions on Solana. A merchant defines
recurring terms; a payer connects a wallet once and signs a single SPL-token `approve`;
the platform then pulls a fixed amount each cycle via `transferChecked`, **absorbing the gas**.

Token-agnostic (any SPL mint), Solana **devnet**, 100% Docker. See `CLAUDE.md` for the
infra rules (ports `14020–14029`, MYT timezone, bind mounts under `/data/solemandate`).

## Architecture

| Container | Port | Role |
|---|---|---|
| `solemandate-app`   | `14020→3000` | Next.js 14 (UI + `/api/v1/*`), Prisma |
| `solemandate-db`    | `14021→5432` | PostgreSQL 16 |
| `solemandate-nginx` | `14022→80`   | internal proxy (TLS is on rproxy) |
| `solemandate-cron`  | —            | hits the debit-sweep every minute |

Public URL `https://solemandate.saasku.my` → rproxy (`REDACTED`, TLS) → `REDACTED:14022`.
Apply `nginx/rproxy-solemandate.conf.example` on rproxy and point DNS at it.

## Run

A fresh copy boots with three commands — no host installs, everything runs in Docker.

```bash
cd /data/solemandate
cp .env.example .env                 # then fill in the REPLACE_ME secrets (see below)
docker compose up -d
docker compose logs -f app           # first boot installs deps + syncs schema
```

The `app` container installs npm deps, runs `prisma generate` + `prisma db push`, then starts
Next.js on first boot — so a clean clone needs no manual `npm install` or migration step. Once
up, the app is on <http://localhost:14020>.

### Dev vs production build

Two run modes, both fully in Docker and both on the **same** `.env` (so the Solana network is
unchanged — build mode only affects page-load speed, not the blockchain):

- **Dev (default)** — `docker compose up -d`. Runs `next dev` with the source live-mounted, so
  code edits hot-reload instantly. Deps install only on first boot (cached in a volume), so
  restarts are fast (~5 s). Best while building.
- **Production** — `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate app`.
  Runs the optimized `next build` + `next start` for fast page loads (demos/launch). First boot
  runs the build (~3–5 min); code changes then need this command re-run (no hot reload).

Switch back to dev with `docker compose up -d --force-recreate app`.

### RPC endpoint

`SOLANA_RPC_URL` (server) and `NEXT_PUBLIC_SOLANA_RPC_URL` (browser) default to the public
`api.devnet.solana.com`, which rate-limits (HTTP `429`) under real use and can break checkout
signing. For reliable demos, set both to a dedicated **devnet** endpoint in `.env` — e.g. Helius
`https://devnet.helius-rpc.com/?api-key=YOUR_KEY`. `NEXT_PUBLIC_*` is baked at build time, so
changing it requires an app rebuild (`--force-recreate app`).

### Secrets to fill in `.env`

| Var | What it is |
|---|---|
| `POSTGRES_PASSWORD` / `DATABASE_URL` | DB password — must match in both |
| `SYSTEM_FEEPAYER_SECRET` | base58 64-byte secret key of the gas/delegate wallet |
| `NEXT_PUBLIC_SYSTEM_FEEPAYER_PUBKEY` | public key of the above |
| `CRON_SECRET` | shared bearer guarding the debit-sweep endpoint |

> For a zero-funds demo set `MOCK_CHAIN=true` and the Solana secrets can stay as placeholders
> (see **Demo-safe fallback** below).

Key endpoints:
- `GET  /api/v1/config` — delegate pubkey, RPC, network, mock flag
- `POST /api/v1/mandates` — create `{merchant, mint, tokenSymbol?, totalAmount, totalCycles}`
- `GET  /api/v1/mandates` / `GET /api/v1/mandates/:id`
- `POST /api/v1/mandates/:id/authorize` — `{payer, approveTx}` → ACTIVE
- `GET  /api/v1/cron/debit-sweep` — bearer-guarded (`CRON_SECRET`)

## Cadence

`DEBIT_ENVIRONMENT` in `.env`: `testing` → 10-minute cycles, `production` → monthly.
The sweep runs every minute but only charges mandates whose `nextDebitAt` has elapsed.

## Before a REAL (non-mock) demo

The system fee-payer pays all gas + merchant ATA rent, so it must hold devnet SOL:

- Fee-payer pubkey: see `NEXT_PUBLIC_SYSTEM_FEEPAYER_PUBKEY` in `.env`
- Fund it at <https://faucet.solana.com> (devnet) — the public RPC blocks programmatic airdrops.
  (See **RPC endpoint** above — a dedicated devnet RPC avoids the public node's `429` throttling.)

The payer's wallet must hold the chosen SPL token (its ATA must exist before `approve`).

### Demo-safe fallback

Set `MOCK_CHAIN=true` in `.env` and `docker compose up -d app`. Checkout skips the on-chain
approve and the sweep writes mock signatures — the full lifecycle (PENDING_AUTH → ACTIVE →
N/N → COMPLETED) runs with **no funds required**. Set back to `false` for real transfers.

## Demo flow (≈2 min)

1. Dashboard (`/`): create a mandate (e.g. total `1200`, `12` cycles → 100/cycle) → copy checkout link.
2. Checkout (`/checkout/:id`): connect your wallet (**set Phantom to Devnet** + hold the SPL token
   with SOL for the approve fee), sign the approve → status `ACTIVE`, ledger `0/12`.
3. Trigger collection: wait for the cron, or
   `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:14020/api/v1/cron/debit-sweep`
   → ledger `1/12`, real tx on the Solana explorer, payer wallet untouched by gas.
