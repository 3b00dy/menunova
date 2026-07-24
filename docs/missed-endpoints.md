# Missed Endpoints

Single source of truth for backend endpoints the frontend needs, their current
status, and the stand-ins the frontend ships until the backend catches up.

- **Backend base URL:** `https://menunovaapi.onrender.com` (Swagger:
  https://menunovaapi.onrender.com/swagger/index.html) — the deployed service is
  the only backend; there is no local API project.
- **Frontend paths** are declared in [`src/shared/constants/api.ts`](../src/shared/constants/api.ts).
- Bodies are JSON, snake_case. Detailed request/response contracts for the
  still-missing endpoints live in [backend-endpoints-missing.md](./backend-endpoints-missing.md).

---

## Last update (auth)

`/auth/login`, `/auth/me`, `/auth/logout` are now **live** on the backend and
wired in the frontend. Two gotchas the frontend handles:

- **`GET /auth/me` returns a _bare_ user DTO** (`{ id, email, name, role,
  restaurant_id }`) — **not** a `{ token, user }` wrapper. `verify()` pairs the
  response with the caller's own token.
- The backend has **no `/auth/register`**. Self-serve signup is served by a
  **Next BFF route**, `POST /api/auth/register`
  ([route.ts](../src/app/api/auth/register/route.ts)), which mints a signed
  owner session (see [`session-token.ts`](../src/features/auth/infrastructure/session-token.ts)).
  `verify()` validates these BFF tokens locally, then falls back to `/auth/me`.

The backend also currently does **not enforce** bearer auth on mutations
(unauthenticated `POST /restaurants` etc. succeed), so BFF-signed sessions work
end-to-end; `/auth/me` is the one endpoint that does enforce.

---

## New / still-open endpoints

### Demo vs. live login (frontend behavior — no new backend endpoint)

The login page now supports two paths:

- **Demo** — signing in with a demo account (see
  [`demo-accounts.ts`](../src/features/auth/domain/demo-accounts.ts)) makes **no
  API call**; the app serves the seeded in-memory `demo` tenant for that session
  (restaurant admin + staff). Powered by per-request repository routing
  ([`request-routed-repository.ts`](../src/shared/data/request-routed-repository.ts)).
- **Live** — any other credentials call `POST /auth/login` and land the user on
  their real dashboard.

No backend work required for the demo; it is intentionally a client-only sandbox.

### Users (system-wide) — ✅ **LIVE + integrated** as of 2026-07-24 (super-admin Users page)

The super-admin **Users** page (`/dashboard/users`) manages every account on the
platform. Gated by `users:manage` (super_admin only). **These endpoints are now live**
(GET 200 · POST 201 · PATCH 200, partial patch supported · DELETE 204) and wired to the
HTTP repository in live mode; the demo still uses the seeded mock directory.

User DTO: `{ id, email, name, role, restaurant_id?, status, created_at?, last_active_at? }`
(`role` ∈ `super_admin|owner|staff|customer`; `status` ∈ `active|invited|suspended`).
**`restaurant_id` is the restaurant uuid** (`format: uuid`, FK → `restaurants.id`) — not the slug.
All calls require the bearer JWT.

| Method | Path | Purpose | Status |
|---|---|---|---|
| `GET` | `/users` | List every user account | ✅ live |
| `POST` | `/users` | Create a user (email, name, role, password, restaurant_id?) — also creates their login | ✅ live |
| `PATCH` | `/users/{id}` | Update name / role / status / restaurant (id in path) | ✅ live |
| `DELETE` | `/users/{id}` | Remove | ✅ live |

### Staff management — **still missing on the backend** (blocking for live staff)

Until these ship, live staff falls back to an empty team (the demo uses the mock
team). Gated by `staff:manage` (owner, super_admin); scoped to `{slug}`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/restaurants/{slug}/staff` | List a restaurant's staff |
| `POST` | `/restaurants/{slug}/staff` | Create a staff account (email, name, role, password) |
| `PATCH` | `/staff/{id}` | Change role / name (reject demoting the last owner → `422`) |
| `DELETE` | `/staff/{id}` | Remove (same last-owner rule) |

### Optional / future

| Method | Path | Purpose | Status |
|---|---|---|---|
| `POST` | `/auth/register` | Real backend signup (would replace the BFF route) | optional — BFF covers it today |
| `PATCH` | `/menu-items/{id}/availability` | Narrow availability-only toggle for staff | optional — general `PATCH /menu-items/{id}` works |
| `GET`/`PUT` | `/restaurants/{slug}/settings/theme` | Persist a restaurant's public-menu theme (design) JSON | **wired** on the frontend (Theme Builder saves per restaurant); backend endpoint still needed for live persistence |

---

## Summary checklist

| # | Method | Path | Gated by | Status |
|---|---|---|---|---|
| 1 | POST | `/auth/login` | public | ✅ live |
| 2 | GET | `/auth/me` | any authed | ✅ live (bare user DTO) |
| 3 | POST | `/auth/logout` | any authed | ✅ live |
| 4 | POST | `/auth/register` | public | frontend BFF (`/api/auth/register`); backend endpoint optional |
| 5 | GET | `/restaurants/{slug}/staff` | `staff:manage` | **missing — blocking (live staff)** |
| 6 | POST | `/restaurants/{slug}/staff` | `staff:manage` | **missing — creates staff + login** |
| 7 | PATCH | `/staff/{id}` | `staff:manage` | **missing** |
| 8 | DELETE | `/staff/{id}` | `staff:manage` | **missing** |
| 9 | PATCH | `/menu-items/{id}/availability` | `menu:availability` | optional |
| 10 | GET/PUT | `/restaurants/{slug}/settings/theme` | `settings:manage` | future |

Everything else the restaurant-admin flow needs (menu CRUD, categories,
language settings, restaurant CRUD) already exists and is wired.
