# Risks and Mitigations

> Status: Planning.

## Technical risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|-----------|------------|
| T1 | RPC congestion drops/expires transactions | Debits/authorize fail | Med–High (devnet) | Priority fees, bounded retries with fresh blockhash, provider RPC upgrade, tolerant confirm + server-side re-verify. |
| T2 | Fee-payer runs out of gas | Debits halt | Med | Balance monitoring + alerts; documented funding runbook; auto-top-up (later). |
| T3 | Single hot platform key compromised | Limited to existing delegations; reputational | Low–Med | Secret hygiene, no browser exposure; KMS/HSM + rotation + key separation pre-mainnet. |
| T4 | Customer lacks token account / funds | Authorize/debit fails | Med | Clear checkout guidance; mark `EXHAUSTED` on shortfall; receipts/dunning (later). |
| T5 | Double-charge within a cycle | Financial/trust | Low | Atomic per-cycle log + state update; due-time gating. |
| T6 | Native SOL cannot be auto-pulled (only SPL) | Scope confusion | Known | Document clearly; use stablecoins/SPL; wrapped-SOL only if needed. |

## Product / adoption risks

| # | Risk | Mitigation |
|---|------|------------|
| P1 | Customers hesitant to sign any approval | Clear cap display, trustless revoke, education; tune cap defaults. |
| P2 | Merchants need fiat-stable pricing | Recommend stablecoins; dynamic peg/oracle later. |
| P3 | Volatile tokens distort "value" | Recommend stablecoins; warn on non-stable tokens. |
| P4 | Open dashboards feel un-private | Disclose public on-chain nature; add merchant auth later. |

## Operational risks

| # | Risk | Mitigation |
|---|------|------------|
| O1 | Scheduler outage | Idempotent due-time engine catches up on next run; health checks. |
| O2 | Silent failures | Every attempt logged with reason; operator visibility; alerts. |
| O3 | Devnet faucet limits during testing | Self-minted test tokens; provider faucets. |

## Compliance / external risks

| # | Risk | Mitigation |
|---|------|------------|
| C1 | Licensing/KYC requirements at mainnet | Legal review gate before mainnet; non-custodial design; KYC tooling if required. |
| C2 | Stablecoin regulatory shifts | Monitor; keep token configurable; avoid issuer lock-in. |
| C3 | Third-party audit scheduling delays | Book audit slot during Phase 2–3. |

## Top risks to watch
- **T1 (RPC reliability)** and **T2 (fee-payer funding)** are the most likely to bite in early phases — both have concrete mitigations and should be monitored from day one.
