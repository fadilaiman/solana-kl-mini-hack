# Acceptance Criteria

> Status: Planning. Given/When/Then criteria tied to requirements.

## Mandate creation
- **AC-1** *Given* valid terms, *when* a merchant submits, *then* a `PENDING_AUTH` mandate is created with correct base-unit `debitAmount`/`maxAmount` and a checkout URL is returned.
- **AC-2** *Given* total-amount mode, *when* submitted, *then* per-cycle amount = total ÷ count.
- **AC-3** *Given* an amount below the token's smallest unit, *when* submitted, *then* the request is rejected with a clear error.

## Authorization
- **AC-4** *Given* a `PENDING_AUTH` mandate, *when* the customer signs `approveChecked` for the cap and the delegation is verified, *then* the mandate becomes `ACTIVE` and a first debit is scheduled.
- **AC-5** *Given* a slow network, *when* the wallet confirmation times out but the approval lands, *then* server-side re-verification still activates the mandate.
- **AC-6** *Given* no delegation on-chain, *when* authorize is called, *then* the mandate stays `PENDING_AUTH` and a retry message is shown.

## Recurring collection
- **AC-7** *Given* an `ACTIVE` due mandate with sufficient allowance, *when* the sweep runs, *then* exactly one cycle's amount transfers payer → merchant, the platform pays the fee, and a `SUCCESS` log with a unique signature is written.
- **AC-8** *Given* a mandate already debited this cycle, *when* the sweep runs again before the next due time, *then* it is **not** charged again.
- **AC-9** *Given* the final cycle completes, *when* logged, *then* the mandate becomes `COMPLETED`.
- **AC-10** *Given* allowance/balance below one cycle, *when* the sweep runs, *then* the mandate becomes `EXHAUSTED` and is not charged.

## Cancellation
- **AC-11** *Given* an `ACTIVE` mandate, *when* the customer signs `revoke`, *then* the mandate becomes `REVOKED`, the revoke signature is recorded, and no further debits succeed.
- **AC-12** *Given* an operator stop, *when* invoked, *then* the mandate becomes `REVOKED` (off-chain) and the engine no longer debits it.
- **AC-13** *Given* a terminal mandate, *when* cancel is called again, *then* the call is idempotent (no error/state change).

## Security / safety
- **AC-14** *Given* no/!valid bearer secret, *when* the sweep endpoint is called, *then* it returns 401 and performs no action.
- **AC-15** *Given* any sequence of debits, *when* totaled, *then* the sum never exceeds the approved cap.

## Visibility
- **AC-16** *Given* a wallet, *when* looked up, *then* the dashboard lists its receiving/paying mandates with correct stats.
- **AC-17** *Given* a real payment/cancellation, *when* viewed in activity, *then* a valid public explorer link is shown.

## Mock mode
- **AC-18** *Given* mock mode enabled, *when* the full lifecycle runs, *then* states progress correctly with mock signatures and no real on-chain transactions.
