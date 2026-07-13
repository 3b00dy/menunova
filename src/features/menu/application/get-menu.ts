import type { Menu } from "@/features/menu/domain/menu.entity";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";
import { menuRepository } from "@/features/menu/infrastructure/menu.http.repository";

/**
 * Query use-case: fetch a restaurant's menu for public display.
 *
 * Resilient by design — if the backend is unreachable (e.g. not running in
 * local dev), it resolves to `null` so the UI can render an empty state instead
 * of crashing. The repository is injected (defaults to the HTTP one) so tests
 * can pass a fake.
 */
export async function getMenu(
  slug: string,
  repo: MenuRepository = menuRepository,
): Promise<Menu | null> {
  try {
    return await repo.getByRestaurantSlug(slug);
  } catch {
    return null;
  }
}
