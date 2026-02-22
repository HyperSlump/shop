# hyper$lump // DESIGN & DEVELOPMENT NOTES

This document tracks critical design decisions and technical standards to maintain project consistency and prevent regression.

---

## [2026-02-21] Visual Consistency: Standardization of Full-Page Backgrounds
- **Decision**: The `AestheticBackground.tsx` component is now the PROJECT STANDARD for full-page backgrounds.
- **Rationale**: To ensure a unified and consistent "Liquid Tech" aesthetic across all pages, handling multiple background layers (gradients, noise, scanlines) in a synchronized and optimized manner.
- **Implementation Rules**:
    1.  Always use `<AestheticBackground />` from `src/components/AestheticBackground.tsx` for full-page backgrounds.
    2.  This component handles `site-backdrop` (gradients), `GrainedNoise` (texture), and scanlines (CRT effect) in the correct stacking order.
    3.  Avoid parent `opacity` filters on the background component.
    4.  Ensure the root page container is `bg-transparent` to allow the fixed background to render properly.

---
## [2026-02-21] Commerce UI: Minimalist RESTORATION
- **Decision**: Removed outer card boxes, borders, and shadows from the Checkout payment form and the Downloads success page.
- **Rationale**: To achieve a "Noir" minimalist feel where fields float directly on the industrial gradient/noise backgrounds. Restriction of noise to the Left Column in checkout ensures technical clarity for payment fields.
- **Header Copy**: Simplified downloads page to just "downloads" (lowercase) followed by removal of all redundant success messages. The focus is now strictly on the download links and basic navigation.
- **Transparency**: Background set to `bg-card/40` with `backdrop-blur-2xl` to allow "Liquid Tech" background elements to bleed through.

---
## [2026-02-21] Hero Interaction: Scroll-Conditional SHIFT
- **Decision**: Hero HUD elements (Title, CTA Area, Pagination) only shift upward to accommodate the `PreviewPlayerDock` if the user is at the VERY TOP of the page (`scrollY < 20`).
- **Rationale**: To prevent jarring layout jumps when the audio player is toggled while the user is already scrolling or exploring lower sections of the site.

---
## [2026-02-21] Mobile: Cart FAB Visibility Rule
- **Decision**: The floating mobile cart icon (FAB) only renders when the cart has at least 1 item. It animates in/out with a spring scale animation.
- **Rationale**: The cart icon should not occupy screen real estate when irrelevant. An empty cart state does not benefit from a persistent icon.
- **Hero Shift**: The `PromoCarousel` hero shifts content up when either the audio dock OR the cart FAB is visible AND the user is at the top of the page. Logic: `(isDockOpen || hasMobileCart) && isAtTop`.
- **Implementation Rules**:
    1.  Always use `<GrainedNoise />` from `src/components/GrainedNoise.tsx`.
    2.  Avoid parent `opacity` filters on the noise container; the component's internal logic is already calibrated for the site-wide vibe.
    3.  Place as the last child in background containers or as an absolute overlay with `z-0` to `z-20` depending on content layering.

---
## [2026-02-22] Bug Fix & Aesthetic Restoration: Success Page
- **Issue**: Build error fixed previously, but aesthetic had regressed to a non-standard centered card layout.
- **Resolution**: Refactored `src/app/success/page.tsx` to use a new `SuccessClient.tsx` component.
- **Aesthetic**: Re-implemented the minimalist look matching `/downloads` exactly (Brand logo header, border-bottom item count, transparent glass-morphism cards, and industrial Stripe footer).
- **Persistence**: Re-established `localStorage` syncing for immediate access to paid assets on the persistent `/downloads` route.

---
## [2026-02-22] Refinement: Professional E-commerce Polish
- **Language**: Standardized all copy to be professional and polished (e.g., "Thank you for your order", "Ready to Download"). Removed brand-specific jargon like "Transmission Received" to ensure clarity.
- **Order Summary**: Implemented a clean, Stripe-official receipt view for physical orders with clear itemization and status indicators.
- **Newsletter**: Integrated a minimalist, high-fidelity newsletter signup section as a standard post-purchase engagement point.
- **Upsell UX**: Refined hover effects on equipment upsells to a pure image zoom (removed blurs/overlays) for a more modern, minimal product display.
- **Aesthetic**: Solidified the "Industrial Minimalist" look, balancing the Jacquard brand typography with clean, system-level e-commerce UI patterns.

