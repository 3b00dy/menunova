import type { Locale } from "@/shared/i18n/config";
import { localize } from "@/shared/i18n/localized";
import { formatMoney } from "@/shared/utils/formatMoney";
import type { Menu } from "@/features/menu/domain/menu.entity";
import type { MenuView, MenuViewItem } from "@/features/menu/domain/menu-view";

/**
 * Map a restaurant's editable {@link Menu} into the customer-facing
 * {@link MenuView} the public renderer consumes, resolving localized text and
 * formatting prices for `locale`. Rich fields the editor doesn't capture yet
 * (calories, add-ons, promotions, contact/hours) are omitted cleanly — the
 * renderer already handles their absence.
 */

/** Neutral food image for categories that have no item image to borrow. */
const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop";

export function buildMenuView(args: {
  menu: Menu | null;
  restaurantName: string;
  locale: string;
}): MenuView {
  const { menu, restaurantName, locale } = args;
  const loc = locale as Locale;

  const items: MenuViewItem[] = (menu?.items ?? []).map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    name: localize(item.name, locale, "en"),
    price: formatMoney(item.price, loc),
    description: localize(item.description, locale, "en") || undefined,
    imageUrl: item.imageUrl,
    available: item.available,
  }));

  const categories = (menu?.categories ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      id: category.id,
      name: localize(category.name, locale, "en"),
      imageUrl:
        items.find((i) => i.categoryId === category.id && i.imageUrl)?.imageUrl ??
        FALLBACK_CATEGORY_IMAGE,
    }));

  return {
    restaurant: { name: restaurantName, tagline: "", hoursOpen: "", hoursClose: "" },
    categories,
    items,
  };
}
