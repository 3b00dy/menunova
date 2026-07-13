
# MenuNova — Style Extraction (exact clone spec)

This is the **complete, verbatim design system** of the MenuNova frontend. An agent
recreating the project should reproduce these tokens, CSS, and component recipes
**exactly** — every class string and value below is copied from the live code.

The whole system rests on one idea: **all colors/radii/shadows/fonts are CSS custom
properties (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`).** Components never
hardcode hex colors — they read `rgb(var(--color-x))`. A `ThemeProvider` rewrites
those variables at runtime, so the same components restyle per tenant with zero code
changes. Clone this contract first; everything else follows from it.

---

## 1. Stack & tooling

- **React 19** + **Vite 8** + **TypeScript** (strict, path alias `@/* → src/*`)
- **Tailwind CSS v4** via `@tailwindcss/vite` — **no `tailwind.config.js`**; config is
  the single `@import "tailwindcss";` line in `index.css`. Arbitrary-value classes
  (`bg-[rgb(var(--color-primary))]`) carry the theme.
- **clsx** for class merging (there is a thin `cn()` wrapper — see §8)
- **lucide-react** for all icons (`^0.469`)
- **motion** (`motion/react`, Framer Motion v11) for modal/sheet animation
- Fonts loaded via a **Google Fonts `@import`** at the top of `index.css` (not self-hosted)

Exact dependency block (`package.json`):

```json
"dependencies": {
  "@tailwindcss/vite": "^4.3.0",
  "@tanstack/react-query": "^5.101.2",
  "clsx": "^2.1.1",
  "lucide-react": "^0.469.0",
  "motion": "^11.18.2",
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-router-dom": "^7.15.1",
  "tailwindcss": "^4.3.0",
  "zod": "^4.4.3",
  "zustand": "^5.0.13"
}
```

---

## 2. `src/index.css` — copy verbatim

This file defines the **default token layer**, base resets, and the four preset
`.theme-*` classes. Reproduce it exactly.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&family=Tajawal:wght@400;500;700&family=Almarai:wght@400;700&display=swap');
@import "tailwindcss";

/* Default theme tokens — overridden per tenant by ThemeProvider at runtime.
   Customer-facing components must read these CSS variables (never hardcode colors). */
:root {
  /* MenuNova brand palette — Dark Navy primary, Emerald accent, Canvas White. */
  --color-primary: 15 23 42;
  --color-primary-fg: 255 255 255;
  --color-secondary: 22 163 74;
  --color-accent: 5 150 105;
  --color-bg: 255 255 255;
  --color-surface: 248 250 252;
  --color-text: 15 23 42;
  --color-muted: 100 116 139;
  --color-border: 226 232 240;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 9999px;

  --shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04);
  --shadow-pronounced: 0 8px 30px rgba(0, 0, 0, 0.12);

  --font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  font-family: var(--font-body);
  line-height: 1.5;
  color-scheme: light;
}

html,
body,
#root {
  margin: 0;
  min-height: 100vh;
  background-color: rgb(var(--color-bg));
  color: rgb(var(--color-text));
}

* {
  box-sizing: border-box;
}

[dir="rtl"] {
  font-family: var(--font-body);
}

/* Theme presets only set CSS variables — components remain generic. */
.theme-luxury {
  --color-primary: 18 18 18;
  --color-primary-fg: 248 226 165;
  --color-secondary: 212 175 55;
  --color-accent: 250 204 21;
  --color-bg: 12 12 12;
  --color-surface: 24 24 24;
  --color-text: 245 245 245;
  --color-muted: 161 161 170;
  --color-border: 39 39 42;
  --shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-pronounced: 0 12px 40px rgba(0, 0, 0, 0.6);
  color-scheme: dark;
}

.theme-modern-minimal {
  --color-primary: 17 17 17;
  --color-primary-fg: 255 255 255;
  --color-secondary: 99 102 241;
  --color-accent: 79 70 229;
  --color-bg: 255 255 255;
  --color-surface: 249 250 251;
  --color-text: 17 17 17;
  --color-muted: 107 114 128;
  --color-border: 229 231 235;
}

