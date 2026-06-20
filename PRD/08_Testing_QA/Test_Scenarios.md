# Test Scenarios

> Status: Planning. Concrete scenarios across unit, integration, and end-to-end.

## End-to-end (devnet)
- **E2E-1 Happy path:** create → authorize (real `approveChecked`) → automatic debit → repeat to `COMPLETED`. Verify balances move and signatures finalize.
- **E2E-2 Customer cancel:** activate → customer `revoke` → confirm delegation gone and no further debits succeed.
- **E2E-3 Operator stop:** activate → operator stop → confirm engine skips it.
- **E2E-4 Exhaustion:** set cap < total intended → confirm mandate becomes `EXHAUSTED` when allowance can't cover a cycle.
- **E2E-5 Verifiability:** open each payment/revoke on a public explorer and confirm details (amount, parties, fee payer).

## Mock-mode (no funds)
- **MOCK-1 Lifecycle:** with mock enabled, run create → authorize → sweep×N → `COMPLETED` using mock signatures.
- **MOCK-2 Fast cadence:** use the testing cadence to iterate the full loop quickly.

## Integration (API + DB + chain)
- **INT-1 Create validation:** per-payment vs total; decimals resolution; smallest-unit rejection.
- **INT-2 Authorize verification:** activates only when delegation is present and ≥ one cycle.
- **INT-3 Sweep selection:** only `ACTIVE` and due mandates are processed.
- **INT-4 Idempotent cancel:** repeated cancel returns cleanly.
- **INT-5 Guard:** sweep without bearer → 401.
- **INT-6 Wallet filter:** `?wallet=` returns mandates where address is merchant or payer.

## Unit
- **U-1 Amount math:** human ↔ base-unit conversions across decimals (incl. 0.000001 and large values).
- **U-2 Schedule math:** next-debit computation per frequency.
- **U-3 Serialization:** BigInt fields serialize as strings.
- **U-4 State transitions:** valid/invalid transitions enforced.

## Resilience / chaos
- **CHAOS-1 RPC congestion:** inject failures; confirm priority fee + retries land or fail gracefully.
- **CHAOS-2 Slow confirm:** confirmation times out but tx lands → server re-verification recovers.
- **CHAOS-3 Fee-payer empty:** confirm debits fail cleanly and are logged (and alert fires, later).

## Load
- **LOAD-1 Many due mandates:** N due at once → all processed within the sweep window; no double-charge.

## Regression suite (must pass each release)
- AC-1…AC-18 from Acceptance_Criteria.md mapped to automated tests where feasible.
