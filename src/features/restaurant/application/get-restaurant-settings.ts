import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import type { RestaurantSettingsRepository } from "@/features/restaurant/domain/restaurant-settings.ports";
import { restaurantSettingsRepository } from "@/features/restaurant/infrastructure/restaurant-settings.repository";

/**
 * Resolve a restaurant's settings (languages). Resilient: on any failure it
 * returns a safe default (English + Arabic, English default) so callers — the
 * dashboard shell, menu editor, sidebar switcher — always have a value.
 */
export async function getRestaurantSettings(
  slug: string,
  repo: RestaurantSettingsRepository = restaurantSettingsRepository,
): Promise<RestaurantSettings> {
  try {
    return await repo.get(slug);
  } catch {
    return { slug, defaultLanguage: "en", supportedLanguages: ["en", "ar"] };
  }
}
