# Backend — Missing Endpoints for the Restaurant-Admin Flow

**Audience:** backend developer (ASP.NET Core).

> **Status (updated):** `/auth/login`, `/auth/me`, `/auth/logout` are now **live** on the backend and wired in the frontend. `/auth/register` is **not** on the backend; the frontend serves it from a **BFF route** (`POST /api/auth/register`, see [`src/app/api/auth/register/route.ts`](../src/app/api/auth/register/route.ts)) that mints a signed owner session, so self-serve signup works in live mode today. The **staff** endpoints (§3) are still missing — that feature falls back to an empty state in live mode until they ship. See the updated checklist in §6.

**Context:** the frontend now has a complete role/permission model and a restaurant-admin flow (menu CRUD, staff management, availability toggling, settings). This document lists the endpoints the backend must add so the frontend can drop its BFF/mock stand-ins.

Base URL: `https://menunovaapi.onrender.com` (host root, no `/api` prefix).
All request/response bodies are JSON with **snake_case** keys (matches the existing endpoints — see [backend-data-model.md](./backend-data-model.md)).
All paths below are already declared in the frontend at [`src/shared/constants/api.ts`](../src/shared/constants/api.ts); the ones marked _NOT YET IMPLEMENTED_ there map 1:1 to this list.

---

## 1. Roles & permissions (the model the backend must honor)

The frontend authorizes every action against a **capability**, derived from the user's **role**. The backend is the source of truth for a user's role and must enforce the same matrix server-side (the frontend gating is UX only — it is **not** a security boundary).

| Role (`role` claim) | Meaning | Capabilities |
|---|---|---|
| `super_admin` | Platform owner (us) | Everything, incl. manage all restaurants |
| `owner` | **Restaurant admin** | Menu CRUD, availability, theme, settings, **staff management** — scoped to their own restaurant |
| `staff` | **Restaurant staff** | **Availability toggle only** — scoped to their own restaurant |
| `customer` | Public menu viewer | None (no dashboard access) |

Capability → who holds it:

| Capability | `super_admin` | `owner` | `staff` |
|---|:---:|:---:|:---:|
| `menu:manage` (CRUD categories/items) | ✅ | ✅ | — |
| `menu:availability` (toggle in/out of stock) | ✅ | ✅ | ✅ |
| `theme:manage` | ✅ | ✅ | — |
| `settings:manage` (languages, billing) | ✅ | ✅ | — |
| `staff:manage` | ✅ | ✅ | — |
| `restaurants:manage` (all tenants) | ✅ | — | — |

> Endpoints scoped to a restaurant (menu, staff, settings) must verify the caller's `restaurant_id` matches the target restaurant, **except** `super_admin` who may act on any.

---

## 2. Auth (blocking — needed before any live role behavior)

There is **no** auth flow yet. The frontend expects a bearer-token session whose token carries the user's `role` and `restaurant_id`.

