import type {
  Category,
  CategoryDraft,
  CategoryId,
  CategoryPatch,
  Menu,
  MenuItem,
  MenuItemDraft,
  MenuItemId,
  MenuItemPatch,
} from "@/features/menu/domain/menu.entity";

/**
 * Ports (interfaces) the menu domain depends on. The `infrastructure` layer
 * implements these (HTTP for the real backend, in-memory for demo/dev);
 * `application` use-cases depend on the interface, never on a concrete class.
 * This is what lets the data source be swapped freely.
 */
export interface MenuRepository {
  getByRestaurantSlug(slug: string): Promise<Menu | null>;

  // --- Item CRUD ---
  createItem(slug: string, draft: MenuItemDraft, token: string): Promise<MenuItem>;
  updateItem(id: MenuItemId, patch: MenuItemPatch, token: string): Promise<MenuItem>;
  deleteItem(id: MenuItemId, token: string): Promise<void>;

  // --- Category CRUD ---
  createCategory(slug: string, draft: CategoryDraft, token: string): Promise<Category>;
  updateCategory(id: CategoryId, patch: CategoryPatch, token: string): Promise<Category>;
  /** Deletes the category and cascades to the items that belong to it. */
  deleteCategory(id: CategoryId, token: string): Promise<void>;
}
