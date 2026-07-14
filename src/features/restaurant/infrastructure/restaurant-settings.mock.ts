import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { normalizeLanguages } from "@/features/restaurant/domain/restaurant-settings.entity";
import type { RestaurantSettingsRepository } from "@/features/restaurant/domain/restaurant-settings.ports";

/**
 * In-memory restaurant settings for demo & local dev. Persists within a running
 * server process (resets on restart). Swap for an HTTP repository once the
 * backend exposes settings endpoints.
 */

const STORE = new Map<string, RestaurantSettings>();

function defaults(slug: string): RestaurantSettings {
  return { slug, defaultLanguage: "en", supportedLanguages: ["en", "ar"] };
}

export const restaurantSettingsMockRepository: RestaurantSettingsRepository = {
  async get(slug: string) {
    let settings = STORE.get(slug);
    if (!settings) {
      settings = defaults(slug);
      STORE.set(slug, settings);
    }
    return { ...settings, supportedLanguages: [...settings.supportedLanguages] };
  },

  async updateLanguages(slug, input) {
    const normalized = normalizeLanguages(input);
    const settings: RestaurantSettings = { slug, ...normalized };
    STORE.set(slug, settings);
    return { ...settings, supportedLanguages: [...settings.supportedLanguages] };
  },
};
