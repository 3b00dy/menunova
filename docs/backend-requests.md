# Backend Requests — what to ask the backend team

**Date:** 2026-07-24. Only items that **require backend work** (everything frontend-side is already
done). Ordered by priority. Base: `https://menunovaapi.onrender.com`.

---

## 1. 🔴 Public self-serve registration — `POST /auth/register`
**Why:** today signup creates **no real backend user** (the frontend mints a temporary token), so a
self-registered owner **can never log in again**. There is no public registration endpoint. This
blocks the whole "register → build my menu" flow.

**Ask:** add a **public** (no auth) endpoint that creates the owner account **and** their restaurant
(with the chosen plan) in one call, enforcing email uniqueness, and returns the same shape as
`/auth/login`.

```
POST /auth/register            // public
{
  "name": "string",
  "email": "string",
  "password": "string",
  "restaurant_name": "string",
  "slug": "string",
  "plan": "free|pro|enterprise"
}
→ 201 { "token": "...", "user": { id, email, name, role:"owner", restaurant_id } }
→ 409 if email or slug already exists
```
(If you prefer, keep it two-step: a public `POST /auth/register` that returns a real token, then the
existing `POST /restaurants` — but the token must belong to a **persisted** user who can log in later.)

---

## 2. 🔴 Enforce authorization / tenant isolation
**Why:** an `owner` token can currently read and modify **every** restaurant on the platform — I
verified live that an owner can `GET /restaurants` (all tenants), `POST /restaurants`, and
`PATCH/DELETE /restaurants/by-id/{other tenant}`. Only `/users` is correctly locked. Right now the
only thing stopping cross-tenant tampering is the frontend UI.

**Ask:** enforce roles/ownership on the API itself:
- `super_admin` only: `GET /restaurants` (list all), `POST /restaurants`, `DELETE /restaurants/by-id/{id}`, all `/users*`.
- `owner`/`staff`: may act **only on their own** restaurant — on `GET/PATCH /restaurants/by-id/{id}`
  and every `/restaurants/{slug}/...` write, verify the caller's JWT `restaurant_id` matches (else `403`).

---

## 3. 🟠 Fix restaurant delete cascade — `DELETE /restaurants/by-id/{id}`
**Why:** it returns **500** when the restaurant still has any categories/items; it only succeeds
(204) after the menu tree is emptied — even though the schema declares `on delete cascade`.

**Ask:** make restaurant deletion cascade (delete its categories/menu-items in the same transaction)
so a non-empty restaurant deletes cleanly.

---

## 4. 🟢 Optional — add `restaurant_slug` to `/auth/me` (and `/auth/login` user)
**Why:** `restaurant_id` is a uuid, but all menu/theme/language/staff endpoints are slug-keyed. The
frontend already bridges this with an extra `GET /restaurants/by-id/{id}` per session. Returning the
slug directly would remove that round-trip.

**Ask:** include `"restaurant_slug"` alongside `restaurant_id` in the `/auth/me` and login user DTO.

---

## 5. 🟢 Optional — billing / plan enforcement
**Why:** the plan is chosen at signup and stored on the restaurant (`POST /restaurants.plan`), but
there is **no billing/subscription/payment endpoint** — checkout is mock, and plans don't gate
anything. Only needed if plans are meant to be charged or enforced.

**Ask (if in scope):** subscription/checkout endpoints (create subscription, current plan, change
plan) and any feature-gating rules per plan.

---

## 6. 🟢 Optional — data-integrity guards (nice to have)
- `DELETE /users/{id}`: reject removing the **last `super_admin`** → `422`.
- `PATCH /staff/{id}` / `DELETE /staff/{id}`: reject demoting/removing the **last `owner`** of a restaurant → `422`.

---

## Not needed
- `PATCH /menu-items/{id}/availability` — the frontend uses the general `PATCH /menu-items/{id}`; no
  separate availability endpoint required.

---

### For reference — already live & working (no action needed)
`/auth/login`, `/auth/me`, `/auth/logout`; restaurants CRUD; menu/category/menu-item CRUD;
`/restaurants/{slug}/settings/languages`; `/restaurants/{slug}/settings/theme`; staff CRUD
(`/restaurants/{slug}/staff`, `/staff/{id}`); users CRUD (`/users`). All verified 2026-07-24.
