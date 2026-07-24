# QA Flow Test Results

**Date:** 2026-07-21
**Backend under test:** `https://menunovaapi.onrender.com` (live, deployed service — the only backend)
**Frontend data mode:** `MENUNOVA_DATA_MODE=live` (`.env.local`) — repos hit the real API
**Method:** Direct HTTP probes against the live backend (the exact endpoints/bodies the
frontend repositories send), plus the Next BFF route (`http://localhost:3000`) for registration.
Super-admin credentials used: `admin@menunova.com`.

Legend: ✅ pass · ⚠️ works but with a caveat · ❌ fail / not implemented

---

## Executive summary

| Flow | Result | Notes |
|---|---|---|
| Registration | ✅ Pass | Served by the Next BFF (`/api/auth/register`); backend has no signup by design |
| Auth (login / me / logout guard) | ✅ Pass | Correct 200/401 behavior, bare `me` DTO as documented |
| Restaurant admin | ✅ Pass | Create / read / update / language settings all live |
| Menu (with changes) | ✅ Pass | Category + item create/update/delete, changes persist |
| Staff | ❌ Fail | All staff endpoints return **404 — not implemented** on the backend |
| Super admin — restaurants | ✅ Pass | List + delete work with the super_admin token |
| Super admin — **Users** | ❌ Fail | `/users` endpoints exist in Swagger but return **403** for a valid super_admin token |

