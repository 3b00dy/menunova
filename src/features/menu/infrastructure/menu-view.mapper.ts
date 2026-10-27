import { localize } from "@/shared/i18n/localized";
import { formatMoney } from "@/shared/utils/formatMoney";
import type { Menu } from "@/features/menu/domain/menu.entity";
import type { MenuSocial, MenuView, MenuViewItem } from "@/features/menu/domain/menu-view";
import { socialUrl, type RestaurantInfo } from "@/shared/theme/restaurant-info";

/**
 * Map a restaurant's editable {@link Menu} into the customer-facing
 * {@link MenuView} the public renderer consumes, resolving localized text and
 * formatting prices for `locale` (a content language, e.g. `en`, `ar`, `ckb`).
 * Missing translations fall back to `fallback` (the restaurant's default
 * language), then to any filled value. Rich fields the editor doesn't capture yet
 * (calories, add-ons, promotions, contact/hours) are omitted cleanly — the
 * renderer already handles their absence.
 */

export function buildMenuView(args: {
  menu: Menu | null;
  restaurantName: string;
  locale: string;
  /** Restaurant's default language — used when `locale` has no translation. */
  fallback?: string;
  /** Public restaurant info (address, hours, phone, socials), if any. */
  info?: RestaurantInfo;
}): MenuView {
  const { menu, restaurantName, locale, fallback, info } = args;

  const items: MenuViewItem[] = (menu?.items ?? []).map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    name: localize(item.name, locale, fallback),
    price: formatMoney(item.price, locale),
    description: localize(item.description, locale, fallback) || undefined,
    imageUrl: item.imageUrl,
    available: item.available,
  }));

  const categories = (menu?.categories ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      id: category.id,
      name: localize(category.name, locale, fallback),
      // Borrow the first item photo; none → the renderer shows a branded tile.
      imageUrl: items.find((i) => i.categoryId === category.id && i.imageUrl)?.imageUrl,
    }));

  const socials: MenuSocial[] = info
    ? (
        [
          ["instagram", "instagram", "Instagram"],
          ["facebook", "facebook", "Facebook"],
          ["tiktok", "tiktok", "TikTok"],
          ["website", "other", "Website"],
        ] as const
      )
        .map(([key, type, label]) => ({ type, label, href: socialUrl(key, info.socials[key]) }))
        .filter((s) => s.href)
    : [];

  return {
    restaurant: {
      name: restaurantName,
      tagline: info ? localize(info.tagline, locale, fallback) : "",
      hoursOpen: "",
      hoursClose: "",
      phone: info?.phone || undefined,
      address: (info && localize(info.address, locale, fallback)) || undefined,
      mapUrl: info?.mapUrl || undefined,
      socials: socials.length ? socials : undefined,
      weeklyHours: info?.hours.length === 7 ? info.hours : undefined,
    },
    categories,
    items,
  };
}
