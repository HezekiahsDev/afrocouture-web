---
name: AfroCouture AI
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bec7d4'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#88919d'
  outline-variant: '#3f4852'
  surface-tint: '#98cbff'
  primary: '#98cbff'
  on-primary: '#003354'
  primary-container: '#00a3ff'
  on-primary-container: '#00375a'
  inverse-primary: '#00629d'
  secondary: '#93ccff'
  on-secondary: '#003351'
  secondary-container: '#3198dc'
  on-secondary-container: '#002c47'
  tertiary: '#2fd9f4'
  on-tertiary: '#00363e'
  tertiary-container: '#00acc3'
  on-tertiary-container: '#003a43'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#cfe5ff'
  primary-fixed-dim: '#98cbff'
  on-primary-fixed: '#001d33'
  on-primary-fixed-variant: '#004a77'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#a2eeff'
  tertiary-fixed-dim: '#2fd9f4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-trust, luxury African fashion marketplace powered by generative intelligence. The aesthetic merges haute couture sophistication with cutting-edge tech precision: deep obsidian and midnight slate foundations support glowing electric blue, vivid cyan, and subtle magenta-tinged accents. 

### Emotional Profile
- **Prestige & Heritage:** Reverence for bespoke African craftsmanship (Ankara, Kaftans, Aso Ebi, Agbada), communicated through rich imagery and sleek dark modes.
- **Uncompromised Trust:** High-visibility escrow guarantees, tailor verification badges, and crystal-clear transaction pipelines eliminate buyer friction and artisan hesitation.
- **Futuristic Fluidity:** AI design generation, fabric simulation, and virtual try-ons feel ethereal yet dependable through translucent glassmorphic surfaces, subtle light bleeds, and precise cyan micro-accents.

### Design Style: Modern Glassmorphic Dark Luxury
A blend of dark mode minimalism and luminous glassmorphism. Deep navy slate canvases (`#090D16`) provide negative space, while layered cards use slight transparency, hairline borders (`rgba(255, 255, 255, 0.08)`), and soft radial blue glow backdrops to generate dimensional hierarchy without clutter.

## Colors

The palette leverages an obsidian-navy bedrock with vivid luminous accents that illuminate trust, action, and intelligent features.

### Palette Architecture
- **Primary (`#00a3ff`):** Electric Azure. Drives critical interaction points, primary buttons, active state indicators, and verified badges.
- **Secondary (`#0284c7`):** Deep Sky Blue. Utilized for secondary elements, gradient stops, focused controls, and status pills.
- **Tertiary (`#22d3ee`):** Radiant Cyan. Reserved for AI indicators, active glowing borders, success states, and live pipeline pips.
- **Neutral Canvas & Surfaces:**
  - `Canvas / Background`: `#090D16` (Deep Obsidian Navy)
  - `Surface Tier 1 (Cards)`: `#0F172A` at `70% - 90%` opacity with hairline inner glow.
  - `Surface Tier 2 (Interactive inputs, raised cards)`: `#1E293B`
  - `Border / Hairline stroke`: `rgba(255, 255, 255, 0.08)` or `rgba(0, 163, 255, 0.25)` for active items.
- **Accents & Semantics:**
  - `Trust Escrow / Success`: `#10B981` (Emerald) & `#00A3FF` dual-indicator.
  - `AI Shimmer Accent`: Linear gradient running from `#00A3FF` through `#8B5CF6` to `#EC4899`.
  - `Text On Dark (High Contrast)`: `#F8FAFC` (Titles/Headers), `#94A3B8` (Subtitles/Metadata).

## Typography

Typography balances clean geometric authority with warm modernity. **Plus Jakarta Sans** provides structural elegance for editorial headings, tailoring descriptions, and prominent cards. **Inter** handles data-dense UI elements, pricing tags, badge identifiers, escrow verification steps, and status timelines.

### Implementation Rules
- **Editorial Headlines:** Employ tight negative tracking (`-0.015em` to `-0.02em`) for titles to create a contemporary luxury publication feel.
- **Numbers and Currency:** Always format with tabular numerals (`tnum`) in Inter for Nigerian Naira (₦) and global currency consistency across invoices and escrow calculations.
- **Contrast Ratios:** Primary body and headings must maintain an absolute contrast ratio of 10:1+ against `#090D16` and `#0F172A` glass backdrops.

## Layout & Spacing

The layout is constructed around an 8pt geometric grid system that scales smoothly from compact mobile views to expansive desktop dashboards.

### Grid & Responsiveness
- **Mobile (Phone):** Fluid 4-column layout, 16px screen margins (`margin: 1rem`), and 16px gutters (`gutter: 1rem`). Bottom navigation bar remains anchored with safe-area spacing.
- **Tablet / Large Handheld:** 8-column layout, 24px margins, 16px gutters.
- **Desktop:** 12-column fixed or constrained fluid grid (max width 1280px) with 40px outer margins (`margin-desktop: 2.5rem`) and 24px gutters.

