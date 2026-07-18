import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { ThemeConfig } from "@/shared/theme/tenant-config";
import type { RestaurantThemeRepository } from "@/features/restaurant/domain/restaurant-theme.ports";

/**
 * HTTP implementation of {@link RestaurantThemeRepository}.
 *
 * NOTE: the theme settings endpoint (`GET|PUT /restaurants/{slug}/settings/theme`)
 * is NOT YET IMPLEMENTED by the backend — this documents the expected contract
 * so flipping to live works the moment it ships. Until then the mock serves the
 * demo. See docs/missed-endpoints.md. The theme JSON is stored/returned as-is.
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
