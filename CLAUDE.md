# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (Node ≥ 20.9). Turbopack is the default bundler.

- `pnpm dev` — dev server at http://localhost:3000 (outputs to `.next/dev`, so it can run concurrently with a build)
- `pnpm build` — production build
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint (flat config in `eslint.config.mjs`; `next lint` was removed in Next 16, and `next build` no longer lints)
- **Typecheck:** `npx next typegen && npx tsc --noEmit`. Run `next typegen` first — it regenerates `.next/types` route validators; skipping it after adding/moving/renaming a route yields stale phantom type errors.

There is **no test framework configured yet**. "Verify" means: typecheck, then drive the routes (`curl` or a browser) against `pnpm dev`.

## Architecture

MenuNova is a **multi-tenant restaurant-menu SaaS frontend**. Next.js is the frontend/BFF; it does **not** own a database — data comes from a **separate backend API over HTTP** (`NEXT_PUBLIC_API_URL`, default `http://localhost:4000`; set in `.env.local`).

### Framework: this is a modified Next.js 16 (see AGENTS.md)
Non-obvious differences from stock Next you will hit:
- Middleware is renamed to **`proxy.ts`** (`src/proxy.ts`, Node.js runtime only) — it does locale-prefix redirects and coarse dashboard auth gating.
- `params` / `searchParams` / `cookies()` / `headers()` are **async** — always `await`.
- Route file `params` types must match the framework's generated `PageProps`/`LayoutProps`, which type dynamic segments as **`string`** — declare `params: Promise<{ locale: string }>` and re-narrow to the `Locale` union at the destructure (`(await params) as { locale: Locale }`). A narrower declared type fails the route validator.
- `revalidateTag` requires a second cacheLife arg: `revalidateTag("menu:slug", "max")`.

### App Router shape (`src/app`)
- **There is deliberately no `src/app/layout.tsx`.** `src/app/[locale]/layout.tsx` **is** the root layout — it renders `<html dir>`/`<body>` because direction depends on the locale (standard App-Router i18n pattern). Don't add a top-level layout; it would break RTL.
- Route groups under `[locale]`: `(marketing)` (landing, pricing, auth, onboarding+checkout), `(dashboard)` (auth-gated owner/staff), `(public-menu)` (`r/[restaurantSlug]` customer menu). Group names are stripped from the URL.
- Two not-found files by design: `src/app/[locale]/not-found.tsx` renders **without** `<html>` (the locale layout provides it); `src/app/not-found.tsx` and `global-error.tsx` render **their own** `<html>` (they replace the root). Nesting two `<html>` tags causes a hydration mismatch — keep this split.

### Feature-first + layered (`src/features/<feature>`)
Each feature has `domain/` (entities, rules, **ports/interfaces** — no React/fetch/Next), `application/` (use-cases + `'use server'` actions), `infrastructure/` (HTTP repositories implementing the domain ports via `@/shared/http`), and `ui/`. Dependency direction is inward: `ui → application → domain`; `infrastructure` implements domain ports and is wired in at the edge.

- **Every feature exposes a single public barrel `index.ts`.** Code outside a feature imports **only** `@/features/<name>` — never deep paths (`.../domain`, `.../infrastructure`). `menu` is the fully-wired reference; `restaurant`/`auth`/`billing` are skeletons.
- `src/app` pages are the composition root: resolve params/session, call a use-case, render feature UI — keep them thin.
- Use-cases inject their repository (default = the HTTP one) so they're testable; query use-cases like `getMenu` swallow backend errors and return `null` so pages render an empty state when the API is down.

### Shared layer (`src/shared`) — importable by everyone, imports no feature
- `http/httpClient.ts` — the only place that calls `fetch`; base URL + auth header + `ApiError` normalization. Feature infrastructure builds on it.
- `i18n/` — `config.ts` is the source of truth for `locales` (`en`, `ar`) and `dir()`. Dictionaries are **server-loaded** (`getDictionary`) and handed to Client Components via `I18nProvider` (`useI18n`/`useTranslations`) — no client-side i18n fetching. Adding a locale = add to `config.ts` + a `dictionaries/<locale>.json`.
- `theme/` + `ui/styles/globals.css` — see Theming below.
- `config/routes.ts` — locale-aware URL builders; prefer over hardcoded paths.
- `auth/getServerSession.ts` — thin cookie read shared by `proxy.ts` and layouts; real role logic lives in the `auth` feature.

### Theming (the token contract — read `STYLE_GUIDE.md`)
All color/radius/shadow/font values are **CSS custom properties** in `globals.css` (`--color-*` as `"r g b"` triplets). Components **never hardcode hex** — they use `rgb(var(--color-x))`, `rounded-[var(--radius-active)]`, `shadow-[var(--shadow-active)]`. `ThemeProvider` (`src/shared/theme`) rewrites these variables at runtime (global mode → `documentElement`; `scoped` → a wrapping div), so the same components restyle per tenant with no code change. `applyThemeToElement` + `RADIUS_MAP`/`SHADOW_MAP` are the mapping. `--radius-active`/`--shadow-active` are seeded in `:root` for SSR (a Next adaptation; the source app kept them runtime-only). Fonts load via a Google-Fonts `@import` and the `--font-body` token (not `next/font`) so they're runtime-swappable. `cn()` is a thin `clsx` wrapper — there is intentionally **no `tailwind-merge`**.

### Client/Server boundaries
Server Components by default. Interactive/motion components carry `'use client'` (Modal, Sheet, Switch, Sidebar, FormControls, LanguagePicker, QueryBoundary, ThemeProvider, I18nProvider). **You cannot pass lucide icon components as props from a Server Component into a Client Component** (functions don't cross the RSC boundary) — build the icon-bearing item list inside a client component instead (see `(dashboard)/_components/DashboardNav.tsx`).
