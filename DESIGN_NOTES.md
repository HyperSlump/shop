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
- **Mobile optimization**: Adjusted checkout summary padding (px-8 -> px-6) for tighter mobile clearance.
- **Implementation Rules**:
    1.  Always use `<GrainedNoise />` from `src/components/GrainedNoise.tsx`.
    2.  Avoid parent `opacity` filters on the noise container; the component's internal logic is already calibrated for the site-wide vibe.
    3.  Place as the last child in background containers or as an absolute overlay with `z-0` to `z-20` depending on content layering.

---
*Next entry [ID: LQD_G9_V1]*
