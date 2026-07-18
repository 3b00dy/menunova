import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { RestaurantSettingsRepository } from "@/features/restaurant/domain/restaurant-settings.ports";
import { restaurantSettingsMockRepository } from "@/features/restaurant/infrastructure/restaurant-settings.mock";
import { restaurantSettingsHttpRepository } from "@/features/restaurant/infrastructure/restaurant-settings.http.repository";

/**
 * Composition edge: route the settings repository per request (see
 * `requestRoutedRepository`). Demo sessions and mock mode use the in-memory
 * store; live sessions talk to the backend's language-settings endpoints.
 */
export const restaurantSettingsRepository: RestaurantSettingsRepository =
  requestRoutedRepository(restaurantSettingsMockRepository, restaurantSettingsHttpRepository);