.theme-fast-food {
  --color-primary: 220 38 38;
  --color-primary-fg: 255 255 255;
  --color-secondary: 250 204 21;
  --color-accent: 234 88 12;
  --color-bg: 255 251 235;
  --color-surface: 255 255 255;
  --color-text: 23 23 23;
  --color-muted: 120 113 108;
  --color-border: 254 215 170;
}

.theme-traditional-arabic {
  --color-primary: 120 53 15;
  --color-primary-fg: 254 243 199;
  --color-secondary: 180 83 9;
  --color-accent: 217 119 6;
  --color-bg: 255 251 235;
  --color-surface: 254 243 199;
  --color-text: 41 37 36;
  --color-muted: 120 113 108;
  --color-border: 231 187 122;
}

/* Hide scrollbar for horizontal category strips */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  scrollbar-width: none;
}
```

---

## 3. Design tokens (reference table)

Colors are stored as **space-separated RGB triplets** (`"15 23 42"`), consumed as
`rgb(var(--color-x))`. This lets Tailwind opacity modifiers work: `bg-[rgb(var(--color-accent))]/10`.

### 3.1 Default (MenuNova brand) palette

| Token | Value (RGB) | Hex | Role |
|---|---|---|---|
| `--color-primary` | `15 23 42` | `#0F172A` | Dark Navy — primary actions, active nav, brand badge |
| `--color-primary-fg` | `255 255 255` | `#FFFFFF` | text on primary |
| `--color-secondary` | `22 163 74` | `#16A34A` | Emerald — brand accent / secondary |
| `--color-accent` | `5 150 105` | `#059669` | Emerald-600 — focus rings, highlights |
| `--color-bg` | `255 255 255` | `#FFFFFF` | Canvas White — page background |
| `--color-surface` | `248 250 252` | `#F8FAFC` | Slate-50 — cards, sidebar, raised surfaces |
| `--color-text` | `15 23 42` | `#0F172A` | body text |
| `--color-muted` | `100 116 139` | `#64748B` | Slate-500 — secondary text, hints, icons |
| `--color-border` | `226 232 240` | `#E2E8F0` | Slate-200 — borders, dividers |

Brand hexes from the identity: Primary Dark Navy `#0F172A`, Accent Emerald `#16A34A`,
optional Amber Gold `#F59E0B`, Canvas White background.

### 3.2 Radius scale

| Token | Value |
|---|---|
| `--radius-sm` | `6px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `16px` |
| `--radius-pill` | `9999px` |
| `--radius-active` | *set at runtime by ThemeProvider* — the "current theme's" radius |

### 3.3 Shadow scale

| Token | Value |
|---|---|
| `--shadow-soft` | `0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04)` |
| `--shadow-pronounced` | `0 8px 30px rgba(0,0,0,.12)` |
| `--shadow-active` | *set at runtime by ThemeProvider* — the "current theme's" shadow |

### 3.4 Typography tokens

| Token | Default |
|---|---|
| `--font-body` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| `--font-heading` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |

Base `line-height: 1.5`. Fonts loaded: **Inter, Poppins, Manrope, DM Sans, Playfair
Display, Cormorant Garamond** (Latin) + **Cairo, Tajawal, Almarai** (Arabic/multilingual).

> **`--radius-active` / `--shadow-active` are runtime-only** — not declared in `:root`.
> They are written by `ThemeProvider` (§5). Components that must match the tenant's
> chosen radius/shadow read `var(--radius-active)` / `var(--shadow-active)`; the static
> `--radius-sm/md/lg` and `--shadow-soft/pronounced` are the palette they map from.

---

## 4. The theme data model (`RestaurantTheme`)

Every tenant's look is this object (TypeScript shape in `@/types`). The Theme Builder
edits it; `ThemeProvider` applies it.

```ts
type RestaurantTheme = {
  preset: 'luxury' | 'modern-minimal' | 'fast-food' | 'traditional-arabic' | 'custom'
  layout: 'delivery' | 'luxury' | 'grid' | 'classic'
  direction: 'ltr' | 'rtl'
  colors: {
    primary: string      // "r g b" triplet, e.g. "15 23 42"
    primaryFg: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    muted: string
    border: string
  }
  typography: { fontFamily: string; headingFamily: string }
  components: {
    borderRadius: 'sm' | 'md' | 'lg' | 'pill'
    shadow: 'none' | 'soft' | 'pronounced'
    buttonStyle: 'rounded' | 'pill' | 'square'
  }
}
```

---

## 5. `ThemeProvider` — the runtime engine (`src/theme/ThemeProvider.tsx`)

Reproduce exactly. It maps the theme's semantic radius/shadow choices to CSS values
and writes **all** variables onto either `document.documentElement` (global) or a
wrapping `div` (`scoped` — used by the Theme Builder live preview).

```tsx
const RADIUS_MAP: Record<RestaurantTheme['components']['borderRadius'], string> = {
  sm: '6px',
  md: '12px',
  lg: '20px',
  pill: '9999px',
}

