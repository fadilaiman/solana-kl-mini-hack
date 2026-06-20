# Compliance Notes

> Status: Planning. **Not legal advice.** Flags areas requiring qualified counsel before mainnet/production.

## Posture for v1
- v1 targets **Devnet** with test value only — no real funds, no real customers. Compliance obligations are minimal at this stage but must be addressed before any mainnet/production launch.
- The system is **non-custodial** and processes **pull payments** authorized by the customer on-chain.

## Areas to assess before production
1. **Money transmission / payments licensing**
   - Whether facilitating recurring stablecoin pulls implicates money-transmitter or payment-institution rules in target jurisdictions.
   - Custody status matters: non-custodial design reduces but may not eliminate obligations.
2. **KYC / AML**
   - Whether onboarding merchants (and/or customers) requires identity verification and transaction monitoring.
   - Sanctions screening of addresses where applicable.
3. **Consumer protection**
   - Clear disclosure of terms, cap, cadence, and cancellation rights at checkout.
   - Records and receipts adequate for dispute handling.
4. **Tax & reporting**
   - Merchant reporting obligations for received funds; export tooling may be needed.
5. **Stablecoin-specific rules**
   - Evolving regulation of stablecoins/issuers in target markets.
6. **Data protection**
   - If accounts/PII are introduced, applicable privacy regimes (e.g., GDPR-style obligations).

## Design choices that aid compliance
- Non-custodial: funds move wallet-to-wallet; platform never holds them.
- Capped, revocable authorization with on-chain enforcement (strong consumer control).
- Complete, verifiable audit trail (debit log + explorer).
- Data minimization (no PII in v1).

## Compliance gate checklist (pre-mainnet)
- [ ] Legal review of licensing in launch jurisdictions.
- [ ] KYC/AML decision and tooling (if required).
- [ ] Sanctions screening approach.
- [ ] Terms of Service + clear customer disclosures.
- [ ] Records retention & export capability.
- [ ] Security audit complete (see Security Requirements).
