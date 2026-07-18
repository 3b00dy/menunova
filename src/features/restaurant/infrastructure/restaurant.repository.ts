import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";
import { HttpRestaurantRepository } from "@/features/restaurant/infrastructure/restaurant.http.repository";
import { InMemoryRestaurantRepository } from "@/features/restaurant/infrastructure/restaurant.mock.repository";

/**
 * The default restaurant repository. Routes per request (see
 * `requestRoutedRepository`): demo sessions and mock mode use the in-memory
 * store, live sessions hit the real API. Application use-cases import this; they
 * never pick a concrete class.
 */
export const restaurantRepository: RestaurantRepository = requestRoutedRepository(
  new InMemoryRestaurantRepository(),
  new HttpRestaurantRepository(),
);
