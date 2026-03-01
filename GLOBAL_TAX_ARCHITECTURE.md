# HYPER$LUMP // GLOBAL TAX ARCHITECTURE
Last updated: 2026-02-28
Owner: Checkout/Commerce
Status: Planned architecture (implementation-ready)

## 1) Goal
Move tax from ad-hoc quote logic to a single, auditable, global tax engine that supports:
- Canada
- Mexico
- United States
- Current international shipping countries
- Future expansion with low refactor cost

## 2) Non-Negotiable Design Rules
- Do not hardcode country tax rates in app code.
- Use one customer-facing tax engine at checkout to avoid double-tax.
- Keep no-shift checkout UI (value swaps only, no layout jumps).
- Block payment when physical-item quantity is `0`.
- Keep shipping quote logic and tax logic separated.

## 3) Current Build Risks
- Current checkout tax is sourced from Printful order-estimate responses.
- Printful tax outputs are useful for fulfillment cost context, but customer tax collection/compliance is better handled by Stripe Tax in this stack.
- Mixing tax engines (Printful tax + Stripe tax) risks mismatch and double collection.

## 4) Target Tax Engine Split
### Customer tax (authoritative)
- Stripe Tax (Tax Calculations + PaymentIntent linkage)
- Tax transaction committed by Stripe on successful payment

### Shipping cost (authoritative)
- Printful Shipping Rates endpoint
- Shipping amount is separate input to Stripe tax calculation

### Fulfillment-side tax/cost (internal only)
- Printful order estimate-costs can be stored for margin analytics
- Not shown as customer tax due at checkout

## 5) Country-by-Country Rules Matrix (Operational)
This matrix is implementation behavior, not legal advice.

| Country / Region | Model | Stripe Tax Coverage Mode | Checkout Behavior | Notes |
|---|---|---|---|---|
| US | Sales tax (state/local) | All sales | Calculate with full shipping address, charge at payment | ZIP-only can be imprecise in some states; collect full address. |
| CA | GST/HST/PST/QST mix | All sales | Stripe Tax per province; no hardcoded provincial math | Federal/provincial split must be engine-driven. |
| MX | VAT (IVA) | Full country support; border exceptions exist | Stripe Tax for normal MX VAT; do not hardcode | Stripe notes reduced border VAT is not supported. |
| EU countries (DE, FR, NL, SE, DK, IT, ES, PT, BE, AT, PL, IE, FI) | VAT | All sales | Stripe Tax with EU registrations (OSS/IOSS as needed) | Use product tax codes for reduced-rate categories. |
| GB | VAT | All sales | Stripe Tax | Keep B2B VAT ID handling in roadmap. |
| CH | VAT | All sales | Stripe Tax | Customs/import handling is separate from Stripe tax calc. |
| NO | VAT | All sales | Stripe Tax | Same customs caveat as above. |
| AU | GST | All sales | Stripe Tax | Include shipping tax code for correct treatment. |
| NZ | GST | All sales | Stripe Tax | Include shipping in tax calc as shipping line item. |
| SG | GST | All sales | Stripe Tax | Standard flow. |
| JP | Consumption tax | All sales (Stripe-supported location) | Stripe Tax | Standard flow. |
| KR | VAT | Digital-products/remote-sales constraints may apply | Validate support scope before enabling physical tax | Gate with country feature flag until verified in dashboard. |
| BR | Complex indirect tax regime | Treat as unsupported until explicitly verified | Default to no auto-tax; block/limit or use manual workflow | Do not ship auto-tax live without explicit support check. |
| Rest of world | Varies | Per Stripe supported-countries matrix | Country feature flags + registration checks | Only enable tax collection where registered. |

## 6) Stripe + Printful Integration Plan
### Phase A - Tax engine unification
1. Keep Printful shipping-rates endpoint for shipping only.
2. Remove Printful tax from customer tax display path.
3. Add server tax quote path using Stripe Tax calculation API.

### Phase B - PaymentIntent linkage
1. Build tax line items server-side from cart:
   - Physical and digital items with Stripe product tax codes.
   - Shipping as separate line item with `txcd_92010001`.
