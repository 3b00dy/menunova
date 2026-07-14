import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPatch,
} from "@/features/restaurant/domain/restaurant.entity";

/** Port implemented by infrastructure (in-memory mock now, HTTP once wired). */
export interface RestaurantRepository {
  getBySlug(slug: string): Promise<Restaurant | null>;
  getById(id: string): Promise<Restaurant | null>;
  list(): Promise<Restaurant[]>;
  create(draft: RestaurantDraft, token: string): Promise<Restaurant>;
  update(id: string, patch: RestaurantPatch, token: string): Promise<Restaurant>;
  delete(id: string, token: string): Promise<void>;
}
