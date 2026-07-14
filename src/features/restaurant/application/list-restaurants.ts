import type { Restaurant } from "@/features/restaurant/domain/restaurant.entity";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";
import { restaurantRepository } from "@/features/restaurant/infrastructure/restaurant.repository";

/**
 * List all restaurants (super-admin view). Repository is injected (default =
 * selector) so it's testable. Swallows backend errors and returns an empty list
 * so the page renders an empty state when the API is down.
 */
export async function listRestaurants(
  repo: RestaurantRepository = restaurantRepository,
): Promise<Restaurant[]> {
  try {
    return await repo.list();
  } catch {
    return [];
  }
}
