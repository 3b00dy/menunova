import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { ThemeConfig } from "@/shared/theme/tenant-config";
import type { RestaurantThemeRepository } from "@/features/restaurant/domain/restaurant-theme.ports";

/**
 * HTTP implementation of {@link RestaurantThemeRepository} against the live
 * backend theme endpoint (`GET|PUT /restaurants/{slug}/settings/theme`) —
 * verified live. It is a passthrough JSON store: `PUT` persists the `ThemeConfig`
 * as-is and `GET` returns it as-is (204/empty → `null` → callers fall back to the
 * default theme). See docs/api-endpoints-reference.md.
 */
export const restaurantThemeHttpRepository: RestaurantThemeRepository = {
  async get(slug: string) {
    return httpClient.get<ThemeConfig | null>(API_ENDPOINTS.restaurants.themeSettings(slug), {
      next: { revalidate: 60, tags: [`theme:${slug}`] },
    });
  },
  async save(slug, theme, token) {
    await httpClient.put<ThemeConfig>(API_ENDPOINTS.restaurants.themeSettings(slug), theme, { token });
  },
};
