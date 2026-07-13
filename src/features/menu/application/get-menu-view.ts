import type { MenuView } from "@/features/menu/domain/menu-view";
import { MOCK_MENU_VIEW } from "@/features/menu/infrastructure/menu-view.mock";

/**
 * Query use-case: fetch the full public menu view for a restaurant.
 *
 * Mock today (backend not ready). Swap the body for an `httpClient` call keyed
 * by `slug` later; the return type and every consumer stay unchanged.
 */
export async function getMenuView(slug: string): Promise<MenuView> {
  void slug;
  return MOCK_MENU_VIEW;
}
