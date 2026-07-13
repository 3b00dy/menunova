import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { DEFAULT_THEME_CONFIG } from "@/shared/theme/tenant-config";
import { getMenuView, PublicMenu, type MenuViewLabels } from "@/features/menu";

/**
 * Public per-tenant menu — "/{locale}/r/{restaurantSlug}".
 *
 * Composition root: resolve the menu (mock today) + the tenant theme, then
 * render `PublicMenu` — the same `RestaurantMenu` the Theme Builder previews,
 * plus a customer layout switcher. `params` is async (Next.js 16).
 *
 * TODO: load the real `ThemeConfig` from the restaurant's theme settings once
 * the backend ships; `DEFAULT_THEME_CONFIG` is the placeholder.
 */
export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantSlug: string }>;
}) {
  const { locale, restaurantSlug } = (await params) as {
    locale: Locale;
    restaurantSlug: string;
  };
  const t = await getDictionary(locale);
  const menu = await getMenuView(restaurantSlug);

  const labels: MenuViewLabels = {
    categories: t.menu.categories,
    openNow: t.menu.openNow,
    soldOut: t.menu.soldOut,
    calories: t.menu.calories,
    prepTime: t.menu.prepTime,
    addOns: t.menu.addOns,
    addToCart: t.menu.addToCart,
    promotions: t.menu.promotions,
    back: t.menu.back,
    close: t.menu.close,
  };

  const chrome = {
    layout: t.menu.layout,
    categories: t.menu.layoutCategories,
    nav: t.menu.layoutNav,
    sidebar: t.menu.layoutSidebar,
    language: t.menu.language,
  };

  return (
    <PublicMenu
      theme={DEFAULT_THEME_CONFIG}
      data={menu}
      labels={labels}
      chrome={chrome}
      className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] shadow-[var(--shadow-pronounced)]"
    />
  );
}
