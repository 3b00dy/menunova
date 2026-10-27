import type { Restaurant } from "@/features/restaurant/domain/restaurant.entity";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";
import { restaurantRepository } from "@/features/restaurant/infrastructure/restaurant.repository";

/**
 * List all restaurants (super-admin view). Repository is injected (default =
 * selector) so it's testable. The live `GET /restaurants` is super-admin-only and
 * requires the caller's bearer `token` (401 without one) — callers (server pages)
 * pass `session.token`. Deliberately does NOT read the session itself: this
 * module is reachable from client bundles via the restaurant barrel, and the
 * session reader imports `next/headers`. Swallows errors → empty list.
 */
export async function listRestaurants(
  token: string,
  repo: RestaurantRepository = restaurantRepository,
): Promise<Restaurant[]> {
  try {
    return await repo.list(token);
  } catch {
    return [];
  }
}
