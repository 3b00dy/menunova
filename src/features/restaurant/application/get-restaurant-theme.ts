import { DEFAULT_THEME_CONFIG, type ThemeConfig } from "@/shared/theme/tenant-config";
import { restaurantThemeRepository } from "@/features/restaurant/infrastructure/restaurant-theme.repository";

/**
 * Query use-case: the public-menu theme (design) for a restaurant. Falls back to
 * {@link DEFAULT_THEME_CONFIG} when the restaurant has no saved theme or the
 * backend is unreachable, so the public page always renders.
 */
export async function getRestaurantTheme(slug: string): Promise<ThemeConfig> {
  try {
    return (await restaurantThemeRepository.get(slug)) ?? DEFAULT_THEME_CONFIG;
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}
