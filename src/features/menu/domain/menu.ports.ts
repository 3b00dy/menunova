import type { Menu, MenuItem, MenuItemId } from "@/features/menu/domain/menu.entity";

/**
 * Ports (interfaces) the menu domain depends on. The `infrastructure` layer
 * implements these; `application` use-cases depend on the interface, never on a
 * concrete HTTP class. This is what lets the data source be swapped freely.
 */
export interface MenuRepository {
  getByRestaurantSlug(slug: string): Promise<Menu | null>;
  updateItem(
    id: MenuItemId,
    patch: Partial<Pick<MenuItem, "name" | "description" | "price" | "available">>,
    token: string,
  ): Promise<MenuItem>;
}
