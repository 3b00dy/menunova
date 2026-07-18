import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { RestaurantSettings } from "@/features/restaurant/domain/restaurant-settings.entity";
import { normalizeLanguages } from "@/features/restaurant/domain/restaurant-settings.entity";
import type { RestaurantSettingsRepository } from "@/features/restaurant/domain/restaurant-settings.ports";

/**
 * HTTP implementation of {@link RestaurantSettingsRepository} against
 * `GET|PUT /restaurants/{slug}/settings/languages`. Wired in at the composition
 * edge (see `restaurant-settings.repository.ts`) when `dataMode=live`.
 */

interface SettingsDto {
  slug?: string;
  default_language: string;
  supported_languages: string[];
}

function toSettings(slug: string, dto: SettingsDto): RestaurantSettings {
  return {
    slug: dto.slug ?? slug,
    defaultLanguage: dto.default_language,
    supportedLanguages: dto.supported_languages,
  };
}

export const restaurantSettingsHttpRepository: RestaurantSettingsRepository = {
  async get(slug) {
    const dto = await httpClient.get<SettingsDto>(API_ENDPOINTS.restaurants.languageSettings(slug));
    return toSettings(slug, dto);
  },

  async updateLanguages(slug, input, token) {
    const normalized = normalizeLanguages(input);
    const dto = await httpClient.put<SettingsDto>(
      API_ENDPOINTS.restaurants.languageSettings(slug),
      {
        default_language: normalized.defaultLanguage,
        supported_languages: normalized.supportedLanguages,
      },
      { token },
    );
    return toSettings(slug, dto);
  },
};
