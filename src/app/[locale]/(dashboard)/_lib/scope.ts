import { can, getSession } from "@/features/auth";
import { listRestaurants, type Restaurant } from "@/features/restaurant";

/**
 * Resolve which restaurant a restaurant-scoped dashboard page acts on, for a
 * user holding `settings:manage`. An **owner** is locked to their own
 * restaurant; a **super admin** (who owns none) picks one via
 * `?restaurant=<slug>`, defaulting to the first. `allowed` is false when the
 * user lacks the capability (the page should redirect).
 */
export async function resolveSettingsScope(requested?: string): Promise<{
  allowed: boolean;
  isSuperAdmin: boolean;
  restaurants: Restaurant[];
  slug: string | null;
}> {
  const session = await getSession();
  if (!session || !can(session.user, "settings:manage")) {
    return { allowed: false, isSuperAdmin: false, restaurants: [], slug: null };
  }
  const isSuperAdmin = can(session.user, "restaurants:manage");
  if (!isSuperAdmin) {
    return { allowed: true, isSuperAdmin, restaurants: [], slug: session.user.restaurantId ?? null };
  }
  const restaurants = await listRestaurants(session.token);
  const slug = restaurants.find((r) => r.slug === requested)?.slug ?? restaurants[0]?.slug ?? null;
  return { allowed: true, isSuperAdmin, restaurants, slug };
}