const SHADOW_MAP: Record<RestaurantTheme['components']['shadow'], string> = {
  none: 'none',
  soft: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.06)',
  pronounced: '0 12px 40px rgba(0, 0, 0, 0.18)',
}

function applyThemeToElement(theme: RestaurantTheme, el: HTMLElement) {
  const { colors, typography, components } = theme
  el.style.setProperty('--color-primary', colors.primary)
  el.style.setProperty('--color-primary-fg', colors.primaryFg)
  el.style.setProperty('--color-secondary', colors.secondary)
  el.style.setProperty('--color-accent', colors.accent)
  el.style.setProperty('--color-bg', colors.background)
  el.style.setProperty('--color-surface', colors.surface)
  el.style.setProperty('--color-text', colors.text)
  el.style.setProperty('--color-muted', colors.muted)
  el.style.setProperty('--color-border', colors.border)
  el.style.setProperty('--radius-active', RADIUS_MAP[components.borderRadius])
  el.style.setProperty('--shadow-active', SHADOW_MAP[components.shadow])
  el.style.setProperty('--font-body', typography.fontFamily)
  el.style.setProperty('--font-heading', typography.headingFamily)
}
```

- **Global mode:** on mount, applies to `documentElement` and sets `dir=theme.direction`;
  cleanup resets `dir` to `ltr`.
- **Scoped mode (`scoped`):** renders a wrapping `<div dir=... style={{fontFamily,color,bg}}>`
  and applies variables to that ref — so a preview pane themes independently of the page.
- Exposes `useTheme()` (throws outside provider).

> Note the deliberate divergence: `index.css` seeds `--radius-md: 10px` and
> `--shadow-soft` at 0.04/0.04 opacity, but `ThemeProvider`'s `RADIUS_MAP.md = 12px`
> and `SHADOW_MAP.soft` uses 0.04/0.06. The CSS values are the pre-theme default; once a
> theme mounts, the JS maps win via `--radius-active` / `--shadow-active`. Keep both.

### 5.1 Admin chrome theme (`src/theme/adminTheme.ts`)

Both dashboards wrap in `<ThemeProvider theme={ADMIN_THEME}>` so admin UI stays neutral
regardless of tenant brand:

```ts
export const ADMIN_THEME: RestaurantTheme = {
  preset: 'custom',
  layout: 'grid',
  direction: 'ltr',
  colors: {
    primary: '15 23 42', primaryFg: '255 255 255',
    secondary: '22 163 74', accent: '5 150 105',
    background: '248 250 252', surface: '255 255 255',
    text: '15 23 42', muted: '100 116 139', border: '226 232 240',
  },
  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    headingFamily: "'Inter', system-ui, sans-serif",
  },
  components: { borderRadius: 'md', shadow: 'soft', buttonStyle: 'rounded' },
}
```

---

## 6. Theme presets (`src/theme/presets.ts`)

Four built-in presets (customer-menu looks). Reproduce values exactly.

| Preset | primary | accent | bg / surface | text | heading font | radius / shadow / button | layout / dir |
|---|---|---|---|---|---|---|---|
| **luxury** "Luxury Dark + Gold" | `18 18 18` | `250 204 21` | `12 12 12` / `24 24 24` | `245 245 245` | Playfair Display serif | sm / pronounced / square | luxury / ltr |
| **modern-minimal** "Modern Minimal" | `17 17 17` | `79 70 229` | `255 255 255` / `249 250 251` | `17 17 17` | Inter | md / soft / rounded | grid / ltr |
| **fast-food** "Fast Food Vibrant" | `220 38 38` | `234 88 12` | `255 251 235` / `255 255 255` | `23 23 23` | Poppins | lg / soft / pill | delivery / ltr |
| **traditional-arabic** "Traditional Arabic" | `120 53 15` | `217 119 6` | `255 251 235` / `254 243 199` | `41 37 36` | Cairo/Tajawal | md / soft / rounded | classic / **rtl** |

Full detail (secondary/primaryFg/muted/border) is in §2's `.theme-*` classes, which
mirror these. Label maps:

```ts
PRESET_LABELS = {
  luxury: 'Luxury Dark + Gold', 'modern-minimal': 'Modern Minimal',
  'fast-food': 'Fast Food Vibrant', 'traditional-arabic': 'Traditional Arabic',
  custom: 'Custom',
}
LAYOUT_LABELS = {
  delivery: 'Delivery Style', luxury: 'Luxury Restaurant',
  grid: 'Visual Grid', classic: 'Classic Menu',
}
```

### 6.1 Font options offered by the Theme Builder

```ts
FONT_OPTIONS = [
  { value: "'Inter', system-ui, sans-serif",             label: 'Inter',              category: 'sans' },
  { value: "'Poppins', system-ui, sans-serif",           label: 'Poppins',            category: 'sans' },
  { value: "'Manrope', system-ui, sans-serif",           label: 'Manrope',            category: 'sans' },
  { value: "'DM Sans', system-ui, sans-serif",           label: 'DM Sans',            category: 'sans' },
  { value: "'Playfair Display', Georgia, serif",         label: 'Playfair Display',   category: 'display',      note: 'Elegant headings' },
  { value: "'Cormorant Garamond', Georgia, serif",       label: 'Cormorant Garamond', category: 'serif',        note: 'Editorial serif' },
  { value: "'Cairo', system-ui, sans-serif",             label: 'Cairo',              category: 'multilingual', note: 'Latin + Arabic' },
  { value: "'Tajawal', system-ui, sans-serif",           label: 'Tajawal',            category: 'multilingual', note: 'Latin + Arabic' },
  { value: "'Almarai', system-ui, sans-serif",           label: 'Almarai',            category: 'multilingual', note: 'Latin + Arabic' },
  { value: 'system-ui, -apple-system, sans-serif',       label: 'System default',     category: 'sans' },
]
```

---

## 7. Component recipes (verbatim class strings)

These are the exact Tailwind class strings for each UI primitive. **Reproduce the
class strings exactly** — they encode the whole visual language. All read theme
variables; none hardcode color.

### 7.1 Button (`variant` × `size`)
Base: `inline-flex items-center justify-center gap-2 font-medium transition-opacity rounded-[var(--radius-active)] shadow-[var(--shadow-active)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg))]`

| variant | classes |
|---|---|
| `primary` | `bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))] hover:opacity-90 active:opacity-80` |
| `secondary` | `bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-primary))] hover:opacity-90` |
| `ghost` | `bg-transparent text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]` |
| `outline` | `bg-transparent text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]` |
| `danger` | `bg-red-600 text-white hover:bg-red-700` |

| size | classes |
|---|---|
| `sm` | `h-8 px-3 text-sm` |
| `md` | `h-10 px-4 text-sm` |
| `lg` | `h-12 px-6 text-base` |

`block` → `w-full`. Defaults: `variant=primary`, `size=md`.

### 7.2 Card
- `Card`: `bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-[var(--radius-active)] shadow-[var(--shadow-active)]`
- `CardBody`: `p-5`
- `CardHeader`: `px-5 py-4 border-b border-[rgb(var(--color-border))]`

### 7.3 Badge (`tone`)
Base: `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium`

| tone | classes |
|---|---|
| `neutral` | `bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] border-[rgb(var(--color-border))]` |
| `success` | `bg-emerald-100 text-emerald-700 border-emerald-200` |
| `warning` | `bg-amber-100 text-amber-700 border-amber-200` |
| `danger` | `bg-red-100 text-red-700 border-red-200` |
| `info` | `bg-sky-100 text-sky-700 border-sky-200` |
| `accent` | `bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))]/30` |

> Status/semantic tones (success/warning/danger/info) deliberately use **fixed Tailwind
> palette colors**, not theme vars — status meaning stays constant across brands. Only
> `neutral`/`accent` follow the theme.

### 7.4 Input / Textarea / Label / Field
- Shared base: `w-full bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-[var(--radius-active)] px-3 py-2 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]`
- `Input` adds `h-10`; `Textarea` adds `min-h-[88px]`
- `Label`: `text-xs font-medium text-[rgb(var(--color-muted))]`
- `Field`: column, `gap-1.5`; hint text `text-xs text-[rgb(var(--color-muted))]`

### 7.5 PageHeader
- Wrapper: `flex flex-wrap items-end justify-between gap-4 mb-6`
- Title `h1`: `text-2xl font-semibold tracking-tight text-[rgb(var(--color-text))]`
- Description: `mt-1 text-sm text-[rgb(var(--color-muted))] max-w-xl`
- Actions: `flex items-center gap-2`

### 7.6 Sidebar / MobileNav
- `Sidebar` aside: `hidden md:flex w-64 shrink-0 flex-col border-e border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]`
  - brand block: `px-5 py-5 border-b border-[rgb(var(--color-border))]`
  - nav: `flex-1 px-3 py-4 space-y-1`
  - nav item base: `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors`
    - active: `bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]`
    - idle: `text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-bg))]`
  - icons: `h-4 w-4`; footer block: `px-3 py-4 border-t border-[rgb(var(--color-border))]`
- `MobileNav` nav: `md:hidden sticky top-0 z-30 flex gap-1 overflow-x-auto no-scrollbar bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] px-3 py-2`
  - item base: `shrink-0 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors` (active = primary bg pill)

### 7.7 Modal (motion)
- Overlay wrapper: `fixed inset-0 z-50 flex items-center justify-center p-4`; backdrop `absolute inset-0 bg-black/50`
- Panel: `relative w-full ${widthMap[size]} bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`
  - `widthMap = { sm:'max-w-md', md:'max-w-xl', lg:'max-w-3xl' }`
  - motion: `initial {opacity:0, scale:.96, y:12}` → `animate {opacity:1, scale:1, y:0}`, `transition {type:'spring', damping:28, stiffness:320}`
  - header: `flex items-start justify-between gap-4 px-6 pt-6`; title `text-lg font-semibold`; body `px-6 py-5 overflow-y-auto flex-1`; footer `px-6 py-4 border-t ... flex justify-end gap-2`

### 7.8 Sheet (mobile-first bottom sheet — customer item details)
- Wrapper: `fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4`; backdrop `absolute inset-0 bg-black/60 backdrop-blur-sm`
- Panel: `relative w-full sm:max-w-lg bg-[rgb(var(--color-bg))] border-t sm:border border-[rgb(var(--color-border))] rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col`
  - motion: `initial {y:'100%'}` → `animate {y:0}` → `exit {y:'100%'}`, `transition {type:'spring', damping:32, stiffness:280}`
  - drag handle: `h-1.5 w-12 rounded-full bg-[rgb(var(--color-border))]` (mobile only)
  - close button: `absolute top-4 end-4 z-10 h-9 w-9 rounded-full bg-black/40 text-white grid place-items-center`

### 7.9 Switch (toggle)
- Track button: `relative h-6 w-11 rounded-full transition-colors` — on `bg-[rgb(var(--color-primary))]`, off `bg-[rgb(var(--color-border))]`
- Knob: `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform` — on `translate-x-5 rtl:-translate-x-5 left-0.5`, off `left-0.5`

### 7.10 EmptyState
- Wrapper: `flex flex-col items-center justify-center text-center py-16 px-6`
- Icon bubble: `h-14 w-14 rounded-full bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] grid place-items-center text-[rgb(var(--color-muted))]` (default icon `Inbox` `h-6 w-6`)
- Title: `mt-4 text-base font-semibold text-[rgb(var(--color-text))]`; description `mt-1 max-w-sm text-sm text-[rgb(var(--color-muted))]`

### 7.11 Spinner
`<Loader2 className="animate-spin" />` (lucide) — that's the whole component.

---

## 8. Utilities (`src/lib/utils.ts`)

```ts
import clsx, { type ClassValue } from 'clsx'
export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

