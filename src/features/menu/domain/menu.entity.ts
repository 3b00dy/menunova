import type { Money } from "@/shared/utils/formatMoney";

/**
 * Menu domain entities. Pure types + invariants — no React, no fetch, no Next.
 * The rest of the feature depends inward on these.
 */

export type MenuItemId = string;
export type CategoryId = string;

export interface MenuItem {
  id: MenuItemId;
  categoryId: CategoryId;
  name: string;
  description: string;
  price: Money;
  /** Whether the item is currently orderable. */
  available: boolean;
  imageUrl?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Sort order within the menu. */
  position: number;
}

/** A full menu for one restaurant, grouped for display. */
export interface Menu {
  restaurantSlug: string;
  categories: Category[];
  items: MenuItem[];
}

/** Fields required to create a menu item (id/category assignment happen server-side). */
export interface MenuItemDraft {
  categoryId: CategoryId;
  name: string;
  description: string;
  price: Money;
  available: boolean;
  imageUrl?: string;
}

/** Partial update for an existing item — any subset of its editable fields. */
export type MenuItemPatch = Partial<MenuItemDraft>;

/** Fields to create a category. `position` defaults to "append last" when omitted. */
export interface CategoryDraft {
  name: string;
  position?: number;
}

/** Partial update for an existing category. */
export type CategoryPatch = Partial<Pick<Category, "name" | "position">>;
