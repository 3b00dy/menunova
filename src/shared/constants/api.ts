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
  },
  menuItems: {
    /** PATCH · DELETE — by id */
    byId: (id: string) => `/menu-items/${encodeURIComponent(id)}`,
  },
  categories: {
    /** PATCH · DELETE — by id */
    byId: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
} as const;