2. Create Stripe Tax Calculation for address + line items.
3. Update/create PaymentIntent with:
   - `amount = calculation.amount_total`
   - `hooks[inputs][tax][calculation] = taxcalc_*`
4. On payment success, Stripe commits tax transaction automatically.

### Phase C - Registration-aware collection
1. Tax collected only in jurisdictions with active registrations in Stripe.
2. Add dashboard checklist before enabling each country:
   - Registration active
   - Product tax codes reviewed
   - Shipping tax code configured
   - Test transactions validated

### Phase D - Country rollout controls
1. Introduce `TAX_COUNTRY_MODE` map:
   - `enabled` (full Stripe Tax)
   - `review_required`
   - `disabled`
2. Start with: US, CA, MX, EU list, GB, AU, NZ, SG, JP.
3. Hold KR/BR behind review flags until support scope is confirmed in Stripe dashboard for this account setup.

## 7) Data Contract Changes
- Persist on order:
  - `tax_engine: 'stripe_tax'`
  - `tax_calculation_id`
  - `tax_transaction_id` (from association lookup/webhook enrichment)
  - `tax_amount`
  - `tax_jurisdiction_summary` (country/province/state)
- Persist diagnostics:
  - `shipping_quote_source: 'printful'`
  - `shipping_rate_id`
  - optional `printful_estimate_tax_internal` (not customer-facing)

## 8) UX Rules During Migration
- Shipping and Tax display `--` until first resolved quote.
- No "calculating..." helper text under totals rows.
- Value slots have fixed width and tabular numerals.
- Any tax failure keeps checkout interactive and surfaces a single actionable message.

## 9) Validation + Testing Plan
### Unit/API
- Quantity-0 physical lines are rejected before payment confirm.
- Tax calculation request includes shipping line and product tax codes.
- PaymentIntent amount must equal Stripe calculation `amount_total`.

### Scenario tests
- US address (state/local variance)
- CA province switch (HST vs GST/PST behavior)
- QC address (GST + QST handling via Stripe)
- MX domestic address (standard IVA)
- MX border-region address (assert documented limitation path)
- EU cross-border order (VAT location logic)

### Monitoring
- Log tax calculation latency and failure rate.
- Alert on mismatch: `displayed_tax != committed_tax`.
- Daily report: country-level tax totals and zero-tax orders where tax expected.

## 10) Immediate Execution Order
1. Implement Stripe Tax quote endpoint (server-side).
2. Wire checkout totals to Stripe tax quote result.
3. Stop using Printful tax as checkout tax.
4. Link Stripe tax calculation to PaymentIntent.
5. Roll out country flags in this order: US -> CA -> MX -> EU/GB -> APAC.

## 11) Compliance Notes
- This architecture document is technical guidance, not tax/legal advice.
- Filing/remittance remains a business responsibility even with automated calculation.

## 12) Source References
- Stripe Tax setup and registrations: https://docs.stripe.com/tax/set-up
- Stripe custom payment flows with Tax + PaymentIntents: https://docs.stripe.com/tax/payment-intent
- Stripe shipping tax code guidance (`txcd_92010001`): https://docs.stripe.com/payments/during-payment/charge-shipping
- Stripe supported countries overview: https://docs.stripe.com/tax/supported-countries
- Stripe tax in Canada: https://docs.stripe.com/tax/supported-countries/canada/collect-tax
- Stripe tax in Mexico: https://docs.stripe.com/tax/supported-countries/latin-america/mexico
- Stripe Tax in EU: https://docs.stripe.com/tax/supported-countries/european-union
- Canada CRA GST/HST place-of-supply rates (includes NS change to 14% from 2025-04-01): https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html
- Revenu Quebec QST tables (9.975% current): https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/basic-rules-for-applying-the-gsthst-and-qst/tables-of-gst-and-qst-rates/
- SAT Mexico VAT legal basis (16% standard): https://wwwmatnp.sat.gob.mx/articulo/19848/articulo-1
- SAT Mexico border incentive (8% region program): https://www.sat.gob.mx/minisitio/EstimulosFiscalesFronteraNorteSur/region_fronteriza_norte_iva/en_que_consiste.html
- Printful shipping-rate API notes and tax-rate deprecation summary: https://developers.printful.com/docs/
