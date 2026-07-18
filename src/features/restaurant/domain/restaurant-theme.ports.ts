import type { ThemeConfig } from "@/shared/theme/tenant-config";

/**
 * Port for a restaurant's saved public-menu theme (design). Implemented by the
 * in-memory mock (demo/dev) and the HTTP repository (live). `get` returns `null`
 * when the restaurant has no saved theme yet (the caller falls back to the
 * default). `save` takes a bearer `token`; authorization is enforced in the
 * application layer via `requirePermission("theme:manage")`.
 */
export interface RestaurantThemeRepository {
  get(slug: string): Promise<ThemeConfig | null>;
  save(slug: string, theme: ThemeConfig, token: string): Promise<void>;
}