---
## [2026-02-22] Order Summary: High-Fidelity Stripe Receipt Alignment
- **Decision**: Enhanced the success page's physical order summary to exactly mirror the Stripe Checkout UX (Left-aligned images with qty badges, itemized pricing, and full subtotal/shipping/total breakdown).
- **Technical Improvement**: Updated `checkpoint-sessions` API to pass rich item metadata (images, formatted names, unit prices) in the session's `metadata.item_details`.
- **Retrieval Logic**: Success page now uses robust dual-source logic: prioritizing the rich metadata from the session while falling back to expanded `line_items` from the Stripe API if needed.
- **UI Details**: Implemented rounded-xl image containers with hover scaling and a dedicated "Status: Processing" badge to provide immediate transaction confidence.

## [2026-02-22] Checkout: Metadata Compression & Character Limit Resiliency
- **Issue**: Payment form would fail to load when multiple items were in the cart due to Stripe's 500-character limit on metadata values.
- **Decision**: Compressed `item_details` metadata to store only IDs and types (`v_id`, `qty`, `id`). Removed redundant strings (names, image URLs) from the payload.
- **Success Page Resiliency**: Re-implemented the success page parser to perform deep lookup against the `allProducts` catalog using the compressed IDs. 
- **Rationale**: Ensures the checkout form is robust regardless of cart size while still maintaining high-fidelity visuals on the thank you page.
- **Reliability Fix**: Corrected variable definition order in `SuccessPage` to ensure product catalog is loaded before metadata parsing, fixing $0.00 price display issues.
- **Cart Lifecycle**: Integrated `useCart` into the success page and free-order logic to automatically clear the session cart upon purchase.
- **Aggressive Clearing**: Updated `clearCart` logic to explicitly wipe `localStorage` for immediate redundancy, preventing "phantom" items on return.
- **UI Navigation Fix**: Moved `clearCart` calls to the destination landing pages (`/success` and `/downloads`) to prevent the checkout page from flashing a "Cart is Empty" state before the redirect completes.

## [2026-02-22] Stable Version: Checkout & Receipt Refinement
- **Milestone**: Version 1.2 Stable.
- **Summary**: All major checkout blockers (character limits, price display issues, cart persistence) have been resolved.
- **Visuals**: Standardized receipt UI with monospace totals and industrial minimalist aesthetic.

## [2026-02-22] Technical Polish: Mobile Flicker & Drawer Optimization
- **Issue**: Mobile users reported "black flashes" around the edges of the cart drawer during transitions.
- **Root Cause**: Excessive use of `backdrop-filter` (blur) on animating drawer layers combined with semi-transparent background gradients, straining the mobile GPU's tiling engine.
- **Resolution**: 
    1.  Removed all `backdrop-blur` effects from the `CartDrawer` overlay, header, and footer.
    2.  Standardized the `.drawer-surface` background to be a solid, opaque linear gradient to prevent "over-blending" artifacts.
    3.  Added `transform: translateZ(0)` to the drawer container to force hardware acceleration.
- **Workflow Compliance**: Verified a "clean install" of the `<GrainedNoise />` component. Noise is now the primary visual texture over an opaque industrial gradient, matching the site-wide "Liquid Tech" standard without redundant layering.
- **Mobile Navigation**: Added `<GrainedNoise />` to the mobile navigation dropdown to ensure the industrial texture is present even in high-level navigation states.
- **Button Standardization**: Unified all primary and secondary buttons across the product page, checkout flows, and cart drawer. 
    1.  **Typography**: Switched to `font-mono`, `uppercase`, and widened `tracking` (0.14em to 0.25em).
    2.  **Geometry**: Standardized on `rounded-md` (8px) corners across all button types.
    3.  **Labelling**: Reverted to simplified, human-readable labels (e.g., `preview`, `playing`, `add to cart`, `added`) used on the product cards to ensure cross-page consistency. The monospaced uppercase styling maintains the industrial aesthetic without sacrificing clarity.
    4.  **Polish**: Aligned hover states and shadows to use the primary color glow.
- **UI Consistency**: Updated the `CartDrawer` header to match the site's `HorizontalNav` aesthetic. It now uses `bg-background/95` with `backdrop-blur-[2px]` and a full-opacity `border-border`, creating a cohesive "System Bar" look across all transient UI surfaces in both light and dark modes.
- **Grain Restriction**: Restricted the `<GrainedNoise />` effect exclusively to the Hero section (`PromoCarousel`).
    1.  **Reason**: Eliminated potential animation conflicts and GPU strain during the checkout process and mobile navigation.
    2.  **Implementation**: Added a `showGrain` prop to `AestheticBackground` (default: `false`) and removed manual injections from all UI components except the central hero carousel.
    3.  **Cleanup**: Removed all unused imports and tags from the storefront, checkout, and download flows.
- **Hero Pagination**: Replaced the numeric `01 / 05` counter with an industrial symbol animation (`▰` / `▱`). Symbols act as interactive pagination points, enhancing the "HUD" feel of the hero landing.


