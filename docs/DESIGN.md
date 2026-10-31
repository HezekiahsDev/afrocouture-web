---
name: IPILE
colors:
  canvas: '#F5F0E8'
  surface: '#FFFFFF'
  surface-container: '#EFE7DA'
  surface-high: '#E7DDCE'
  on-surface: '#171717'
  on-surface-variant: '#5F5A52'
  on-surface-muted: '#8A847A'
  outline: 'rgba(23, 23, 23, 0.10)'
  primary: '#B8734E'
  primary-dim: '#8F5637'
  secondary: '#1F2A42'
  success: '#2F6B4F'
  warning: '#8A6A1F'
  error: '#9B2C24'
typography:
  display-hero:
    fontFamily: Cormorant Garamond
    fontSize: 52px
    fontWeight: '600'
    lineHeight: 54px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 34px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Cormorant Garamond
    fontSize: 21px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
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
  sm: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
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

IPILE is a contemporary African luxury fashion-tech house. The interface should feel
editorial, calm, spacious, and premium — closer to a modern fashion house than a loud
e-commerce store or a generic technology startup.

The core idea: **every great creation begins with a foundation.** The name is inspired
by the Yoruba word *ipilė*, meaning foundation, beginning, or origin.

### Emotional Profile
- **Considered, not loud:** restrained headings, generous white space, thin dividers.
- **Human and service-led:** makers, materials, and trust signals lead; technology supports them.
- **Culturally grounded, globally legible:** African craftsmanship presented with clarity and confidence.

### Design Style: Warm Editorial Minimalism
Warm ivory paper surfaces, obsidian typography, and hairline rules. Craft Copper is a
restrained accent used for small details, selected states, and calls to action. Photography
is the primary color source; the interface should never compete with the clothing.

Avoid: excessive gradients, shiny gold effects, crowded screens, decorative patterns used
without purpose, and neon glassmorphism.

## Colors

| Token | Hex | Role | Balance |
| :--- | :--- | :--- | :--- |
| **Warm Ivory** | `#F5F0E8` | Primary canvas | 65% |
| **Obsidian Black** | `#171717` | Wordmark, text, navigation, strong CTAs | 25% |
| **Ink Blue** | `#1F2A42` | Secondary depth, selected surfaces, information states | 7% |
| **Craft Copper** | `#B8734E` | Small accents, dividers, badges, focus rings | 3% |

Pure white (`#FFFFFF`) is used for cards and raised surfaces alongside Warm Ivory.

### Usage Rules
- **Obsidian** carries typography and the dark navigation/footer chrome. The supplied logo
  is ivory/copper artwork, so it must sit on an obsidian field for contrast.
- **Warm Ivory** is the default page canvas. Avoid pure white full-page backgrounds.
- **Craft Copper** is an accent, not a dominant fill. Use it for selected states, small
  dividers, focus rings, badges, and primary actions.
- **Ink Blue** adds depth without introducing a second bright accent. Prefer it for
  informational chips, progress variants, and image overlays.
- **Semantics:** success `#2F6B4F`, warning `#8A6A1F`, error `#9B2C24` — tuned for
  contrast on light surfaces.
- **Accessibility:** verify body text at 4.5:1+ against ivory and white. Never place ivory
  logo artwork or white text on ivory/white surfaces.

## Typography

**Cormorant Garamond** is the editorial voice: heroes, section headings, card titles, and
pull quotes. **Inter** handles UI text, labels, forms, prices, badges, and body copy.

### Implementation Rules
- Headlines use medium weights (500–600) and slight negative tracking. Avoid heavy 800
  weights; luxury reads through restraint, not bulk.
- Emphasised phrases inside headlines are italic Cormorant in Craft Copper.
- Body copy stays Inter at 14–16px with a comfortable 1.6–1.8 line height.
- Prices and tabular data use Inter with `font-variant-numeric: tabular-nums`.
- CSS maps legacy `--font-jakarta` references to Cormorant Garamond; new work should use
  `--font-display` (serif) and `--font-ui` / `--font-sans` (Inter).

## Layout & Spacing

The layout follows an 8pt rhythm with generous editorial margins.

### Grid & Responsiveness
- **Mobile:** fluid single column, 16–24px side margins, stacked cards.
- **Tablet:** two-column card grids, 24px margins.
- **Desktop:** constrained content width up to 1376px with 40px outer margins; 12-column
  grids for catalog and dashboard layouts.
