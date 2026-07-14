import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";

/** Port for reading/writing a restaurant's settings (mock now, HTTP later). */
export interface RestaurantSettingsRepository {
  get(slug: string): Promise<RestaurantSettings>;
  updateLanguages(
    slug: string,
    input: { defaultLanguage: string; supportedLanguages: string[] },
  ): Promise<RestaurantSettings>;
}
