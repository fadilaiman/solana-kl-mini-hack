# UX Rules

> Status: Planning. Non-negotiable UX principles for the build.

## Clarity & trust
1. **Show the cap before the signature.** Checkout must state per-payment amount, cadence, number of payments, and **total maximum** in the settlement token before the customer signs.
2. **No hidden conversions.** Display amounts in the settlement token's own units. If a fiat label/peg is shown, make clear it is display-only, not a live conversion.
3. **Name the token honestly.** Use the actual token symbol; never imply a token is something it isn't.

## One-time, low-friction
4. **One signature to subscribe.** Never require the customer to sign more than once to start.
5. **Never ask the customer for gas.** The platform absorbs network fees; the customer needs only the settlement token.
6. **Tolerate slow networks.** Do not hard-fail the UI on a slow confirmation; verify state server-side and recover gracefully.

## Control & reversibility
7. **Cancellation is always one step away.** An active subscription must expose a clear cancel path that performs an on-chain revoke.
8. **Destructive actions confirm.** Stopping/canceling prompts a confirmation; copy explains the consequence.

## Feedback & status
9. **Every state is legible.** Pending, active, completed, exhausted, revoked each have distinct, labeled visuals.
10. **Make it verifiable.** Every real on-chain action offers a public explorer link.
11. **Live updates.** Dashboards and activity refresh without a manual reload.

## Wallet UX
12. **Guide wallet connection.** If no Solana wallet is detected, explain what to do (use a Solana wallet; on mobile, the wallet's in-app browser).
13. **Match the signer to the action.** Only the authorizing wallet can cancel; guide the user if the wrong wallet is connected.

## Error handling
14. **Errors are human-readable and actionable.** Explain what went wrong and what to do next (e.g., "fund your wallet with the token first").
15. **Never lose user money to a known-bad action.** Surface simulation/validation failures and discourage forcing them.

## Accessibility & responsiveness
16. **AA contrast, keyboard navigation, visible focus.**
17. **Responsive layouts** for desktop and mobile.
