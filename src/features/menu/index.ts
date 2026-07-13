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
  Category,
  CategoryId,
} from "@/features/menu/domain/menu.entity";

// Use-cases
export { getMenu } from "@/features/menu/application/get-menu";
export { updateMenuItem } from "@/features/menu/application/update-item";

// UI
export { MenuBoard } from "@/features/menu/ui/components/MenuBoard";
export { MenuItemCard } from "@/features/menu/ui/components/MenuItemCard";
export { useMenuFilters } from "@/features/menu/ui/hooks/useMenuFilters";

// Intentionally NOT exported: repositories, mappers, ports, DTOs — private.
