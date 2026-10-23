# Frontend ⇄ Backend Integration Audit

**Date:** 2026-07-24
**Backend:** `https://menunovaapi.onrender.com` (Swagger `/swagger/v1/swagger.json`)
**Method:** every backend endpoint probed live with a real `super_admin` token **and** a real
`owner` token (created via `POST /users`, then deleted); frontend call sites mapped from
`src/shared/constants/api.ts` + every `*.http.repository.ts`. All test data was cleaned up.

This answers: **do the endpoints match the frontend, and what must change** — with focus on
(a) restaurant self-service (own settings / theme / language, owner control) and (b) user
registration + plan selection.

---

## TL;DR — verdict

The **wire-level contracts match** (paths, bodies, snake_case, enums). Endpoints that were missing
last week — **`/users`, staff, and theme — are now all LIVE**, and the frontend repos already
target them. But there are **4 real blockers**, two of them in the frontend:

| # | Severity | Where | Problem | Status |
|---|---|---|---|---|
| **1** | 🔴 Blocker | **Frontend** | Owner logged in via the real backend gets `restaurantId = **UUID**`, but the menu/theme/language/staff pages use it as a **slug**. No id→slug bridge → owner can't load their own restaurant. | ✅ **FIXED** — `auth.http.repository.ts` now resolves uuid→slug via `GET /restaurants/by-id/{id}` (cached) when building the session. |
| **2** | 🔴 Blocker | **Backend + Frontend** | **No real user registration.** Signup mints a local/BFF token and persists **no backend user** → a self-registered owner can never log in again. No public registration endpoint exists. | ⛔ **Blocked on backend** — needs a public `POST /auth/register`; frontend can't fix alone. |
| **3** | 🔴 Blocker | **Backend** | **No tenant isolation.** An `owner` token can list, create, edit, and delete **any** restaurant (not just their own). Only `/users` is role-gated. | ⛔ **Backend fix required.** |
| **4** | 🟠 Major | **Frontend (stale)** | Staff & theme endpoints are **now live**, but the frontend repos still say "NOT YET IMPLEMENTED"; comments/docs are stale. | ✅ **FIXED** — repo/selector comments updated to "live and verified". |

Plus: plan selection **is** wired (sent to `POST /restaurants`), but there is **no billing/payment
endpoint** (checkout is mock); and `DELETE /restaurants/by-id/{id}` **500s** unless the menu tree is
emptied first (backend cascade bug, from the prior audit).

---

## Endpoint-by-endpoint match table

Legend: ✅ live & frontend matches · 🟠 live but frontend comment stale · 🔴 blocked by a defect ·
➖ optional/unused.

