import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPatch,
} from "@/features/restaurant/domain/restaurant.entity";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";

/**
 * In-memory {@link RestaurantRepository} for demo & local development.
 *
 * State lives in a module-level array so CRUD changes persist across requests
 * within a running server process (they reset on restart — fine for a demo).
 * Swap for the HTTP repository by setting `MENUNOVA_DATA_MODE=live`.
 */

const RESTAURANTS: Restaurant[] = [
  { id: "r_demo", slug: "demo", name: "Pizza Palace", ownerEmail: "owner@pizzapalace.test", plan: "pro", status: "active", createdAt: "2025-11-02" },
  { id: "r_sushi", slug: "sakura-sushi", name: "Sakura Sushi", ownerEmail: "hello@sakura.test", plan: "enterprise", status: "active", createdAt: "2025-09-18" },
  { id: "r_burger", slug: "smash-house", name: "Smash House", ownerEmail: "team@smashhouse.test", plan: "free", status: "trial", createdAt: "2026-06-27" },
  { id: "r_cafe", slug: "amwaj-cafe", name: "Amwaj Café", ownerEmail: "manager@amwaj.test", plan: "pro", status: "suspended", createdAt: "2025-12-11" },
  { id: "r_grill", slug: "najd-grill", name: "Najd Grill", ownerEmail: "info@najdgrill.test", plan: "pro", status: "active", createdAt: "2026-02-04" },
];

// Monotonic id generator — avoids Math.random/Date so ids are stable per run.
let seq = 0;
const nextId = () => `r_${(seq += 1).toString(36)}`;

const clone = (r: Restaurant): Restaurant => ({ ...r });

export class InMemoryRestaurantRepository implements RestaurantRepository {
  async getBySlug(slug: string): Promise<Restaurant | null> {
    const found = RESTAURANTS.find((r) => r.slug === slug);
    return found ? clone(found) : null;
  }

  async getById(id: string): Promise<Restaurant | null> {
    const found = RESTAURANTS.find((r) => r.id === id);
    return found ? clone(found) : null;
  }

  async list(): Promise<Restaurant[]> {
    return RESTAURANTS.map(clone);
  }

  async create(draft: RestaurantDraft): Promise<Restaurant> {
    const slug = draft.slug.trim();
    if (RESTAURANTS.some((r) => r.slug === slug)) {
      throw new Error(`A restaurant with slug "${slug}" already exists.`);
    }
    const restaurant: Restaurant = {
      id: nextId(),
      slug,
      name: draft.name.trim(),
      ownerEmail: draft.ownerEmail?.trim() || undefined,
      plan: draft.plan,
      status: draft.status,
      logoUrl: draft.logoUrl?.trim() || undefined,
      brandColor: draft.brandColor?.trim() || undefined,
    };
    RESTAURANTS.push(restaurant);
    return clone(restaurant);
  }

  async update(id: string, patch: RestaurantPatch): Promise<Restaurant> {
    const restaurant = RESTAURANTS.find((r) => r.id === id);
    if (!restaurant) throw new Error(`Restaurant not found: ${id}`);
    if (patch.slug && patch.slug !== restaurant.slug) {
      const slug = patch.slug.trim();
      if (RESTAURANTS.some((r) => r.id !== id && r.slug === slug)) {
        throw new Error(`A restaurant with slug "${slug}" already exists.`);
      }
    }
    Object.assign(restaurant, {
      ...patch,
      name: patch.name?.trim() ?? restaurant.name,
      slug: patch.slug?.trim() ?? restaurant.slug,
      ownerEmail:
        patch.ownerEmail !== undefined
          ? patch.ownerEmail.trim() || undefined
          : restaurant.ownerEmail,
    });
    return clone(restaurant);
  }

  async delete(id: string): Promise<void> {
    const idx = RESTAURANTS.findIndex((r) => r.id === id);
    if (idx !== -1) RESTAURANTS.splice(idx, 1);
  }
}
