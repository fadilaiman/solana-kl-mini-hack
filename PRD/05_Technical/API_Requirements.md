# API Requirements

> Status: Planning. Proposed REST surface (`/api/v1`). Shapes are indicative.

## Conventions
- JSON over HTTPS. Amounts in **base units** (strings) in responses; human units accepted on input.
- Timestamps in UTC ISO-8601. Errors: `{ "error": "<message>" }` with appropriate HTTP status.
- The sweep endpoint requires a bearer secret; other endpoints are open in v1 (auth is a later milestone).

## GET `/api/v1/config`
Public configuration for the checkout client.
```json
{ "delegate": "<platform pubkey>", "rpcUrl": "...", "network": "devnet", "mockChain": false }
```

## POST `/api/v1/mandates`
Create a mandate.
- **Body:** `merchant`, optional `mint` (defaults to configured token), optional `tokenSymbol`,
  `configMethod` (`per_payment`|`total`), `perPayment` **or** `total`, `frequency`
  (`testing_10m`|`daily`|`weekly`|`monthly`), `numberOfPayments`.
- **Validates:** valid addresses; positive amount ≥ token's smallest unit; positive integer count.
- **Returns:** `201` with the mandate (status `PENDING_AUTH`).

## GET `/api/v1/mandates`
List mandates (newest first).
- **Query:** optional `?wallet=<addr>` → only mandates where the address is merchant or payer.
- **Returns:** array of mandates with embedded debit logs.

## GET `/api/v1/mandates/{id}`
Single mandate + debit history (+ derived `collected`). `404` if not found.

## POST `/api/v1/mandates/{id}/authorize`
Activate after the customer signs `approveChecked`.
- **Body:** `payer` (wallet), optional `approveTx`.
- **Behavior:** verify delegation on-chain (with bounded retries for slow networks); on success set `ACTIVE` and schedule first debit.
- **Returns:** updated mandate, or `422` if approval not yet detected.

## POST `/api/v1/mandates/{id}/cancel`
Stop a mandate.
- **Body:** optional `revokeTx`, `by` (`customer`|`operator`).
- **Behavior:** set `REVOKED`; idempotent if already terminal; record canceller + revoke signature.

## GET `/api/v1/cron/debit-sweep`  *(guarded)*
Run the debit engine over due mandates.
- **Auth:** `Authorization: Bearer <CRON_SECRET>` required (`401` otherwise).
- **Behavior:** for each due `ACTIVE` mandate — verify allowance, pull funds (gas-absorbed), log, advance/transition.
- **Returns:** `{ sweptAt, processed, details: [...] }`.

## Error semantics (examples)
| Case | Status |
|------|--------|
| Missing/invalid fields | 400 |
| Mandate not found | 404 |
| Already authorized/canceled | 409 (or idempotent 200 for cancel) |
| Approval not verified yet | 422 |
| Unauthorized sweep | 401 |
| Server/RPC error | 500 |

## Future API (later phases)
- **Webhooks** for state changes (activated, debited, completed, canceled, failed).
- **Auth** (API keys per merchant) and scoping of list/read to the caller.
- **Pagination & filtering** on list endpoints.
