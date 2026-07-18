import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";

/** Port for reading/writing a restaurant's settings (mock or HTTP by dataMode). */
export interface RestaurantSettingsRepository {
  /** Read is unauthenticated (the public menu needs the language set). */
  get(slug: string): Promise<RestaurantSettings>;
  /** Write requires the caller's bearer token (mock ignores it). */
  updateLanguages(
    slug: string,
    input: { defaultLanguage: string; supportedLanguages: string[] },
    token?: string,
  ): Promise<RestaurantSettings>;
}
