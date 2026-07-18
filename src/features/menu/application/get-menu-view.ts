import type { MenuView } from "@/features/menu/domain/menu-view";
import { getRestaurantBySlug } from "@/features/restaurant";
import { MOCK_MENU_VIEW } from "@/features/menu/infrastructure/menu-view.mock";
import { buildMenuView } from "@/features/menu/infrastructure/menu-view.mapper";
import { menuRepository } from "@/features/menu/infrastructure/menu.repository";

/**
 * Query use-case: the full public menu view for a restaurant, localized.
 *
 *  - `"demo"` / `"preview"` → the rich sample menu (`MOCK_MENU_VIEW`), which the
 *    `/r/demo` page and the Theme Builder preview keep showing.
 *  - any other slug → that restaurant's OWN menu, built from its real items +
 *    name (per tenant). Returns `null` when the restaurant doesn't exist so the
 *    page can render a 404.
 *
 * Resilient: a menu-fetch failure falls back to an empty menu rather than
 * crashing (the restaurant still renders with its header).
 */
export async function getMenuView(
  slug: string,
  locale: string = "en",
): Promise<MenuView | null> {
  if (slug === "demo" || slug === "preview") return MOCK_MENU_VIEW;

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return null;

  const menu = await menuRepository.getByRestaurantSlug(slug).catch(() => null);
  return buildMenuView({ menu, restaurantName: restaurant.name, locale });
}
