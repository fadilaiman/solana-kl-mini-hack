# Security Requirements

> Status: Planning.

## Trust model
- The protocol is **non-custodial**: the platform never holds customer funds or keys.
- The **only** power the platform has over a customer is a **capped delegation** the customer granted and can revoke.
- The SPL token program — not platform code — enforces that no debit exceeds the approved allowance.

## SEC-1 Key management (platform key)
- SEC-1.1 The platform key (delegate + fee-payer) secret must never be committed to source control; inject via env/secret store.
- SEC-1.2 The secret must never be exposed to the browser; only the public key is shared via config.
- SEC-1.3 v1 uses a single hot key on the server. **Later milestone:** move to KMS/HSM, separate delegate vs. fee-payer keys, enable rotation, and consider multi-sig for high-value flows.

## SEC-2 Authorization & endpoints
- SEC-2.1 The sweep endpoint must require a strong shared secret and reject unauthenticated calls.
- SEC-2.2 Authorize/cancel must verify on-chain state server-side rather than trusting client claims.
- SEC-2.3 Rate-limit public endpoints to mitigate abuse (later milestone for full coverage).

## SEC-3 Spend safety
- SEC-3.1 Each debit must transfer no more than the per-cycle amount, bounded by the remaining delegated allowance.
- SEC-3.2 The system must mark a mandate `EXHAUSTED` rather than retry indefinitely when allowance/balance is insufficient.
- SEC-3.3 Per-cycle log + state update must be atomic to prevent double-charging.

## SEC-4 Transaction integrity
- SEC-4.1 Use unique transaction signatures as idempotency keys in the debit log.
- SEC-4.2 Discourage forcing transactions that fail simulation; surface clear warnings.

## SEC-5 Infrastructure
- SEC-5.1 All services run in containers; no host-level installs; least-privilege containers.
- SEC-5.2 Public traffic terminates TLS at the edge; internal services are not directly exposed.
- SEC-5.3 Secrets and `.env` excluded from version control; only templates committed.

## SEC-6 Auditability
- SEC-6.1 Every debit and cancellation is recorded with a timestamp and (where applicable) an on-chain signature.
- SEC-6.2 Records are independently verifiable on a public explorer.

## SEC-7 Threats & mitigations (selected)
| Threat | Mitigation |
|--------|-----------|
| Platform tries to overcharge | Impossible beyond cap (token program enforces). |
| Leaked platform key | Attacker can pull only up to existing delegations to that key; revoke + rotate; KMS later. |
| Unauthorized sweep trigger | Bearer secret; no harmful action possible without it. |
| Replay / duplicate debit | Unique signature + atomic per-cycle write. |
| Congestion-based griefing | Priority fees + bounded retries; provider RPC. |
| Customer can't cancel | On-chain revoke is always available and wallet-gated. |

## Pre-mainnet security gate
- External review/audit of the debit/authorize/cancel flows.
- Key custody hardened (KMS/HSM).
- Rate limiting and monitoring in place.
