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
*Next entry [ID: LQD_G9_V1]*
