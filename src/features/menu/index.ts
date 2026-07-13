/**
 * Public API of the `menu` feature. Code outside this feature must import ONLY
 * from here (`@/features/menu`) — never from `./domain`, `./application`,
 * `./infrastructure`, or `./ui` directly. This keeps internals swappable.
 */

// Domain types (safe to expose)
export type {
  Menu,
  MenuItem,
  MenuItemId,
  MenuItemDraft,
  MenuItemPatch,
  Category,
  CategoryId,
  CategoryDraft,
  CategoryPatch,
} from "@/features/menu/domain/menu.entity";

// Public menu view model (rich, customer-facing)
export type {
  MenuView,
  MenuViewItem,
  MenuViewCategory,
  MenuRestaurant,
  MenuSocial,
  MenuViewLabels,
} from "@/features/menu/domain/menu-view";

// Use-cases
export { getMenu } from "@/features/menu/application/get-menu";
export { getMenuView } from "@/features/menu/application/get-menu-view";
export {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/features/menu/application/item-actions";
export {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/features/menu/application/category-actions";

// UI
export { MenuBoard } from "@/features/menu/ui/components/MenuBoard";
export { MenuManager } from "@/features/menu/ui/MenuManager";
export { MenuItemCard } from "@/features/menu/ui/components/MenuItemCard";
export { useMenuFilters } from "@/features/menu/ui/hooks/useMenuFilters";
export { RestaurantMenu } from "@/features/menu/ui/RestaurantMenu";
export { PublicMenu } from "@/features/menu/ui/PublicMenu";
export type { MenuChromeLabels } from "@/features/menu/ui/PublicMenu";

// Intentionally NOT exported: repositories, mappers, ports, DTOs — private.