### Component Spacing Rhythm
- Compact metadata blocks (e.g., tailor location, rating, badge chips) utilize `space-xs` (4px) to `space-sm` (8px).
- Card interiors apply consistent padding: `16px` (`space-md`) on mobile, scaling to `20px` or `24px` (`space-lg`) on desktop cards.
- Vertical section spacing maintains `space-xl` (40px) cadence to allow high-contrast garment photos to breathe.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows, but rather on luminous glass layers, subtle ambient halos, and crisp border boundaries.

### Layer Stacking Structure
- **Level 0 (Base Canvas):** Solid `#090D16`. Background displays subtle, low-opacity radial gradients of electric blue (`rgba(0, 163, 255, 0.08)`) and violet (`rgba(139, 92, 246, 0.05)`) placed strategically behind heroes or feature cards.
- **Level 1 (Surface Glass):** Fill `#0F172A` at 80% opacity, paired with a `backdrop-filter: blur(16px)` and an outer hairline border of `1px solid rgba(255, 255, 255, 0.08)`.
- **Level 2 (Interactive Floating & Modals):** Fill `#1E293B` at 90% opacity, `backdrop-filter: blur(24px)`, framed with `1px solid rgba(0, 163, 255, 0.25)`. A soft, diffused ambient shadow extends below: `0 12px 32px -4px rgba(0, 0, 0, 0.6)`.
- **Level 3 (AI Accentuated Focus):** Radiant stroke highlights using a linear gradient `border-image: linear-gradient(135deg, #00A3FF, #8B5CF6)` with an inner soft ambient glow: `box-shadow: 0 0 20px -3px rgba(0, 163, 255, 0.35)`.

## Shapes

The interface balances sleek structural geometry with soft tactile comfort (`roundedness: 2`).

### Corner Radius System
- **Micro Elements (Badges, Rating Tags, Dots):** `6px` to `8px` (`0.375rem` to `0.5rem`) for compact alignment.
- **Interactive Controls (Buttons, Inputs, Selectors):** `12px` (`0.75rem`) to `16px` (`1rem`) corner radius. Pills are reserved strictly for high-visibility triggers (e.g., "Get Started", "Generate", "Verified Badge").
- **Containers & Glass Cards:** `16px` (`1rem`) to `24px` (`1.5rem`) for tailored showcase cards, order status sheets, and photo tiles.
- **Avatars & Camera Circles:** Strictly `9999px` (Full Circular).

## Components

### Buttons
- **Primary Action (Electric Blue CTA):** Solid `#00A3FF` with dark text `#090D16` or white `#FFFFFF` (semibold `label-lg`). Includes a subtle inner highlight and a dynamic `0 4px 14px rgba(0, 163, 255, 0.4)` hover glow.
- **AI Magic CTA:** Radiant horizontal gradient (`#00A3FF` to `#9333EA`), accented with a small sparkle icon.
- **Secondary / Ghost:** Transparent dark slate `#0F172A` with `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`, transitioning to blue border on focus.

### Verified & Escrow Badges
- **Tailor Verification:** Pill badge (`#00A3FF` at 15% opacity, `1px solid #00A3FF`), featuring a small electric blue checkmark icon and `label-badge` text in `#38BDF8`.
- **Escrow Trust Indicator:** Subtle slate card with a secure lock icon, displaying "Wallet (Escrow): Payment held safely until work is completed" with a gentle green or blue indicator dot.

### Status Pipelines (Order Milestones)
- **Tracker Component:** Horizontal sequence linking circular milestone nodes (Placed, Cutting, Fitting, Completed).
  - *Completed / Active Step:* Solid `#00A3FF` circle with cyan center ring and connected electric blue progress line.
  - *Pending Step:* Translucent ring with muted outline `rgba(255, 255, 255, 0.2)` and muted text `#64748B`.

### Glass Cards & Product Grids
- **Tailor / Fabric Cards:** Top-half visual media with a subtle dark gradient vignette over images. Bottom portion includes artisan portrait, name, star rating (`#FBBF24`), verified badge, and pricing metadata.
- **Fabric Explorer Cards:** High-fidelity fabric texture previews with overlay labels (e.g., "Ankara Premium Cotton - ₦8,500/yd") encased in translucent frosted glass capsules.

### Form Inputs & Search Fields
- Dark slate surface `#0F172A` with `1px solid rgba(255, 255, 255, 0.1)`. Placeholder text in `#64748B`. Active focus state triggers an electric blue boundary glow (`border-color: #00A3FF`, `box-shadow: 0 0 0 3px rgba(0, 163, 255, 0.15)`).

### Tabs & Segmented Filters
- Pill-shaped dark background tray (`#090D16`), where the active tab lifts into a solid `#00A3FF` or `#1E293B` pill with crisp white typography.