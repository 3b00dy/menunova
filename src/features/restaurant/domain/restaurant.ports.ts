import type { Restaurant } from "@/features/restaurant/domain/restaurant.entity";

export interface RestaurantRepository {
  getBySlug(slug: string): Promise<Restaurant | null>;
}
