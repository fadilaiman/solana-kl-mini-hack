# Architecture Overview

> Status: Planning. Proposed architecture for the v1 build.

## High-level shape

```
                       ┌────────────────────────── Edge ──────────────────────────┐
   Customer/Merchant ─▶│  Reverse proxy (TLS)  ─▶  internal nginx  ─▶  Web App      │
   (browser + wallet)  └───────────────────────────────────────────┬──────────────┘
                                                                    │
                       ┌──────────────────────── App container ─────▼──────────────┐
                       │  Web App (SSR React + REST API)                            │
                       │   • UI: operator dashboard, checkout, my-dashboard, feed   │
                       │   • API: /config, /mandates, /authorize, /cancel, /sweep   │
                       │   • Engine: debit logic (transferChecked, gas-absorbed)    │
                       └───────┬───────────────────────────────┬───────────────────┘
                               │                               │
                   ┌───────────▼─────────┐        ┌────────────▼───────────┐
                   │ PostgreSQL (mandates,│        │ Solana RPC (devnet)    │
                   │ debit logs)          │        │  SPL token program     │
                   └──────────────────────┘        └────────────────────────┘
                               ▲
                   ┌───────────┴─────────┐
                   │ Cron sidecar         │  every minute → POST /api/v1/cron/debit-sweep (guarded)
                   └──────────────────────┘
```

## Components

### Web application (SSR React + REST API)
- Serves the four UI surfaces and the REST API in one deployable.
- Holds the **platform key** in server-only code (never shipped to the browser).
- Exposes only the **delegate public key** + network to the client via a config endpoint.

### Debit engine
- Invoked by the guarded sweep endpoint.
- Selects due `ACTIVE` mandates, verifies allowance, executes `transferChecked` as delegate, logs results, advances schedule, transitions terminal states.
- Adds a priority fee and retries to improve landing under congestion.
- Honors a **mock mode** that skips real RPC sends.

### Scheduler (cron sidecar)
- A lightweight container that calls the sweep endpoint every minute with the shared secret.
- The endpoint, not the scheduler, decides what's due (cadence lives in the mandate).

### Database (PostgreSQL)
- Stores mandates and an append-only debit log. Source of operational truth; on-chain is the financial truth.

### Solana / RPC
- SPL token program provides delegation (`approveChecked`), pulls (`transferChecked`), and cancellation (`revoke`).
- RPC endpoint for reads and sending/confirming transactions.

### Edge / reverse proxy
- An edge proxy terminates TLS and forwards to the internal nginx, which proxies to the app.

## Key design decisions
- **No custom on-chain program in v1** — rely on native SPL delegation for capped pulls (simpler, audited primitive).
- **Single platform key** as both delegate and fee-payer (gas-absorbed). Hardening (KMS, separation, rotation) is a later milestone.
- **Cadence in data, trigger every minute** — the engine filters by due time, so one scheduler serves all frequencies.
- **Token base units everywhere**; decimals resolved from chain; display converts back.
- **Containerized, env-driven, stateless app** (state in DB) for portability and scale.

## Data & control flow (authorize → debit)
1. Customer signs `approveChecked` (client) → backend verifies delegation → mandate `ACTIVE`.
2. Cron triggers sweep → engine finds due mandate → `transferChecked` signed by platform key → log + schedule advance.
3. Customer `revoke` (client) → backend marks `REVOKED` → engine stops.

## Deployment topology
- App, database, internal nginx, and cron run as separate containers on one network, behind an edge reverse proxy providing public HTTPS.
- All persistent data on mounted volumes; all config via environment.