// currency-aware price formatter (IQD → 0 decimals, else 2)
export function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency,
      maximumFractionDigits: currency === 'IQD' ? 0 : 2,
    }).format(value)
  } catch { return `${value} ${currency}` }
}

export function slugify(input: string) { /* lowercase, NFKD, strip diacritics, [^a-z0-9]→-, trim, slice(0,48) */ }
export function id(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2, 9)}` }
```

> There is **no `tailwind-merge`** — `cn` is a thin `clsx` wrapper. Keep it that way; last-class-wins conflicts are avoided by construction.

---

## 9. Brand assets (`src/components/ui/BrandLogo.tsx`)

The **Nova-M** mark: on a 12×12 grid, two navy pillars bridged by a floating emerald
"sync node". Pillars use `currentColor` (inherit surrounding text color); node is
hardcoded emerald `#16A34A`.

```tsx
// BrandMark — the icon
<svg viewBox="0 0 12 12" fill="none" aria-hidden focusable="false">
  <rect x="0" y="0" width="3" height="12" rx="0.75" fill="currentColor" />
  <rect x="9" y="0" width="3" height="12" rx="0.75" fill="currentColor" />
  <rect x="3.5" y="3.5" width="5" height="3" rx="0.75" fill="#16A34A" />
</svg>
```

