# HYPER$LUMP // DESIGN LOCK 🔒
## Last Updated: 2026-02-23

> **PURPOSE**: This file is a frozen reference of all established design decisions.
> Nothing documented here should be modified unless the user explicitly requests it.
> AI agents must read this file before making ANY visual, layout, or UX changes.

---

## 1. COLOR SYSTEM — DO NOT CHANGE

### Light Mode
| Token | Value | Notes |
|---|---|---|
| `--background` | `#F3F3F3` | Warm Gray |
| `--foreground` | `#121517` | Near-black |
| `--primary` | `#C86A83` | Muted Rose |
| `--primary-foreground` | `#FFFFFF` | White |
| `--muted` | `#6D7478` | Cool gray |
| `--card` | `#FFFFFF` | Pure white |
| `--accent` | `#7BAAB2` | Teal |
| `--surface` | `rgba(255,255,255,0.88)` | Semi-transparent white |
| `--status` | `#7BAAB2` | Teal |
| `--alert` | `#D83A3D` | Red |
| `--border` | `rgba(18,21,23,0.16)` | Subtle dark outline |

### Dark Mode
| Token | Value | Notes |
|---|---|---|
| `--background` | `#060708` | Deep Chassis |
| `--foreground` | `#ECECEC` | Off-white |
| `--primary` | `#D83A3D` | Searing Red |
| `--primary-foreground` | `#FFF6F6` | Warm white |
| `--muted` | `#A7A0A4` | Warm gray |
| `--card` | `#111416` | Dark surface |
| `--accent` | `#7BAAB2` | Teal (shared) |
| `--surface` | `rgba(17,20,22,0.86)` | Semi-transparent dark |
| `--status` | `#7BAAB2` | Teal (shared) |
| `--alert` | `#F04A4D` | Bright red |
| `--border` | `rgba(167,160,164,0.28)` | Subtle light outline |

---

## 2. TYPOGRAPHY — DO NOT CHANGE

| Role | Font | CSS Variable | Usage |
|---|---|---|---|
| **Brand / Heading** | Jacquard 24 | `--font-heading` | Hero titles, `.heading-h1`, `.brand-logo-jacquard` |
| **Display** | UnifrakturMaguntia | `--font-display` | Blackletter accents |
| **Body / Sans** | Geist | `--font-sans` | All body text, headings (h1-h6 use `font-sans tracking-tight`) |
| **Mono / System** | Geist Mono | `--font-mono` | Buttons, technical data, HUD elements |

### Heading Classes (locked)
- `.heading-h1` — Jacquard 24, weight 400, letter-spacing 0.01em, line-height 0.92, `text-wrap: balance`
- `.jacquard-24-regular` — Jacquard 24, weight 400
- `.brand-logo-jacquard` — Jacquard 24 with `!important`, letter-spacing 0.01em, line-height 0.9

### Text Shadows (locked)
- Dark: `0 1px 0 rgba(255,255,255,0.1), 0 16px 36px rgba(0,0,0,0.42)`
- Light: `0 1px 0 rgba(15,23,42,0.06)`

---

## 3. BACKGROUND SYSTEM — DO NOT CHANGE

### Rule: `<AestheticBackground />` is the ONLY way to implement full-page backgrounds.
- Source: `src/components/AestheticBackground.tsx`
- Layers (z-order):
  1. `.site-backdrop` — Radial gradients (ambient glow, defined in globals.css)
  2. `<GrainedNoise />` — Film grain (OFF by default, `showGrain` prop)
  3. Scanlines — CRT sweep animation

### Grain Restriction (PERFORMANCE RULE)
- `<GrainedNoise />` is ONLY active in the Hero section (`PromoCarousel`)
- `showGrain` defaults to `false` on `<AestheticBackground />`
- DO NOT add grain to checkout, downloads, cart drawer, or mobile nav

### Site Backdrop Gradients (locked — `globals.css`)
**Dark mode:**
- Base: `#060708`
- Rose glow at top-left: `rgba(200,106,131,0.24)`
- Teal glow at top-right: `rgba(123,170,178,0.16)`
- Red glow at bottom: `rgba(216,58,61,0.08)`

**Light mode:**
- Base: `#f3f3f3`
- Same hues with reduced opacity

### Scanline Opacity
- General: `opacity-10`
- Checkout/industrial views: `opacity-15`

---

## 4. LAYOUT & NAVIGATION — DO NOT CHANGE

### Desktop Navigation (Multi-axis fixed system)
| Element | Position | Z-index | Notes |
|---|---|---|---|
| Sidebar (vertical) | Fixed left, `w-20` | `z-[145]` | Theme toggle, cart, system controls |
| Horizontal nav | Sticky, docks at `top-0` | `z-40` | Category filtering |
| Main content | `md:pl-20` gutter | — | Pushed right by sidebar |

### Mobile
- `overflow-x: clip` on `html` and `body` (NOT `hidden` — preserves `sticky`)
- Cart FAB: `bottom-6 right-6`, `bg-background/60`, `backdrop-blur-md`
- Cart FAB only renders when `cart.length > 0` (spring scale animation in/out)

