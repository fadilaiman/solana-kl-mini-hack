# Glossary

> Status: Planning. Shared vocabulary for this PRD.

- **Mandate** — A recurring billing agreement: payer, merchant, token, per-cycle amount, frequency, number of cycles, and lifecycle status.
- **Payer / Customer** — The wallet that authorizes and is debited.
- **Merchant** — The wallet that receives funds.
- **Operator / Platform** — The party running Solemandate (holds the platform key).
- **Platform key** — The server-held keypair acting as both the delegate (authorized to pull) and the fee-payer (pays gas).
- **Delegate** — An account authorized by a token owner to transfer up to a capped amount from their token account.
- **Allowance / Cap** — The maximum the delegate may transfer (`maxAmount`); enforced by the token program.
- **Approve (`approveChecked`)** — The customer's one-time instruction granting the delegate a capped allowance.
- **Transfer (`transferChecked`)** — The delegate-signed instruction that pulls a cycle's amount payer → merchant.
- **Revoke** — The customer's instruction removing the delegation (trustless cancel).
- **Gas-absorbed** — The platform pays network fees so the customer doesn't.
- **Fee-payer** — The account that pays transaction fees and token-account rent.
- **ATA (Associated Token Account)** — The deterministic token account for an (owner, mint) pair.
- **SPL token** — A token on Solana following the SPL Token standard (e.g., stablecoins).
- **Base units** — The smallest integer unit of a token (`human × 10^decimals`).
- **Decimals** — The token's precision; read from the mint.
- **Sweep** — A run of the debit engine over all due mandates.
- **Cadence / Frequency** — How often a mandate is debited (testing/daily/weekly/monthly).
- **Mock mode** — A configuration that runs the lifecycle without real on-chain transactions.
- **Mandate states** — `PENDING_AUTH` (created, awaiting signature), `ACTIVE` (collecting), `COMPLETED` (all cycles done), `EXHAUSTED` (allowance/balance insufficient), `REVOKED` (canceled).
- **Wallet Standard** — The interface modern Solana wallets implement for app connections.
- **Devnet / Mainnet** — Solana's test network vs. production network.
- **RPC** — The node endpoint used to read state and submit transactions.
- **Explorer** — A public site to independently verify transactions.
