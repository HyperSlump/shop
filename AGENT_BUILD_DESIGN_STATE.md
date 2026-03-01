# HYPER$LUMP // AGENT BUILD + DESIGN STATE
Last updated: 2026-02-28
Status: ACTIVE BASELINE
Owner intent: Preserve current checkout UX + style while iterating safely.

## Agent Boot Protocol (Run First)
1. `git status --short`
2. `npm install` (if deps are missing)
3. `npm run build`
4. If build fails, stop feature work and fix build first.
5. Read `DESIGN_LOCK.md` and this file before changing UI.

## Current Build Snapshot
- Framework: Next.js app router (`src/app`)
- Commerce stack: Stripe + Printful + Supabase
- Build command: `npm run build` (must pass before commit/push)
- Checkout page source of truth: `src/app/checkout/page.tsx`

## Active Checkout UX Rules (Do Not Regress)
- Physical item quantity is editable between `0` and `10`.
- Quantity `0` does **not** auto-remove item.
- When quantity is `0`, a subtle remove `x` appears in a reserved fixed slot (no layout shift).
- User cannot finish editing order with any physical item at `0`.
- User cannot submit payment with any physical item at `0`.
- If all cart lines are effectively non-checkout-eligible (physical qty `0` only), show:
  - "Please edit order to add items before checkout."
  - Do **not** show free digital email form in that state.

## Fixed-Layout Constraint (Critical)
- Variant/quantity/remove controls use fixed grid columns to avoid reflow when state changes.
- Price column in checkout summary rows uses fixed width + tabular numbers.
- Any future UI tweaks must keep these no-shift constraints.

## Server Guardrails
- `src/app/api/create-payment-intent/route.ts`
  - Rejects checkout if any physical item has quantity `<= 0`.
  - Recalculates totals server-side using normalized quantity/amount.
  - When a Stripe Tax calculation is provided, validates subtotal sync and attaches tax hooks.
- `src/app/api/tax/quote/route.ts`
  - Generates customer-facing tax quotes via Stripe Tax Calculation API.
  - Uses destination address + shipping amount + normalized cart lines.
- `src/app/api/printful/shipping-rates/route.ts`
  - Ignores physical lines with quantity `<= 0`.
  - Returns shipping rates only (`tax` placeholder remains `0` for compatibility).

## Design System Guardrails
- Global design lock is defined in `DESIGN_LOCK.md`.
- Keep dark/light palette tokens and typography intact.
- Keep checkout right panel visual rhythm stable (no jumping content).
- Keep all amount displays using tabular numerals where totals update.

## File Map For Agent Changes
- Checkout UI/state: `src/app/checkout/page.tsx`
- Payment submit gating: `src/components/CheckoutForm.tsx`
- Cart quantity behavior: `src/components/CartProvider.tsx`
- Payment intent validation: `src/app/api/create-payment-intent/route.ts`
- Stripe tax quote adapter: `src/app/api/tax/quote/route.ts`
- Printful shipping quote adapter: `src/app/api/printful/shipping-rates/route.ts`
- Mock shipping logic: `src/lib/services/printfulService.ts`

## Update-This-Doc Protocol (After Major Changes)
When shipping checkout or design changes, update:
1. `Last updated` date
2. `Current Build Snapshot` if stack/build rules changed
3. `Active Checkout UX Rules` with new accepted behavior
4. `Server Guardrails` if API validation logic changed
5. `File Map` if logic moved files

Then run:
- `npm run build`
- Commit doc updates with code in the same commit.

## Next Planned Workstream
- Country rollout + registration checks for Stripe Tax (CA, MX, and broader international).
- Product-level tax code hardening for digital and physical catalog lines.
