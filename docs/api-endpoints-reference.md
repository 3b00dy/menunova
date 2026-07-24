# Missed / Broken Endpoints

**Date:** 2026-07-21
**Backend:** `https://menunovaapi.onrender.com` · Swagger: `/swagger/v1/swagger.json`
**Frontend paths:** `src/shared/constants/api.ts`

Only the endpoints the frontend needs that are **not working** live (verified by direct probe with
a valid `super_admin` token). Everything else the app uses is live and passing — see
[`qa-flow-test-results.md`](./qa-flow-test-results.md).

Status legend: 🔒 present in Swagger but `403` · ❌ not implemented (`404`).

All bodies are JSON, **snake_case**. Localized fields (`name`, `description`) are
`{ "en": "...", "ar": "..." }`. Money is integer minor units (`price_minor`) + ISO `currency`.

---

## At a glance

| # | Method | Path | Feature | Status |
|---|---|---|---|---|
| 1 | GET | `/users` | users (super-admin) | 🔒 403 |
| 2 | POST | `/users` | users (super-admin) | 🔒 403 |
| 3 | PATCH | `/users/{id}` | users (super-admin) | 🔒 403 |
| 4 | DELETE | `/users/{id}` | users (super-admin) | 🔒 403 |
| 5 | GET | `/restaurants/{slug}/staff` | staff | ❌ 404 |
| 6 | POST | `/restaurants/{slug}/staff` | staff | ❌ 404 |
| 7 | PATCH | `/staff/{id}` | staff | ❌ 404 |
| 8 | DELETE | `/staff/{id}` | staff | ❌ 404 |
| 9 | GET | `/restaurants/{slug}/settings/theme` | theme-builder | ❌ 404 |
| 10 | PUT | `/restaurants/{slug}/settings/theme` | theme-builder | ❌ 404 |
| 11 | PATCH | `/menu-items/{id}/availability` | staff (optional) | ❌ 404 |
| 12 | POST | `/auth/register` | auth (optional) | ❌ 404 — BFF covers it |

**Totals:** 4 forbidden 🔒 · 8 missing ❌.

---

## 🔒 Present in Swagger but forbidden (403) — needs a backend authorization fix

These four **exist in Swagger** with full command/DTO schemas, but return **`403 Forbidden`** to a
valid `super_admin` Bearer token — the same token that works on `/restaurants`, `/categories`, etc.
Frontend effect: `listUsers` swallows the error → the super-admin Users page shows an **empty
list**; create/update/delete surface an `ApiError`.

| Method | Path | Purpose | Body |
|---|---|---|---|
| GET | `/users` | List every user account | — |
| POST | `/users` | Create user (+ login) | `CreateUserCommand` |
| PATCH | `/users/{id}` | Update name/role/status/restaurant | `UpdateUserCommand` |
| DELETE | `/users/{id}` | Remove user | — |

```json
// CreateUserCommand
{ "email":"…","name":"…","password":"•••","role":"staff",
  "status":"active","restaurant_id":"…" }
// UpdateUserCommand: { "id","name","role","status","restaurant_id" }
// UserDto: { "id","email","name","role","status","restaurant_id","created_at","last_active_at" }
// role ∈ super_admin|owner|staff|customer   status ∈ active|invited|suspended
```
**Backend action:** authorize `super_admin` on the `/users` controller (grant the policy/claim the
endpoints require), then re-verify. Suggested rule: reject deleting the last `super_admin` → `422`.

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
That doc lists `/users` as *missing*. **Update:** `/users` is now **published in Swagger** but
**returns 403** for super_admin — so it moved from "missing" to "present-but-unauthorized". Staff
and theme endpoints remain missing as documented.