- **`BrandBadge`** — the mark on a navy squircle (app-icon lockup):
  `grid place-items-center bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]` +
  size (`sm: h-7 w-7 rounded-lg`, `md: h-8 w-8 rounded-lg`, `lg: h-11 w-11 rounded-xl`);
  inner mark `h-1/2 w-1/2`.
- **`BrandWordmark`** — `inline-flex items-baseline`:
  `<span class="font-bold tracking-[-0.02em]">Menu</span><span class="font-medium tracking-[0.04em]">Nova</span>`.
  Sentence case only — never MENUNOVA / menunova.
- **`BrandLogo`** — horizontal lockup: `flex items-center gap-2` → `<BrandBadge/> <BrandWordmark/>`.

`index.html` head: `<meta name="theme-color" content="#0F172A" />`, favicon
`/favicon.svg` = navy squircle (24% iOS corner radius) + the Nova-M mark, node `#16A34A`,
pillars `#F8FAFC`.

---

## 10. Layout & interaction conventions

- **Customer menu is mobile-first**: item details in a bottom `Sheet` (§7.8); horizontal
  category strips use `.no-scrollbar` (defined in `index.css`); no page reloads.
- **RTL is first-class**: `dir` is driven by `theme.direction`; use logical properties
  (`border-e`, `end-4`, `me/ms`) and `rtl:` variants (see Switch knob) — never left/right.
