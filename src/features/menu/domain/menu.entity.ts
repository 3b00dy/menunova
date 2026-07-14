import type { Money } from "@/shared/utils/formatMoney";
import type { LocalizedText } from "@/shared/i18n/localized";

/**
 * Menu domain entities. Pure types + invariants — no React, no fetch, no Next.
 * The rest of the feature depends inward on these.
 *
 * Tenant-authored text (`name`, `description`) is {@link LocalizedText}: a map of
 * locale → string, so a restaurant enters content in each language it supports.
 */

export type MenuItemId = string;
export type CategoryId = string;

export interface MenuItem {
  id: MenuItemId;
  categoryId: CategoryId;
  name: LocalizedText;
  description: LocalizedText;
  price: Money;
  /** Whether the item is currently orderable. */
  available: boolean;
  imageUrl?: string;
}

export interface Category {
  id: CategoryId;
  name: LocalizedText;
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
  name: LocalizedText;
  description: LocalizedText;
  price: Money;
  available: boolean;
  imageUrl?: string;
}

/** Partial update for an existing item — any subset of its editable fields. */
export type MenuItemPatch = Partial<MenuItemDraft>;

/** Fields to create a category. `position` defaults to "append last" when omitted. */
export interface CategoryDraft {
  name: LocalizedText;
  position?: number;
}

/** Partial update for an existing category. */
export type CategoryPatch = Partial<Pick<Category, "name" | "position">>;
