import { env } from "@/shared/config/env";
import type { RestaurantSettingsRepository } from "@/features/restaurant/domain/restaurant-settings.ports";
import { restaurantSettingsMockRepository } from "@/features/restaurant/infrastructure/restaurant-settings.mock";
import { restaurantSettingsHttpRepository } from "@/features/restaurant/infrastructure/restaurant-settings.http.repository";

/**
 * Composition edge: pick the settings repository by data mode. `mock` (default)
 * uses the in-memory store; `live` talks to the backend's language-settings
 * endpoints.
 */
export const restaurantSettingsRepository: RestaurantSettingsRepository =
  env.dataMode === "live" ? restaurantSettingsHttpRepository : restaurantSettingsMockRepository;
