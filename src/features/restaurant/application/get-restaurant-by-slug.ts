import type { Restaurant } from "@/features/restaurant/domain/restaurant.entity";

/**
 * SKELETON use-case: resolve a tenant by its slug.
 * TODO: implement `RestaurantHttpRepository` in `infrastructure/` and inject it.
 */
export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  // Placeholder until the infrastructure repository is wired.
  return { id: "demo", slug, name: slug };
}
