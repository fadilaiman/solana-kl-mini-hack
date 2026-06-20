# Design References

> Status: Planning. Visual and interaction references for the intended look & feel.

## Tone
- **Fintech-grade trust** meets **crypto-native clarity**. Clean, dark, confident. Numbers are the hero.

## Reference products (for inspiration, not copying)
- **Stripe Checkout / Billing** — clarity of "what you're paying," summary blocks, status pills.
- **Solana wallet adapters** — standard "Select Wallet" / connect patterns.
- **Block explorers** — transaction "receipt" presentation and verifiability.

## Proposed visual language
- **Theme:** dark background; high-contrast text; accent gradient (Solana green → purple).
- **Cards/panels:** rounded, bordered, subtle elevation; grouped by task.
- **Status pills:** color-coded — pending (amber), active (green), revoked/exhausted (red/purple), completed (purple).
- **Mono font** for addresses, mints, and signatures; truncate with `abcd…wxyz`.
- **Summary block:** "per payment × payments = total" with "over N periods."
- **Stat tiles:** compact number + label for dashboard KPIs.

## Key components to design
1. **Mandate creation form** — wallet, token chip (default stablecoin + advanced override), config method radios, amount, frequency, duration, live summary.
2. **Checkout card** — big amount, cadence, total cap, merchant, connect-wallet, approve, active/cancel states, mock-mode banner.
3. **Stat tiles row** — active, pending payments, awaiting signature, failed.
4. **Mandate card** — per-payment/frequency, counterpart wallet, progress bar, recent tx rows with explorer links.
5. **Activity row** — payment (green) and cancellation (purple) variants with "verify on Explorer ↗".

## Accessibility references
- WCAG AA contrast for text on dark surfaces.
- Keyboard-navigable forms and buttons; visible focus states.

## Wireframes
- Low-fidelity wireframes to live in `Wireframes/` (see that folder's README).