- **Two dashboards** (super-admin, restaurant/chain/mall admin) share `Sidebar`+`MobileNav`
  and wrap in `ADMIN_THEME` for neutral chrome. Active nav item = solid `--color-primary`.
- **Focus states**: buttons use `focus-visible:ring-2 ring-[--color-accent] ring-offset-2`;
  inputs use `focus:ring-2 ring-[--color-accent]`.
- **Motion**: only Modal + Sheet animate, both spring-based via `motion/react` +
  `AnimatePresence`. Keep transitions subtle (`transition-opacity`, `transition-colors`).
- **Icons**: lucide-react everywhere, default `h-4 w-4` in nav, `h-6 w-6` in empty states.

---

## 11. Clone checklist (build order)

1. Scaffold **React 19 + Vite 8 + TS strict**, alias `@/* → src/*`, install deps (§1).
2. Add Tailwind v4 via `@tailwindcss/vite` (no config file).
3. Drop in **`src/index.css` verbatim** (§2) — this is the token foundation.
4. Define the `RestaurantTheme` type (§4) in `@/types`.
5. Build **`ThemeProvider`** with the exact RADIUS_MAP/SHADOW_MAP and `applyThemeToElement` (§5).
6. Add `adminTheme.ts` (§5.1) and `presets.ts` (§6, all four presets + labels + FONT_OPTIONS).
7. Add `src/lib/utils.ts` (`cn`, `formatPrice`, `slugify`, `id`) (§8).
8. Build UI primitives with the **exact class strings** in §7 (Button, Card, Badge,
   Input/Field, PageHeader, Sidebar/MobileNav, Modal, Sheet, Switch, EmptyState, Spinner).
9. Add `BrandLogo.tsx` brand assets (§9) + `index.html` head + favicon.
10. Verify: every component reads `rgb(var(--color-*))` / `var(--radius-active)` /
    `var(--shadow-active)` — **zero hardcoded hex** outside `index.css`, presets, and the
    emerald node in `BrandMark`.