**Headline finding:** the `/users` endpoints (previously documented as "missing") are now
**published in Swagger but return `403 Forbidden`** even to a valid `super_admin` JWT — so the
super-admin Users management page is still non-functional in live mode. See
[Finding A](#finding-a--users-endpoints-return-403-for-super_admin).

---

## 1. Registration flow ✅

The onboarding wizard's `registerOwner` action calls the **Next BFF** route, then provisions the
restaurant via `POST /restaurants`.

| Step | Request | Result |
|---|---|---|
| BFF signup | `POST http://localhost:3000/api/auth/register` `{name,email,password,restaurantName}` | **201** — returns `{token, user}` with `role: "owner"`, real HS256 session |
| Backend signup absent | `POST /auth/register` | **404** (expected — no backend signup; BFF owns it) |
| Restaurant provisioning | `POST /restaurants` | **200** (covered in the restaurant-admin flow below) |

**Verdict:** works end-to-end. Caveat (by design): the BFF does not persist the password or
enforce email uniqueness — it only mints the session. See `src/app/api/auth/register/route.ts`.

---

## 2. Auth flow ✅

| Step | Request | Expected | Result |
|---|---|---|---|
| Super-admin login | `POST /auth/login` (correct creds) | 200 + `{token,user}` | ✅ **200**, `role: super_admin`, `restaurant_id: null` |
| Wrong password | `POST /auth/login` (bad creds) | 401 | ✅ **401** `{"message":"Invalid email or password."}` |
| Verify token | `GET /auth/me` (Bearer) | 200 bare DTO | ✅ **200** `{id,email,name,role,restaurant_id}` (no wrapper — as documented) |
| Missing token | `GET /auth/me` (no header) | 401 | ✅ **401** |

---

## 3. Restaurant admin flow ✅

A throwaway restaurant (`qa-probe-…`) was created, exercised, and deleted during the run.

| Step | Request | Result |
|---|---|---|
| Create | `POST /restaurants` `{name,slug,owner_email,plan:"free",status:"trial"}` | ✅ created, returns full `RestaurantDto` with `id`, `created_at` |
| Read by slug | `GET /restaurants/{slug}` | ✅ **200** |
| Update | `PATCH /restaurants/by-id/{id}` (rename + `plan:"pro"`, `status:"active"`) | ✅ **200**, changes reflected |
| Language settings — read | `GET /restaurants/{slug}/settings/languages` | ✅ **200** `{default_language:"en",supported_languages:["en"]}` |
| Language settings — write | `PUT /restaurants/{slug}/settings/languages` (`ar` default, `["en","ar"]`) | ✅ **200**, persisted |

---

## 4. Menu flow with changes ✅

Localized names/descriptions (`{en, ar}`) round-tripped correctly.

| Step | Request | Result |
|---|---|---|
| Create category | `POST /restaurants/{slug}/categories` `{name:{en,ar},position:1}` | ✅ created |
| Create item | `POST /restaurants/{slug}/menu-items` (`price_minor:4500`, `currency:"SAR"`, `available:true`) | ✅ created |
| **Change** item | `PATCH /menu-items/{id}` (`price_minor:5200`, `available:false`) | ✅ **200**, both changes applied |
| **Change** category | `PATCH /categories/{id}` (rename + `position:2`) | ✅ **200** |
| Verify persistence | `GET /restaurants/{slug}/menu` | ✅ **200** — reflects new price, `available:false`, renamed category |
| Delete item | `DELETE /menu-items/{id}` | ✅ **204** |
| Delete category | `DELETE /categories/{id}` | ✅ **204** |

**Verdict:** full menu CRUD + edit cycle works and persists.

---

## 5. Staff flow ❌

Every staff endpoint the frontend expects returns **404 Not Found** on the backend.

| Step | Request | Result |
|---|---|---|
| List staff | `GET /restaurants/{slug}/staff` | ❌ **404** |
| Invite staff | `POST /restaurants/{slug}/staff` | ❌ **404** |
| Change role | `PATCH /staff/{id}` | ❌ **404** |
| Remove staff | `DELETE /staff/{id}` | ❌ **404** |
| (optional) availability toggle | `PATCH /menu-items/{id}/availability` | ❌ **404** (optional; general item `PATCH` works) |

**Frontend behavior:** `listStaff` swallows the error → the team page renders **empty** in live
mode (no crash). Invite/edit/remove **actions surface an `ApiError`** to the user. The demo
session still shows the seeded mock team. **This flow is blocked until the backend ships these
endpoints.**

---

## 6. Super admin flow

### Restaurants — ✅
| Step | Request | Result |
|---|---|---|
| List all | `GET /restaurants` | ✅ **200**, returned all tenants (`napoli`, `test-diner-probe`, `ptest`) |
| Delete | `DELETE /restaurants/by-id/{id}` | ✅ **204** (used to clean up the probe restaurant) |

### Users management — ❌ (see Finding A)
| Step | Request | Result |
|---|---|---|
| List users | `GET /users` | ❌ **403** (with valid super_admin Bearer) |
| Create user | `POST /users` | ❌ **403** |
| Update / delete user | `PATCH` / `DELETE /users/{id}` | Not reachable (blocked by the 403 above) |

---

## Findings

### Finding A — `/users` endpoints return 403 for super_admin (backend) + list sent no token (frontend, FIXED)
- **Severity:** High (blocks the entire super-admin Users page in live mode).
- **What changed:** the repo docs (`docs/missed-endpoints.md`) list `/users` as *missing on the
  backend*. As of this run they **exist in Swagger** (`GET/POST /users`, `PATCH/DELETE /users/{id}`)
  but return **`403 Forbidden`** — even though the decoded JWT clearly carries `role: super_admin`
  and the same token is accepted by `/restaurants`, `/categories`, etc.
- **Two stacked problems** (confirmed by probing the auth model —
  `GET /users` no token → **401**, with super_admin token → **403**, `GET /restaurants` no token → 200):
  1. **Frontend bug (FIXED):** `HttpUsersRepository.list()` was called **without a bearer token**
     (`UsersRepository.list()` had no token param), while every mutation forwarded one. So the live
     list request was **unauthenticated → 401** — it could never work even once the backend grants
     access. Fixed by threading the token through `list(token)` and resolving it in `listUsers` via
     `requirePermission("users:manage")`, mirroring the create/update/delete actions.
     Files: `users.ports.ts`, `users.http.repository.ts`, `application/list-users.ts`.
  2. **Backend bug (open):** even **with** a valid super_admin token, `/users` returns **403** —
     an authorization policy on the `/users` controller the super_admin principal doesn't satisfy
     (missing claim/policy mapping), or a stubbed blanket deny.
- **User-facing effect:** `listUsers` swallows the error, so the page shows an **empty list**
  (looks like "no users" rather than an error); create/update/delete show a failure toast.
- **Remaining action:** backend to grant super_admin access to `/users` (and confirm the `403`
  isn't a stub). The frontend now authenticates correctly, so the flow unblocks the moment the
  backend policy is fixed.

### Finding B — Staff endpoints not implemented (404)
- **Severity:** High for the staff/team feature; expected per existing docs.
- All four staff endpoints + the optional availability toggle return **404**. Documented as
  pending in `docs/missed-endpoints.md`; confirmed still missing.

### Finding C — Theme persistence endpoint not implemented (404)
- `GET/PUT /restaurants/{slug}/settings/theme` return **404**. The Theme Builder saves per
  restaurant on the frontend, but there is **no live persistence** — it falls back to
  `DEFAULT_THEME_CONFIG`. Expected per docs; confirmed.

---

## What was NOT covered (and why)
- **Full UI click-through** (server actions, cookies, redirects) — verified at the API layer,
  which is what the live-mode repositories call. The one browser-only piece (BFF register) was hit
  directly.
- **`POST /auth/logout`** — present in Swagger; not invalidated during the run to keep the shared
  super-admin token alive for the suite. Wired in `HttpAuthRepository`.
- **Load / concurrency / RTL rendering** — out of scope for an endpoint flow test.

See [`api-endpoints-reference.md`](./api-endpoints-reference.md) for the complete endpoint
inventory with per-endpoint status.
