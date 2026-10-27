import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPatch,
} from "@/features/restaurant/domain/restaurant.entity";

/** Port implemented by infrastructure (in-memory mock now, HTTP once wired). */
export interface RestaurantRepository {
  getBySlug(slug: string): Promise<Restaurant | null>;
  /** Requires auth on the live backend (401 without a token). */
  getById(id: string, token?: string): Promise<Restaurant | null>;
  /** All restaurants — super admin only on the live backend (401/403 otherwise). */
  list(token: string): Promise<Restaurant[]>;
  create(draft: RestaurantDraft, token: string): Promise<Restaurant>;
  update(id: string, patch: RestaurantPatch, token: string): Promise<Restaurant>;
  delete(id: string, token: string): Promise<void>;
}
