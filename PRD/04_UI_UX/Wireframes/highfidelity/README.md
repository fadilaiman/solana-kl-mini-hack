# High-Fidelity Mockups

> Status: Approved direction. These are the high-fidelity HTML mockups the live
> frontend is built to match. Theme: dark glassmorphism, **purple → gold**
> SoleMandate brand gradient, Space Grotesk display + Inter body, Material Symbols icons.

> Note: the originally-uploaded file names were swapped relative to their actual
> content. Files here are named by **what they actually contain** (verified by the
> page `<title>` and layout).

| File | Page | Live route | Key elements |
|------|------|------------|--------------|
| `home-merchant.html`     | Home / Merchant landing | `/`                     | Top nav, hero ("Automate your revenue on Solana"), TVL/active stats bar, **Quick Create** form, **Recent Mandates** table |
| `dashboard.html`         | Wallet dashboard        | `/dashboard`            | Bento stat cards (Receiving / Paying / Next charge), Receiving/Paying tabs, mandate table, quick actions |
| `checkout.html`          | Checkout / authorize    | `/checkout/{id}`        | Merchant identity, **Mandate Commitment** summary, How-it-works / cancellation, Connect→Approve CTA |
| `activity-protocol.html` | Protocol activity feed  | `/activity`             | Live metrics bento, real-time transactions feed, network status |

## Design tokens (from the mockups)

- **Brand gradient:** `Sol` `#6d28d9` → `e` (purple→gold) → `Mandate` `#fbbf24`
- **Surfaces:** background `#0b1326`, glass fill `rgba(30,41,59,0.7)` + `blur(12px)`,
  border `rgba(255,255,255,0.1)`
- **Primary** `#d3bbff` / primary-container `#6d28d9`; **Secondary/gold** `#ffc640`;
  **Tertiary/green** `#4ae176`; **Error** `#ef4444`
- **Fonts:** Space Grotesk (display/headline), Inter (body/label/mono)
