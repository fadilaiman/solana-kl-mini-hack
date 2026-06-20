# Edge Cases

> Status: Planning. Conditions the implementation must handle explicitly.

## Amounts & tokens
- Per-payment amount at the **smallest unit** (e.g., 0.000001 for 6-decimals) — must work.
- Amount **below** smallest unit — must be rejected.
- Tokens with **non-6 decimals** — decimals must be read from chain, not assumed.
- **Total ÷ count** not evenly divisible — define rounding behavior; cap must still bound total.
- Very large totals (BigInt) — no float precision loss.

## Authorization
- Customer's **token account doesn't exist** at authorize — guide to fund first.
- Customer approves **less** than one cycle — do not activate.
- **Re-authorizing** an already-active mandate — reject/no-op.
- Approval **lands after** the wallet's confirmation timeout — server re-verification still activates.
- Customer approves with the **wrong wallet** (not intended payer) — handle clearly.

## Collection
- **Insufficient balance** at debit time (even with allowance) — log failure / `EXHAUSTED`; never partial-charge incorrectly.
- **Delegation revoked** between cycles — sweep detects and stops (`EXHAUSTED`/no-op).
- **Merchant token account missing** — create idempotently (fee-payer pays rent).
- **Clock/timezone** — all scheduling in UTC; due-time comparisons consistent.
- **Sweep runs twice quickly** — due-time gating prevents double charge.
- **Final cycle rounding** — last cycle must not exceed remaining allowance.

## Cancellation
- Cancel a mandate that is **already terminal** — idempotent.
- Customer revokes **on-chain** but the cancel notification fails — engine still stops (allowance gone → `EXHAUSTED`/no-op on next sweep).
- Operator stop on a mandate the customer later tries to use — remains stopped.

## Network / infra
- **RPC down / rate-limited** — retries, priority fee, provider fallback; clear failure logging.
- **Fee-payer empty** — debits fail cleanly; surfaced to operator.
- **Transaction dropped** (blockhash expired) — retry with fresh blockhash; do not assume success.
- **Duplicate signature** insert — prevented by uniqueness.

## UI / wallet
- **No Solana wallet** in the browser — guidance (desktop extension / mobile in-app browser).
- **MetaMask / non-Solana wallet** — not supported; communicate clearly.
- **Devnet token not shown** in wallet UI — clarify it's a display quirk; balances are on-chain.
- **Simulation failure warning** — surface; discourage forcing.

## Data
- Mandate with **no payer yet** (PENDING_AUTH) appears correctly in merchant views.
- Deleting/cascading **debit logs** with their mandate.
