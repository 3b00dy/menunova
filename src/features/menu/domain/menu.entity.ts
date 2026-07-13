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