- **Navigation:** 80px sticky header. Dark obsidian chrome with the ivory/copper logo.
- **Footer:** obsidian field with copper kicker, editorial headline, and quiet legal links.

### Spacing Rhythm
- Section spacing is large and consistent (`64–120px`) to let imagery breathe.
- Card interiors use 16–24px padding; metadata groups use 4–12px gaps.
- Thin 1px rules in `rgba(23, 23, 23, 0.10)` separate sections without heavy boxes.

## Elevation & Depth

Depth comes from paper layering and hairline borders, not luminous halos.

- **Level 0 — Canvas:** Warm Ivory `#F5F0E8`, with very subtle copper/ink radial washes.
- **Level 1 — Cards:** White or `rgba(255,255,255,0.9)`, `1px solid rgba(23,23,23,0.10)`,
  soft neutral shadow on hover only.
- **Level 2 — Menus & Modals:** White surface, copper-tinted border, diffused shadow
  `0 18px 40px -16px rgba(23,23,23,0.28)`.
- **Level 3 — Dark image overlays:** Obsidian/Ink gradients behind white caption text on
  photography. Keep overlays local to the image, never across body content.
- Avoid glow effects. Use copper focus rings (`0 0 0 3px rgba(184,115,78,0.14)`) for
  interactive feedback instead.

## Shapes

Radii are restrained and consistent with a tailored, architectural feel.

- **Badges / small controls:** 6–8px (`0.375–0.5rem`).
- **Buttons / inputs / selects:** 8px (`0.5rem`), avoiding pill-shaped primary actions.
- **Cards / panels:** 12–16px (`0.75–1rem`) where softness helps; editorial image blocks may
  stay square.
- **Avatars / status dots:** full circle.
- Pills are reserved for verified badges, status chips, and compact filters.

## Components

### Buttons
- **Primary:** Craft Copper `#B8734E`, ivory text `#FFFDF8`, 8px radius. Hover deepens to
  `#A9643F`; shadow is soft and copper-tinted.
- **Secondary / Ghost:** Transparent or white with a hairline obsidian border and obsidian
  text; hover introduces a copper border.
- **AI action:** Copper-to-ink gradient used sparingly, with ivory text. Prefer the solid
  copper primary unless the action is explicitly generative.

### Verified & Trust Badges
- **Verified maker:** Copper at 10% fill, 1px copper border, deep copper text, uppercase
  micro-label.
- **Escrow / secure payment:** Ink Blue or success green indicator with a lock icon; copy
  states plainly that payment is held until work is completed.

### Order Milestones
- Horizontal tracker with 36px circular nodes.
- Completed node: solid Craft Copper with ivory icon and a soft copper ring.
- Active node: copper-tinted fill and copper ring.
- Pending node: white fill with a hairline obsidian border and muted label.

### Cards & Catalogs
- **Artisan / fabric cards:** white paper surface, hairline border, image on top, metadata
  below in Inter. Hover lifts subtly with a neutral shadow — no glow.
- **Dark path cards:** photography with an obsidian gradient overlay and ivory text; used
  only for the three primary discovery paths on the marketplace.
- **Image labels:** white/ivory text on a local dark gradient. Copper is reserved for the
  small index or kicker.

### Forms & Inputs
- White surface, `1px solid rgba(23,23,23,0.16)`, 8px radius, obsidian text.
- Placeholder `#8A847A`; focus border Craft Copper with a 3px copper-tinted ring.
- Errors use `#9B2C24` text and a soft `#F6E3E0` field tint.

### Navigation
- Obsidian header and footer only. The supplied logo (`public/img/logo.png`) is ivory and
  copper, so it is displayed on the dark chrome.
- On light portal/admin headers, use the ink variant (`public/img/logo-ink-trim.png`) so the
  wordmark stays legible on ivory.
- Primary nav labels are uppercase Inter at 12px with 0.06em tracking.

## Voice in UI

Tone: confident, refined, personal, clear, and culturally grounded.

- Prefer **“Your vision, thoughtfully made.”** over technical or hype-led headlines.
- Supporting line: **“Discover skilled makers, explore fabrics, and bring your next outfit
  to life.”**
- Primary CTA: **“Start your design.”**
- Brand line: **“Crafted around you.”**
- Describe AI as a design assistant that helps customers express ideas; never promise a
  perfect garment without review by a human maker.
