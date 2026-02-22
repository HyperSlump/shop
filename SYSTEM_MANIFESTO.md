# HYPER$LUMP // SYSTEM MANIFESTO v1.0

## Core Aesthetic: Digital Brutalism / Industrial Sound Design
This document serves as the technical and visual baseline for the `hyper$lump` digital asset storefront. To preserve the "Industrial Dashboard" vibe, all future modifications must adhere to these structural and aesthetic rules.

---

## 1. Interaction & Timing [SYNC_STATE]
The system must feel like a singular hardware unit. 
- **Global Transition**: `300ms ease-in-out`.
- **Target**: Applied to `background-color`, `border-color`, and `color`.
- **Implementation**: Managed via `globals.css` on the `body` tag and inherited by global UI components (`Navigation`, `HorizontalNav`). Component-level transition overrides are prohibited to prevent "staggered" states.

## 2. Desktop Navigation [GRID_DOCK]
The interface uses a multi-axis fixed navigation system to maximize screen real estate and control.
- **Primary Axis (Vertical)**: `Fixed` sidebar on the left (`w-20`). Contains high-level system controls (Theme Sync, Cart Management).
- **Secondary Axis (Horizontal)**: `Sticky` category bar. It flows beneath the Hero section but docks at `top-0` once scrolled past.
- **Stacking Order**: 
    - Sidebar: `z-[145]` (Highest)
    - Horizontal Nav: `z-40` (Middle)
    - Main Content: `md:pl-20` (Gutter requirement)

## 3. Thematic Archetypes [COLOR_SCHEME]
The interface flips between two high-contrast industrial environments.

### Light Mode [SURGICAL_ENV]
- **Background**: `#EBE6DC` (Warm Bone)
- **Primary Accent**: `#9C1F1F` (Surgical Red)
- **Vibe**: Laboratory, high-precision technical manual.

### Dark Mode [CHASSIS_ENV]
- **Background**: `#0C0A09` (Warm Deep Chassis)
- **Primary Accent**: `#FF7F11` (Analog Searing Orange)
- **Vibe**: Internal circuitry, high-temperature digital synthesis.

## 4. Mobile Stability [M_LOCK]
To prevent layout "skewing" or horizontal shifts during swipes:
- **Root Overflow**: `overflow-x: clip` on `html` and `body`. (Crucial: Do not use `hidden` as it breaks `position: sticky`).
- **Cart Access**: Fixed "Ghost" button (`bottom-6 right-6`). Uses `bg-background/60` and `backdrop-blur-md` for minimalist presence.

## 5. Visual Grammar [STYLE_NODES]
- **Typography**: Mono-spaced fonts for technical data. Gothic/Display fonts for branding.
- **Numbers**: Cart counts and statuses should be raw numbers or bracketed data `[X]`, avoiding standard retail "bubble" badges.
- **Accents**: 4-corner accents and vertical "accent stripes" on cards to maintain an industrial feel.
- **Grain & Texture**: The `GrainedNoise` component is the standardized texture layer. Direct URL-based noise backgrounds are deprecated in favor of this React-native implementation to ensure synchronized animation and consistent density across all surfaces.

## 6. Global Textures [NOISE_LAYER]
To maintain the site-wide "Liquid Tech" depth:
- **Component**: `src/components/AestheticBackground.tsx` is the primary entry point for full-page backgrounds. It encapsulates the `site-backdrop` gradients, `GrainedNoise`, and CRT scanlines.
- **Implementation**: Avoid manual `site-backdrop` or `GrainedNoise` injection at the page level. Use `<AestheticBackground />` as the first child of the root container.
- **Calibration**: Standard scanline opacity is `10%` for general content and `15%` for checkout/industrial dashboard views.
*Document Generated: 2026-02-16*
*Status: ARCHIVE_STABLE*
