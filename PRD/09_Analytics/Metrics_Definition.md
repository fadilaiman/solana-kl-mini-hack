# Metrics Definition

> Status: Planning. Precise definitions so metrics are unambiguous and reproducible.

## Volume & revenue
- **Settled volume** = Σ `amountDebited` of `SUCCESS` debit logs, per token, per period.
- **Active recurring run-rate** = Σ (`debitAmount` × remaining cycles) for `ACTIVE` mandates (expected future volume).

## Funnel
- **Checkout completion rate** = `mandate_authorized` ÷ `checkout_opened` (unique mandates).
- **Connect→approve rate** = `approve_confirmed` ÷ `wallet_connected`.
- **Drop-off stage** = distribution of last funnel event for non-completed checkouts.

## Reliability
- **Debit success rate** = `debit_succeeded` ÷ (`debit_succeeded` + `debit_failed`).
- **On-time execution rate** = debits executed within their due window ÷ debits due.
- **Failure reason mix** = `debit_failed` grouped by `reason` (insufficient allowance/balance, RPC, other).

## Retention & churn
- **90-day mandate retention** = mandates still `ACTIVE` 90 days after activation ÷ mandates activated.
- **Churn cause mix** = terminal transitions split by `REVOKED` (customer/operator), `EXHAUSTED`, `COMPLETED`.
- **Cycle completion ratio** = cycles collected ÷ `totalCycles` (per mandate; averaged).

## Trust / safety
- **Cap-breach incidents** = count of debits where cumulative > `maxAmount` (target: 0).
- **Verifiable payment rate** = real-chain `SUCCESS` debits with a valid explorer link ÷ real-chain `SUCCESS` debits.

## Cost
- **Cost per debit** = network fee paid by fee-payer ÷ debit count.
- **Fee-payer burn rate** = SOL spent on fees/rent per period.

## Operational
- **Sweep throughput** = mandates processed per sweep; **sweep latency** = time to process due set.
- **Fee-payer runway** = current balance ÷ burn rate.

## Dimensions (slice-by)
- Token/mint, frequency, merchant, environment (devnet/mainnet), mock vs real.

## Notes
- On-chain `SUCCESS` totals are authoritative for settled volume; DB mirrors chain.
- Exclude `mock_*` and `FAILED_*` signatures from real-volume metrics.