| Backend endpoint | Frontend caller | Live | Match? |
|---|---|---|---|
| `POST /auth/login` | `HttpAuthRepository.login` | ✅ | ✅ |
| `GET /auth/me` | `HttpAuthRepository.verify` | ✅ | ⚠️ returns `restaurant_id` = **uuid** → see #1 |
| `POST /auth/logout` | `HttpAuthRepository.logout` | ✅ | ✅ |
| *(none)* `POST /auth/register` | signup flow | ❌ absent | 🔴 #2 — no backend endpoint; frontend mints locally |
| `GET /restaurants` | `list` | ✅ | ✅ (but owner can call it too → #3) |
| `POST /restaurants` | `create` (sends `plan`) | ✅ | ✅ plan forwarded |
| `GET /restaurants/{slug}` | `getBySlug` | ✅ | ✅ |
| `GET /restaurants/by-id/{id}` | `getById` | ✅ | ✅ (exists but **never used to bridge** #1) |
| `PATCH /restaurants/by-id/{id}` | `update` | ✅ | ✅ (no ownership check → #3) |
| `DELETE /restaurants/by-id/{id}` | `delete` | ✅ | ⚠️ **500** if it has categories/items (cascade bug) |
| `GET /restaurants/{slug}/menu` | `getByRestaurantSlug` | ✅ | ✅ |
| `POST /restaurants/{slug}/categories` | `createCategory` | ✅ | ✅ (`restaurant_slug` now sent; path is authoritative) |
| `POST /restaurants/{slug}/menu-items` | `createItem` | ✅ | ✅ (`restaurant_slug` now sent) |
| `PATCH /menu-items/{id}` · `DELETE` | `updateItem` · `deleteItem` | ✅ | ✅ |
| `PATCH /categories/{id}` · `DELETE` | `updateCategory` · `deleteCategory` | ✅ | ✅ |
| `GET/PUT /restaurants/{slug}/settings/languages` | `restaurant-settings.http` | ✅ | ✅ |
| `GET/PUT /restaurants/{slug}/settings/theme` | `restaurant-theme.http` | ✅ **now live** | 🟠 works; repo comment says "not implemented" (#4) |
| `GET/POST /restaurants/{slug}/staff` | `staff.http` `list`/`create` | ✅ **now live** | 🟠 works (POST needs no `slug` in body); comment stale (#4) |
| `PATCH /staff/{id}` · `DELETE /staff/{id}` | `update` · `remove` | ✅ **now live** | 🟠 partial PATCH OK; comment stale (#4) |
| `GET/POST /users`, `PATCH/DELETE /users/{id}` | `users.http` | ✅ | ✅ (super-admin only — verified `owner` → 403) |
| `PATCH /menu-items/{id}/availability` | *(defined, unused)* | ❌ 404 | ➖ optional; not called |

---

## Finding 1 🔴 — Owner `restaurantId` is a UUID, pages expect a slug (FRONTEND)

**What the backend returns.** Verified live: after `POST /auth/login` as an owner, `GET /auth/me`
returns `restaurant_id` as a **UUID** (e.g. `019f722f-…`), not the slug.

**What the frontend does.** Every dashboard page feeds `session.user.restaurantId` **straight into
slug-keyed endpoints** with no conversion:
- `menu/page.tsx` → `getMenu(session.user.restaurantId)` → `GET /restaurants/{slug}/menu`
- `theme/page.tsx` → `getRestaurantTheme(restaurantId)` → `GET /restaurants/{slug}/settings/theme`
- `restaurant/page.tsx` → `getRestaurantSettings(restaurantId)` → `.../settings/languages`
- `staff/page.tsx` → `listStaff(restaurantId)` → `GET /restaurants/{slug}/staff`

`HttpRestaurantRepository.getById` (`/restaurants/by-id/{id}`) exists but is **never called to
resolve the slug** (confirmed by the frontend map — no id→slug lookup anywhere).

**Why it "works" today:** the only owner paths that ship are BFF-signup and demo, where
`restaurantId` happens to be the **slug** (`registerOwner.ts` sets `restaurantId: slug`;
demo account uses `"demo"`). A **real backend login** stores a **uuid** → all four pages call
`/restaurants/{uuid}/…` → 404 / empty state. The owner cannot see or edit their own restaurant.

**✅ FIX APPLIED.** `auth.http.repository.ts` now bridges uuid→slug at session build:
`userFromDto` calls `resolveRestaurantSlug()` → `GET /restaurants/by-id/{id}` (cached 300s, tagged)
and stores the **slug** in `session.user.restaurantId`. Applied to both `login()` and the
`verify()` `/auth/me` path. Falls back to the original value on any failure, which also covers
BFF/demo owners whose `restaurantId` is already a slug (the by-id lookup 404s → slug kept). Owners
authenticating via the real backend can now load their own menu/theme/language/staff pages.

Original options considered:
- In `HttpAuthRepository.verify`/`userFromDto` (`auth.http.repository.ts`), after `/auth/me`,
  call `GET /restaurants/by-id/{restaurant_id}` and store the **slug** in `session.user.restaurantId`
  (owner tokens are allowed to read by-id — verified 200). Keep the uuid separately if profile
  edits (`PATCH /restaurants/by-id/{id}`) need it.
- **Cleaner:** carry both on the session — add `restaurantSlug` (for slug-keyed pages) and keep
  `restaurantId` = uuid (for `by-id` profile writes). Update the four pages to use `restaurantSlug`.
- **Backend alternative:** make `/auth/me` also return `restaurant_slug`, and have the frontend
  prefer it. Least frontend churn.

---

## Finding 2 🔴 — No real user registration; plan selection has no billing (BACKEND + FRONTEND)

This is the gap you flagged ("I didn't see user registration endpoints and plan selection").

**Registration today (all local, nothing persisted):**
- The signup wizard (`/[locale]/register`, `OnboardingWizard`) collects account + plan + restaurant
  + theme, then calls the `registerOwner` server action.
- `registerOwner` → `authRepository.register(...)` which **mints a signed session token in-process**
  (`auth.http.repository.ts`) — it does **not** call any backend auth endpoint. (`POST /api/auth/register`
  BFF route exists but is not even invoked by the wizard.)
- **No backend user record is created.** Password is not stored; email uniqueness is not enforced.
- **Consequence (critical):** a self-registered owner has a session only until the token expires.
  There is **no account to log back into** — `POST /auth/login` would fail (no user exists). Their
  restaurant persists (see below) but becomes ownerless.

**The backend has no public registration path:**
- No `POST /auth/register`.
- `POST /users` **does** create a real, loginable account (verified: created an owner via `/users`,
  logged in successfully) — but it is **super-admin-only** (`owner`/anonymous → 401/403). So it
  cannot back self-serve signup.

**Plan selection — partially wired:**
- The plan IS chosen in the UI and IS sent: `registerOwner` → `provisionRestaurant({ plan })` →
  `POST /restaurants` with `plan` (`CreateRestaurantCommand.plan` ∈ `free|pro|enterprise`). ✅ The
  restaurant is created on the backend with the chosen plan.
- **But there is no billing/subscription/payment endpoint.** The payment step is explicitly mock
  ("nothing is charged"); `billing/infrastructure/` is empty and `listPlans()` is a hardcoded array.
  So "select a plan" sets a field; it does not gate features or take payment.

**What to modify:**
- **Backend (required):** add a **public `POST /auth/register`** that creates the user **and** their
  restaurant (with `plan`) in one call and returns `{ token, user }`, OR a public signup endpoint +
  open the user-creation path for self-serve. Enforce email uniqueness.
- **Frontend:** point `HttpAuthRepository.register` at the real endpoint and delete the local
  mint + BFF route (`session-token.ts`, `api/auth/register/route.ts`). Order so the account is
  created and reusable before `POST /restaurants`.
- **Billing (if plans are meant to be enforced/charged):** add plan/subscription endpoints and a
  real checkout; today it is display-only.

---

## Finding 3 🔴 — Backend enforces no tenant isolation (BACKEND, security)

Verified live with a real **owner** token scoped to `napoli`:

| Action as owner | Expected | Actual |
|---|---|---|
| `GET /restaurants/{ownSlug}`, own menu/languages | 200 | ✅ 200 |
| `PATCH /restaurants/by-id/{ownId}` (own profile) | 200 | ✅ 200 |
| `GET /restaurants` (list **all** tenants) | 403 | ❌ **200** |
| `POST /restaurants` (create a new tenant) | 403 | ❌ **201** |
| `PATCH /restaurants/by-id/{OTHER tenant}` | 403 | ❌ **200** (edited another restaurant) |
| `GET /users` | 403 | ✅ 403 |

So any owner, using their own JWT directly against the API, can read and modify **every**
restaurant on the platform. The frontend hides this (owners don't get the super-admin picker, and
server actions gate on permissions), but the **API itself is unprotected** — client-side gating is
the only thing stopping cross-tenant tampering.

**What to modify (backend):** enforce authorization per endpoint —
- restrict `GET /restaurants`, `POST /restaurants`, and `DELETE /restaurants/by-id/{id}` to
  `super_admin`;
- on `GET/PATCH /restaurants/by-id/{id}` and all `/{slug}/…` writes, verify the caller owns that
  restaurant (JWT `restaurant_id` matches) unless `super_admin`.

---

## Finding 4 🟠 — Staff & theme are live now; frontend/docs still say "missing"

Re-probed live (they 404'd in the 2026-07-21 run): **all now work.**
- Theme: `GET /restaurants/{slug}/settings/theme` → 204 empty / 200 with JSON; `PUT` → 200,
  persists (it's a passthrough JSON store — PUT what you GET). Frontend `restaurant-theme.http.ts`
  PUTs the raw `ThemeConfig` and GETs it back → shape-compatible.
- Staff: `GET` 200, `POST` 201 (frontend body `{email,name,role,password}` works — backend derives
  slug from the path), `PATCH /staff/{id}` 200 (partial patch OK), `DELETE` 204.

**What to modify (frontend, low-risk cleanup):** remove the "NOT YET IMPLEMENTED" notes and empty-
state fallbacks framing in `staff.http.repository.ts`, `restaurant-theme.http.ts`, and update
`docs/missed-endpoints.md` — these features are live. (Behavior already correct once Finding 1 is
fixed, since staff/theme pages are slug-keyed.)

---

## Secondary / carried-over

- **`DELETE /restaurants/by-id/{id}` → 500 when the restaurant has categories/items** (no cascade,
  despite the schema declaring `on delete cascade`). Super-admin delete fails for non-empty
  restaurants. Backend fix (cascade) or frontend workaround (tear down menu tree first).
- **`PATCH /menu-items/{id}/availability`** — 404; the frontend defines the constant but never
  calls it (general `PATCH /menu-items/{id}` covers availability). No action needed.
- **`restaurant_slug` in category/menu-item create bodies** — optional; backend uses the path slug.
  Frontend now sends it anyway for contract parity.

---

## Recommended order of work

1. **Backend:** public `POST /auth/register` (creates user + restaurant + plan) → unblocks real
   signup (Finding 2). Enforce per-tenant authorization (Finding 3).
2. **Frontend:** bridge owner `restaurantId` uuid→slug on session build (Finding 1) — the single
   change that makes real-login owners able to use menu/theme/language/staff.
3. **Frontend:** repoint `register` at the new backend endpoint; delete the local-mint/BFF path.
4. **Frontend/docs:** flip staff + theme from "missing" to live (Finding 4).
5. **Backend:** fix restaurant delete cascade.
