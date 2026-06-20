# Privacy Considerations

> Status: Planning.

## Data minimization
- v1 collects **no personal identity data** — no names, emails (unless a merchant account is later introduced), KYC, or off-chain PII.
- Stored data is limited to: wallet addresses, token/mint, amounts, schedule, mandate status, and transaction signatures.

## Nature of the data
- Wallet addresses and transactions are **already public** on-chain. The product surfaces and organizes public data; it does not create new sensitive disclosures.
- Linking a wallet to a real-world identity is **out of scope**; the system stores no such linkage in v1.

## Open dashboards
- v1 dashboards are open (no login). Because the underlying data is public on-chain and cancellation is wallet-gated, this is acceptable for v1.
- **Risk:** anyone can look up any wallet's mandates. This is consistent with on-chain transparency but should be disclosed.
- **Later milestone:** merchant authentication to scope views to the owner where desired.

## Pseudonymity
- Customers interact pseudonymously via wallet addresses. The product must not require deanonymization to function.

## Retention
- Operational records (mandates, debit logs) are retained for service operation and audit.
- A future data-retention policy should define archival/erasure for closed mandates, balanced against audit needs.

## Secrets vs. data
- Platform secrets are not user data and are handled per Security Requirements (never logged, never committed).

## Future privacy work (if accounts/PII are added)
- Privacy policy, consent, data-subject access/erasure flows.
- Encryption at rest for any PII; access controls and audit logging.
- Regional data handling considerations.
