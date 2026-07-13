/**
 * View model for the customer-facing public menu (the shape the `RestaurantMenu`
 * renderer consumes). Richer than the editing entities in `menu.entity.ts`:
 * every field beyond name+price is optional and omitted cleanly when absent.
 */

export interface MenuAddon {
  name: string;
  price: string;
}

export interface MenuViewItem {
  id: string;
  categoryId: string;
  name: string; // required
  price: string; // required
  description?: string;
  discountedPrice?: string;
  imageUrl?: string;
  available?: boolean;
  calories?: number;
  prepMinutes?: number;
  addons?: MenuAddon[];
  /** Featured by the restaurant — surfaced in the Promotions strip. */
  promoted?: boolean;
}

export interface MenuViewCategory {
  id: string;
  name: string;
  imageUrl: string;
}

export type SocialType = "instagram" | "tiktok" | "facebook" | "other";

export interface MenuSocial {
  type: SocialType;
  label: string;
  href: string;
}

export interface MenuRestaurant {
  name: string;
  tagline: string;
  hoursOpen: string;
  hoursClose: string;
  phone?: string;
  address?: string;
  socials?: MenuSocial[];
}

export interface MenuView {
  restaurant: MenuRestaurant;
  categories: MenuViewCategory[];
  items: MenuViewItem[];
}

/** UI strings the renderer needs — sourced from whichever dictionary the caller uses. */
export interface MenuViewLabels {
  categories: string;
  openNow: string;
  soldOut: string;
  calories: string;
  prepTime: string;
  addOns: string;
  addToCart: string;
  promotions: string;
  back: string;
  close: string;
}

export function itemsInCategory(menu: MenuView, categoryId: string): MenuViewItem[] {
  return menu.items.filter((item) => item.categoryId === categoryId);
}

export function promotedItems(menu: MenuView): MenuViewItem[] {
  return menu.items.filter((item) => item.promoted);
}
