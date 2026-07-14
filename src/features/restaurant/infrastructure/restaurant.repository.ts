import { env } from "@/shared/config/env";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";
import { HttpRestaurantRepository } from "@/features/restaurant/infrastructure/restaurant.http.repository";
import { InMemoryRestaurantRepository } from "@/features/restaurant/infrastructure/restaurant.mock.repository";

/**
 * The default restaurant repository, selected by `env.dataMode`:
 *  - `"mock"` (default) — in-memory store; works with no backend.
 *  - `"live"` — HTTP calls to the real API.
 * Application use-cases import this; they never pick a concrete class.
 */
export const restaurantRepository: RestaurantRepository =
  env.dataMode === "live"
    ? new HttpRestaurantRepository()
    : new InMemoryRestaurantRepository();
