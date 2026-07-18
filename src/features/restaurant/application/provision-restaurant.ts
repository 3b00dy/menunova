import type { Restaurant, RestaurantDraft } from "@/features/restaurant/domain/restaurant.entity";
import { restaurantRepository } from "@/features/restaurant/infrastructure/restaurant.repository";

/**
 * System-level restaurant creation used by self-serve signup.
 *
 * Unlike the super-admin `createRestaurant` action, this carries NO role gate:
 * it runs DURING registration, before the new owner has a session. It is a
 * private provisioning primitive — call it only from the registration flow
 * (`registerOwner`), never from user-facing dashboard actions.
 */
export async function provisionRestaurant(draft: RestaurantDraft): Promise<Restaurant> {
  // Token is unused by the mock; the live backend provisions inside /auth/register.
  return restaurantRepository.create(draft, "system");
}