### `POST /auth/login`
Request:
```json
{ "email": "owner@pizzapalace.test", "password": "…" }
```
Response `200`:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "u_owner",
    "email": "owner@pizzapalace.test",
    "role": "owner",
    "restaurant_id": "r_demo"
  }
}
```
`401` on bad credentials.

### `POST /auth/register`  _(self-serve signup + tenant provisioning)_
Creates the owner account **and** provisions their restaurant + language settings in one call, returning a logged-in session. Driven by the multi-step onboarding wizard; the frontend sends the owner-chosen `slug` (it must not be silently changed — return `409` on conflict).
Request:
```json
{
  "email": "owner@tonys.test",
  "password": "…",
  "name": "Tony Roma",
  "restaurant": {
    "name": "Tony's Pizza",
    "slug": "tonys-pizza",
    "plan": "free",
    "status": "trial",
    "logo_url": "https://…",        // optional
    "brand_color": "#D97706"        // optional
  },
  "settings": {
    "default_language": "en",
    "supported_languages": ["en", "ar"]
  }
}
```
Response `201`: the same `{ token, user }` shape as login (with `role: "owner"` and `restaurant_id` set). `409` if the email or slug is already taken. The backend should also persist the restaurant's language settings so `GET /restaurants/{slug}/settings/languages` reflects the choices immediately.

### `GET /auth/me`  _(token verification)_
Returns the current user for a bearer token, so the frontend can resolve the session on each request. Wired into `getSession()` (currently a TODO).
Response `200`: the same `user` object as above. `401` if the token is invalid/expired.

### `POST /auth/logout`
Invalidates the current token (or is a no-op for stateless JWT). Response `204`.

**JWT claims required:** `sub` (user id), `email`, `role` (one of the roles above), `restaurant_id` (null for `super_admin`/`customer`).

**Frontend touch-point:** [`src/features/auth/application/getSession.ts`](../src/features/auth/application/getSession.ts) — the `if (raw) { … verify … }` branch. Also [`src/features/auth/domain/auth.ports.ts`](../src/features/auth/domain/auth.ports.ts) (`login`/`verify`/`logout`).

---

## 3. Staff management (blocking for the staff feature)

Lets a restaurant admin invite / re-role / remove team members. Only `staff:manage` holders (owner, super_admin) may call these; scoped to `{slug}`'s restaurant.

`staff` object shape:
```json
{
  "id": "s_sara",
  "email": "sara@pizzapalace.test",
  "name": "Sara Karim",
  "role": "staff",          // "owner" | "staff"
}
```

### `GET /restaurants/{slug}/staff`
List the restaurant's staff. Response `200`: `staff[]`.

### `POST /restaurants/{slug}/staff`  _(create user)_
The admin **creates the account directly** (sets an initial password) — this is not an email invitation. The member is `active` immediately, and the backend MUST create a login for them (email + password + `role` + this restaurant's `restaurant_id`), so the person can sign in via `/auth/login`.
Request:
```json
{ "email": "sara@pizzapalace.test", "name": "Sara Karim", "role": "staff", "password": "…" }
```
Response `201`: the created `staff` (with `status: "active"`).
`409` if the email already belongs to the restaurant's team (or to any user).

### `PATCH /staff/{id}`  _(change role / name)_
Request (any subset):
```json
{ "role": "owner", "name": "Sara K." }
```
Response `200`: updated `staff`.
**Rule:** reject demoting/removing the **last** `owner` of a restaurant (`422` — a restaurant must keep at least one admin). The frontend enforces this in the mock too.

### `DELETE /staff/{id}`  _(remove)_
Response `204`. Same last-owner rule as above.

**Frontend touch-points:** [`src/features/staff/infrastructure/staff.http.repository.ts`](../src/features/staff/infrastructure/staff.http.repository.ts) (contract already coded), endpoints in `api.ts` (`restaurants.staff`, `staff.byId`).

---

## 4. Availability toggle (optional — a narrower endpoint for staff)

Staff may **only** change availability. Today the frontend calls the existing `PATCH /menu-items/{id}` with just `{ "available": true|false }`, which works. Optionally add a dedicated, minimal-scope endpoint so the backend can grant staff access to *only* this and nothing else on the item:

### `PATCH /menu-items/{id}/availability`  _(optional)_
Request: `{ "available": false }` → Response `200`: the updated menu item.

If you implement it, the frontend's `setItemAvailability` action ([`item-actions.ts`](../src/features/menu/application/item-actions.ts)) should point at `api.ts`'s `menuItems.availability(id)` instead of the general `menuItems.byId(id)`. Not blocking — the general PATCH is acceptable as long as the backend authorizes `available`-only changes for `staff`.

---

## 5. Settings / theme persistence (confirm coverage)

- **Languages** — already covered by `GET|PUT /restaurants/{slug}/settings/languages`. The frontend currently persists these to a mock; wiring a `RestaurantSettingsHttpRepository` is a small frontend follow-up once the endpoints are confirmed live. Gated by `settings:manage`.
- **Theme** — the Theme Builder is preview-only today (no persistence). When we add "save theme", it will need `GET|PUT /restaurants/{slug}/settings/theme` (theme config JSON). **Not required yet** — flagged so it's on your radar.

---

## 6. Summary checklist

| # | Method | Path | Gated by | Status |
|---|---|---|---|---|
| 1 | POST | `/auth/login` | public | ✅ live |
| 2 | POST | `/auth/register` | public | served by frontend BFF (`/api/auth/register`); backend endpoint still welcome |
| 3 | GET | `/auth/me` | any authed | ✅ live (returns a **bare** user DTO — no `{token,user}` wrapper) |
| 4 | POST | `/auth/logout` | any authed | ✅ live |
| 5 | GET | `/restaurants/{slug}/staff` | `staff:manage` | **missing — blocking (staff)** |
| 6 | POST | `/restaurants/{slug}/staff` | `staff:manage` | **missing — creates staff + login (password)** |
| 7 | PATCH | `/staff/{id}` | `staff:manage` | **missing — blocking (staff)** |
| 8 | DELETE | `/staff/{id}` | `staff:manage` | **missing — blocking (staff)** |
| 9 | PATCH | `/menu-items/{id}/availability` | `menu:availability` | optional |
| 10 | GET/PUT | `/restaurants/{slug}/settings/theme` | `settings:manage` | future |

Everything else the restaurant-admin flow needs (menu CRUD, categories, language settings, restaurant CRUD) already exists in Swagger and is wired.
