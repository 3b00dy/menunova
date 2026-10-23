import {
  DEFAULT_THEME_CONFIG,
  normalizeThemeConfig,
  type ThemeConfig,
} from "@/shared/theme/tenant-config";
import { restaurantThemeRepository } from "@/features/restaurant/infrastructure/restaurant-theme.repository";

/**
 * Query use-case: the public-menu theme (design) for a restaurant. Falls back to
 * {@link DEFAULT_THEME_CONFIG} when the restaurant has no saved theme or the
 * backend is unreachable, and normalizes partial/malformed stored themes (e.g.
 * `{}`) section by section, so the public page always renders.
 */
export async function getRestaurantTheme(slug: string): Promise<ThemeConfig> {
  try {
    return normalizeThemeConfig(await restaurantThemeRepository.get(slug));
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}
