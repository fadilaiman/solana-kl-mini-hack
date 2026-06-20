# Success Metrics & KPIs

> Status: Planning. Targets are initial hypotheses to be refined after launch.

## North-star metric

**Recurring volume settled (per month)** — total value of stablecoin successfully pulled through active mandates. This captures merchant adoption, customer retention, and protocol reliability in one number.

## Primary KPIs

| KPI | Definition | Initial target |
|-----|------------|----------------|
| **Checkout completion rate** | Authorized mandates ÷ checkout links opened | ≥ 60% |
| **Debit success rate** | Successful debits ÷ attempted debits | ≥ 99% |
| **On-time execution rate** | Debits executed within their due window ÷ total due | ≥ 99% |
| **Mandate retention (90-day)** | Mandates still ACTIVE after 90 days ÷ activated | ≥ 70% |
| **Time-to-first-mandate** | Median time for a new merchant to create + share a mandate | ≤ 10 min |

## Reliability / trust KPIs

| KPI | Definition | Target |
|-----|------------|--------|
| **Cap breach incidents** | Times a debit exceeded the approved allowance | **0** (must be impossible) |
| **Revoke success rate** | Successful customer cancellations ÷ attempts | 100% |
| **Verifiable payment rate** | Payments with a valid public explorer link ÷ total | 100% (real-chain) |
| **Gas coverage** | Debits where the platform paid the fee ÷ total | 100% |

## Cost / unit-economics KPIs

| KPI | Definition | Target |
|-----|------------|--------|
| **Cost per debit** | Avg network fee paid by platform per debit | < $0.01 |
| **Effective take vs. cards** | Solemandate cost ÷ equivalent card processing cost | < 20% |

## Guardrail metrics (watch for regressions)

- **Failed-debit reasons** distribution (insufficient allowance, insufficient balance, RPC/network).
- **Mandate churn cause** split (customer revoke vs. exhausted vs. operator stop).
- **Checkout drop-off** stage (wallet connect vs. signature).

## Measurement notes

- Metrics will be derived from the debit log and mandate lifecycle events (see `09_Analytics`).
- On-chain truth (explorer) is the source of record for settled value; the database mirrors it.