### Hero Behavior
- HUD elements shift up for `PreviewPlayerDock` ONLY when `scrollY < 20`
- `PromoCarousel` shifts for dock OR cart FAB, only when at top
- Mobile: Title + CTA unified into single centered flex container (`justify-center`, 50% VH)
- Pagination: `01 // 05` monospaced HUD style, 8px, static (no color/scale animations)

---

## 5. BUTTON STANDARDS — DO NOT CHANGE

### All Buttons
- Font: `font-mono`
- Case: `uppercase`
- Tracking: `0.14em` to `0.25em`
- Corners: `rounded-md` (8px)
- Hover: Primary color glow shadow
- Labels: Human-readable, NO underscores (e.g., `browse catalog`, not `browse_catalog`)
- Cursor: `cursor-pointer` (global rule on `a` and `button`)

---

## 6. COMMERCE UI — DO NOT CHANGE

### Checkout
- NO outer card boxes/borders/shadows on payment form
- Fields float on industrial gradient background
- Noise restricted to LEFT COLUMN only
- Glass-morphism: `bg-card/40` + `backdrop-blur-2xl`

### Cart Drawer
- Background: Opaque `drawer-surface` gradient (NO `backdrop-blur`)
- Header: `bg-background/95`, `backdrop-blur-[2px]`, full-opacity `border-border`
- `transform: translateZ(0)` for hardware acceleration
- `<GrainedNoise />` is NOT used in the drawer

### Success Page
- Minimalist layout matching `/downloads`
- Brand logo header, border-bottom item count
- Transparent glass-morphism cards
- Industrial Stripe footer
- Professional copy ("Thank you for your order", "Ready to Download")
- Stripe-official receipt view (left-aligned images, qty badges, subtotal/shipping/total)
- `localStorage` sync for download persistence

### Downloads Page
- Header: lowercase "downloads"
- No redundant success messages
- Focus on download links + basic navigation

---

## 7. ANIMATION & TRANSITION RULES — DO NOT CHANGE

### Global Transition
- `300ms ease-in-out` on `background-color`, `border-color`, `color`
- Managed via `globals.css` on `body`
- **Component-level transition overrides are PROHIBITED**

### Custom Animations
| Name | Duration | Easing | Usage |
|---|---|---|---|
| `scan` | 4s linear infinite | — | CRT scanline sweep |
| `pulse-slow` | 3s cubic-bezier(0.4,0,0.6,1) infinite | — | Subtle pulsing |
| `fade-in-up` | 0.6s cubic-bezier(0.2,0.8,0.2,1) forwards | — | Entry animations |

### Delay Classes
- `.delay-100`, `.delay-200`, `.delay-300`

---

## 8. COMPONENT STACKING ORDER — DO NOT CHANGE

| Z-index | Component |
|---|---|
| `z-[145]` | Sidebar navigation |
| `z-40` | Horizontal nav |
| `z-0` to `z-20` | Noise/texture overlays |
| `-z-10` | AestheticBackground container |
| `-z-20` | site-backdrop gradients |

---

## 9. RADIUS SYSTEM — DO NOT CHANGE

| Token | Value |
|---|---|
| `--radius-xs` | 2px |
| `--radius-sm` | 4px |
| `--radius-DEFAULT` | 6px |
| `--radius-md` | 8px |
| `--radius-lg` | 10px |
| `--radius-xl` | 12px |
| `--radius-2xl` | 15px |
| `--radius-3xl` | 18px |

---

## 10. THIRD-PARTY INTEGRATIONS — DO NOT CHANGE

| Service | Purpose | Config Location |
|---|---|---|
| Stripe | Payments (digital checkout) | `.env.local`, `src/lib/stripe/` |
| Printful | Physical merch fulfillment | `src/lib/services/printfulService.ts` |
| Supabase | Database | `src/lib/supabase/` |
| Resend | Transactional email | `src/lib/resend.ts` |
| Vercel Blob | Media/image storage | Catalog `IMAGE_OVERRIDES` |

---

## 11. PRODUCT ARCHITECTURE — DO NOT CHANGE

- **Unified Catalog** (`src/lib/services/catalog.ts`): Merges Stripe digital + Printful physical into `Product[]`
- **Digital products**: Stripe price IDs, free download flow for $0 items
- **Physical products**: Printful IDs prefixed with `pf_`, variant support with image swapping
- **Metadata compression**: Only IDs/types in Stripe metadata (500-char limit)
- **Success page parsing**: Deep lookup against `allProducts` catalog using compressed IDs

---

## 12. THEME BEHAVIOR — DO NOT CHANGE

- **Default**: Dark mode (`className="dark"` on `<html>`)
- **Persistence**: `localStorage.getItem('theme')` — defaults to dark unless explicitly set to `light`
- **Toggle**: `ThemeToggle` component in sidebar
- **Variant selector**: `--variant-dark: .dark &` in `@theme` block

---

## 13. SCROLL & INTERACTION — DO NOT CHANGE

- **Smooth scroll**: Lenis (`SmoothScroll` component wraps entire app)
- **Scrollbar**: `scrollbar-gutter: stable` on `html`
- **Custom scrollbar**: `custom-scrollbar` class (4px width, themed colors)
- **Font smoothing**: `-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`
- **Text selection**: `selection:bg-primary/30 selection:text-foreground`

---

*This document is a FROZEN REFERENCE. Only update when the user explicitly changes a design decision.*
