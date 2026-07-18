import { env } from "@/shared/config/env";

/**
 * Backend API endpoints — the single source of truth for every path the
 * frontend calls. Mirrors the deployed ASP.NET API's Swagger
 * (https://menunovaapi.onrender.com/swagger). Paths are **relative**; the
 * shared `httpClient` prepends {@link API_BASE_URL} and injects auth headers, so
 * never hardcode the host here.
 */

/** Base URL of the backend API (single source = env; default = deployed API). */
export const API_BASE_URL = env.apiUrl;

/**
 * All backend endpoints, grouped by resource. Functions take path params and
 * URL-encode them; constants are plain strings. HTTP verbs noted in comments.
 */
export const API_ENDPOINTS = {
  auth: {
    /** POST — email/password → { token, user }. NOT YET IMPLEMENTED (see docs). */
    login: "/auth/login",
    /** POST — create user (+ provision restaurant) → { token, user }. NOT YET IMPLEMENTED. */
    register: "/auth/register",
    /** GET — verify bearer token → current { token, user }. NOT YET IMPLEMENTED. */
    me: "/auth/me",
    /** POST — invalidate the current token. NOT YET IMPLEMENTED. */
    logout: "/auth/logout",
  },
  restaurants: {
    /** GET (list all) · POST (create) */
    list: "/restaurants",
    /** GET — by public slug */
    bySlug: (slug: string) => `/restaurants/${encodeURIComponent(slug)}`,
    /** GET · PATCH · DELETE — by id */
    byId: (id: string) => `/restaurants/by-id/${encodeURIComponent(id)}`,
    /** GET — a restaurant's full menu */
    menu: (slug: string) => `/restaurants/${encodeURIComponent(slug)}/menu`,
    /** POST — create a menu item under a restaurant */
    menuItems: (slug: string) => `/restaurants/${encodeURIComponent(slug)}/menu-items`,
    /** POST — create a category under a restaurant */
    categories: (slug: string) => `/restaurants/${encodeURIComponent(slug)}/categories`,
    /** GET · PUT — a restaurant's language settings */
    languageSettings: (slug: string) =>
      `/restaurants/${encodeURIComponent(slug)}/settings/languages`,
    /**
     * GET (list) · POST (invite) — a restaurant's staff members.
     * NOT YET IMPLEMENTED by the backend — see docs/backend-endpoints-missing.md.
     */
    staff: (slug: string) => `/restaurants/${encodeURIComponent(slug)}/staff`,
  },
  menuItems: {
    /** PATCH · DELETE — by id */
    byId: (id: string) => `/menu-items/${encodeURIComponent(id)}`,
    /**
     * PATCH — set only availability. Optional narrower endpoint for the staff
     * role; NOT YET IMPLEMENTED — see docs/backend-endpoints-missing.md.
     */
    availability: (id: string) => `/menu-items/${encodeURIComponent(id)}/availability`,
  },
  categories: {
    /** PATCH · DELETE — by id */
    byId: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  staff: {
    /**
     * PATCH (update role) · DELETE (remove) — a staff member by id.
     * NOT YET IMPLEMENTED by the backend — see docs/backend-endpoints-missing.md.
     */
    byId: (id: string) => `/staff/${encodeURIComponent(id)}`,
  },
} as const;
