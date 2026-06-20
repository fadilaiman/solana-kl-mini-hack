# Pain Points

> Status: Planning. The specific pains the product must relieve, by persona.

## Merchant (Maya) pains

| Pain | How Solemandate will address it |
|------|---------------------------------|
| Card fees eat margin | Stablecoin pulls cost a fraction of a cent in network fees. |
| Slow settlement / holds | Funds settle on-chain in seconds, directly to the merchant wallet. |
| Customers churn on manual crypto payments | One-time authorization → fully automatic collection. |
| Needs blockchain expertise to accept crypto | Hosted checkout + REST API; merchant only supplies a wallet + terms. |
| No clear record of who paid what | Per-mandate ledger + verifiable explorer links. |

## Customer (Deon) pains

| Pain | How Solemandate will address it |
|------|---------------------------------|
| Having to sign every billing cycle | Sign once; subsequent cycles are automatic. |
| Fear of unlimited/over-scoped approvals | A clear, capped allowance enforced by the token program. |
| Needing native gas token to be billed | Platform absorbs gas; customer needs only the settlement token. |
| Hard to stop a recurring charge | One-click on-chain revoke; no support ticket. |
| Not knowing exactly what was authorized | Checkout clearly states amount, cadence, and total cap. |

## Operator (Priya) pains

| Pain | How Solemandate will address it |
|------|---------------------------------|
| Silent debit failures | Every attempt logged with success/failure + reason. |
| Gas tank runs dry unnoticed | Fee-payer balance visibility; low-balance alerting (planned). |
| No way to halt a problematic mandate | Operator "stop" control. |
| No audit trail | Append-only debit log + activity feed. |

## Developer (Sam) pains

| Pain | How Solemandate will address it |
|------|---------------------------------|
| Ambiguous payment states | Explicit mandate lifecycle (`PENDING_AUTH → ACTIVE → COMPLETED/EXHAUSTED/REVOKED`). |
| No idempotency / unclear errors | Clear REST semantics, unique transaction signatures, descriptive errors. |
| Hard to test recurring flows | A compressed "testing" cadence and a mock mode to dry-run without funds. |

## Pains we are NOT solving (v1)

- Acquiring crypto / on-ramping fiat (out of scope).
- Price volatility of non-stablecoin tokens (mitigated only by recommending stablecoins).
- Disputes/chargebacks (crypto is push-final; refunds are a separate merchant flow).
