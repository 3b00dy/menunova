import { notFound } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { resolveMenuLanguage } from "@/shared/i18n/languages";
import { getRestaurantSettings, getRestaurantTheme } from "@/features/restaurant";
import { getMenuView, PublicMenu, type MenuViewLabels } from "@/features/menu";

/**
 * Public per-tenant menu — "/{locale}/r/{restaurantSlug}".
 *
 * Composition root: resolve the restaurant's OWN menu + its saved theme, then
 * render `PublicMenu` — the same `RestaurantMenu` the Theme Builder previews,
 * plus a customer layout switcher. `params` is async (Next.js 16). `/r/demo`
 * keeps showing the rich sample; every other slug renders that tenant's data.
 *
 * Content language is separate from the UI locale: `?lang=` picks one of the
 * restaurant's enabled languages (e.g. Sorani `ckb`, shown under the Arabic UI);
 * without it the route locale is used if enabled, else the restaurant default.
 */
export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; restaurantSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, restaurantSlug } = (await params) as {
    locale: Locale;
    restaurantSlug: string;
  };
  const [sp, t, settings, theme] = await Promise.all([
    searchParams,
    getDictionary(locale),
    getRestaurantSettings(restaurantSlug),
    getRestaurantTheme(restaurantSlug),
  ]);
  const language = resolveMenuLanguage({
    requested: sp.lang,
    routeLocale: locale,
    supported: settings.supportedLanguages,
    defaultLanguage: settings.defaultLanguage,
  });
  const menu = await getMenuView(restaurantSlug, language, settings.defaultLanguage);
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
      languages={settings.supportedLanguages}
      language={language}
      className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] shadow-[var(--shadow-pronounced)]"
    />
  );
}
