# Non-Functional Requirements

> Status: Planning.

## NFR-1 Security
- NFR-1.1 The platform key (delegate / fee-payer) secret shall never be committed to source control and shall be injected via environment/secret store.
- NFR-1.2 The protocol shall make it impossible to pull more than the customer's approved allowance (enforced by the SPL token program).
- NFR-1.3 The recurring trigger endpoint shall reject unauthenticated calls.
- NFR-1.4 The system shall never custody customer funds or private keys.

## NFR-2 Reliability & availability
- NFR-2.1 The debit engine shall be idempotent per cycle (no double-charging within a cycle).
- NFR-2.2 A failed debit shall not corrupt mandate state; it shall be logged and retried on the next cycle.
- NFR-2.3 The system shall tolerate transient RPC/network failures via priority fees and bounded retries.
- NFR-2.4 Target service availability for the API and checkout: 99.5%+ (initial).

## NFR-3 Performance
- NFR-3.1 Checkout and dashboard pages shall be responsive (interactive < 3s on a warm production build).
- NFR-3.2 A sweep shall process due mandates within its trigger interval under expected load.
- NFR-3.3 API reads shall return within 500ms p95 under expected load.

## NFR-4 Scalability
- NFR-4.1 The data model and engine shall scale to thousands of active mandates without redesign.
- NFR-4.2 The sweep shall be horizontally partitionable by mandate in a future phase.

## NFR-5 Maintainability & portability
- NFR-5.1 All services shall run in containers; no host-level installs.
- NFR-5.2 Configuration shall be environment-driven (network, RPC, cadence, mock mode, secrets).
- NFR-5.3 The settlement token shall be configurable, not hardcoded into business logic.

## NFR-6 Observability
- NFR-6.1 Every debit and cancellation shall be recorded with a timestamp and (where applicable) an on-chain signature.
- NFR-6.2 Failures shall record a human-readable reason.
- NFR-6.3 Operators shall be able to see fee-payer balance and pending/failed counts.

## NFR-7 Usability & accessibility
- NFR-7.1 The checkout shall clearly state the exact amount, cadence, and total cap before signing.
- NFR-7.2 The product shall work with standard Solana wallets via the Wallet Standard.
- NFR-7.3 Amounts shall be displayed in the settlement token's own units with correct precision.

## NFR-8 Compliance & data
- NFR-8.1 The system shall minimize stored personal data (wallet addresses and mandate terms only; no KYC in v1).
- NFR-8.2 All timestamps shall be stored in UTC; display may localize.

## NFR-9 Localization (future)
- NFR-9.1 The UI shall be structured to allow future localization of copy and number formats.
