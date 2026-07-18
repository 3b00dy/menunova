import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { RestaurantThemeRepository } from "@/features/restaurant/domain/restaurant-theme.ports";
import { restaurantThemeMockRepository } from "@/features/restaurant/infrastructure/restaurant-theme.mock";
import { restaurantThemeHttpRepository } from "@/features/restaurant/infrastructure/restaurant-theme.http";

/**
 * Composition edge: route the theme repository per request (see
 * `requestRoutedRepository`). Demo sessions and mock mode use the seeded
 * in-memory themes; live sessions talk to the backend theme endpoint (still
 * missing — see docs/missed-endpoints.md, so live falls back to the default).
 */
export const restaurantThemeRepository: RestaurantThemeRepository = requestRoutedRepository(
  restaurantThemeMockRepository,
  restaurantThemeHttpRepository,
);
