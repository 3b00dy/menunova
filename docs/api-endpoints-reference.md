# Missed / Broken Endpoints

**Date:** 2026-07-21
**Backend:** `https://menunovaapi.onrender.com` · Swagger: `/swagger/v1/swagger.json`
**Frontend paths:** `src/shared/constants/api.ts`

Only the endpoints the frontend needs that are **not working** live (verified by direct probe with
a valid `super_admin` token). Everything else the app uses is live and passing — see
[`qa-flow-test-results.md`](./qa-flow-test-results.md).

Status legend: ❌ not implemented (`404`).

> **Update (2026-07-24):** the `/users` endpoints (`GET|POST /users`, `PATCH|DELETE /users/{id}`)
> are now **fully live** — GET 200, POST 201, PATCH 200, DELETE 204, partial PATCH supported. The
> earlier `403` is gone. The frontend integration is wired and verified: `list()` forwards the
> bearer token and `restaurant_id` is sent as the restaurant **uuid** (`format: uuid`, FK →
> `restaurants.id`), not the slug. They are no longer "missed" and have been removed from the list
> below.

All bodies are JSON, **snake_case**. Localized fields (`name`, `description`) are
`{ "en": "...", "ar": "..." }`. Money is integer minor units (`price_minor`) + ISO `currency`.

---

## At a glance

| # | Method | Path | Feature | Status |
|---|---|---|---|---|
| 1 | GET | `/restaurants/{slug}/staff` | staff | ❌ 404 |
| 2 | POST | `/restaurants/{slug}/staff` | staff | ❌ 404 |
| 3 | PATCH | `/staff/{id}` | staff | ❌ 404 |
| 4 | DELETE | `/staff/{id}` | staff | ❌ 404 |
| 5 | GET | `/restaurants/{slug}/settings/theme` | theme-builder | ❌ 404 |
| 6 | PUT | `/restaurants/{slug}/settings/theme` | theme-builder | ❌ 404 |
| 7 | PATCH | `/menu-items/{id}/availability` | staff (optional) | ❌ 404 |
| 8 | POST | `/auth/register` | auth (optional) | ❌ 404 — BFF covers it |

**Totals:** 8 missing ❌. (`/users` CRUD moved to ✅ live — see the update note above.)

---

## ✅ `/users` — now live and integrated (was 🔒 403)

Verified 2026-07-24 with a super_admin token: `GET /users` → 200, `POST /users` → 201,
`PATCH /users/{id}` → 200 (partial patch supported), `DELETE /users/{id}` → 204. All require the
bearer JWT (global `Bearer` security). Frontend integration is wired and verified in
`src/features/users/` (`list()` forwards the token; `restaurant_id` sent as uuid).

| Method | Path | Purpose | Body |
|---|---|---|---|
| GET | `/users` | List every user account | — |
| POST | `/users` | Create user (+ login) | `CreateUserCommand` |
| PATCH | `/users/{id}` | Update name/role/status/restaurant (id in path) | `UpdateUserCommand` |
| DELETE | `/users/{id}` | Remove user | — |

```json
// CreateUserCommand
{ "email":"…","name":"…","password":"•••","role":"staff",
  "status":"active","restaurant_id":"<uuid, FK→restaurants.id>" }
// UpdateUserCommand: { "name","role","status","restaurant_id" }  (id from path)
// UserDto: { "id","email","name","role","status","restaurant_id","created_at","last_active_at" }
// role ∈ super_admin|owner|staff|customer   status ∈ active|invited|suspended
```

---

## ❌ Missing on the backend (404) — not yet implemented

### Staff management (blocking the staff/team feature)
Scoped to `{slug}`; gated by `staff:manage` (owner, super_admin) on the frontend.

| Method | Path | Purpose |
|---|---|---|
| GET | `/restaurants/{slug}/staff` | List a restaurant's staff → `StaffDto[]` |
| POST | `/restaurants/{slug}/staff` | Create staff + login (`{email,name,role,password}`) |
| PATCH | `/staff/{id}` | Change role/name (reject demoting last owner → `422`) |
| DELETE | `/staff/{id}` | Remove (same last-owner rule) |

```json
// StaffDto  →  { "id","email","name","role","status" }
```

### Theme persistence (Theme Builder)
| Method | Path | Purpose |
|---|---|---|
| GET | `/restaurants/{slug}/settings/theme` | Fetch a restaurant's public-menu theme JSON |
| PUT | `/restaurants/{slug}/settings/theme` | Persist theme JSON |

Frontend Theme Builder has a Save button wired; without these it falls back to
`DEFAULT_THEME_CONFIG` (no live persistence).

### Optional / future
| Method | Path | Purpose | Note |
|---|---|---|---|
| PATCH | `/menu-items/{id}/availability` | Narrow availability-only toggle for staff | Optional — general `PATCH /menu-items/{id}` already works |
| POST | `/auth/register` | Real backend signup | Optional — Next BFF `POST /api/auth/register` covers it today |

---

## Change vs. `docs/missed-endpoints.md`
That doc lists `/users` as *missing*. **Update (2026-07-24):** `/users` CRUD is now **fully live and
integrated** on the frontend (see the ✅ section above) — no longer missed. Staff and theme
endpoints remain missing as documented.
