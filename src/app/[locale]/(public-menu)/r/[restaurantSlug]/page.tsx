import { notFound } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getRestaurantTheme } from "@/features/restaurant";
import { getMenuView, PublicMenu, type MenuViewLabels } from "@/features/menu";

/**
 * Public per-tenant menu — "/{locale}/r/{restaurantSlug}".
 *
 * Composition root: resolve the restaurant's OWN menu + its saved theme, then
 * render `PublicMenu` — the same `RestaurantMenu` the Theme Builder previews,
 * plus a customer layout switcher. `params` is async (Next.js 16). `/r/demo`
 * keeps showing the rich sample; every other slug renders that tenant's data.
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
  const [menu, theme] = await Promise.all([
    getMenuView(restaurantSlug, locale),
    getRestaurantTheme(restaurantSlug),
  ]);
  if (!menu) notFound();

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
      theme={theme}
      data={menu}
      labels={labels}
      chrome={chrome}
      className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] shadow-[var(--shadow-pronounced)]"
    />
  );
}
