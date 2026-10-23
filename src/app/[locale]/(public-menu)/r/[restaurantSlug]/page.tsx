import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales } from "@/shared/i18n/config";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { resolveRequestMenuLanguage } from "@/shared/i18n/request-menu-language";
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
 * without it the device's remembered choice, then the route locale, then the
 * restaurant default. First-time visitors get a language splash.
 */
/**
 * Indexable title/description per restaurant (BRD NFR-09), Open Graph with the
 * restaurant logo for link previews, and `hreflang` alternates per UI locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; restaurantSlug: string }>;
}): Promise<Metadata> {
  const { locale, restaurantSlug } = (await params) as {
    locale: Locale;
    restaurantSlug: string;
  };
  const [t, menu, theme] = await Promise.all([
    getDictionary(locale),
    getMenuView(restaurantSlug, locale),
    getRestaurantTheme(restaurantSlug),
  ]);
  if (!menu) return {};

  const name = menu.restaurant.name;
  const title = t.menu.metaTitle.replace("{name}", name);
  const description = t.menu.metaDescription.replace("{name}", name);
  const logo = theme.brandAssets.logoUrl;
  return {
    title,
    description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/r/${restaurantSlug}`])),
    },
    openGraph: { title, description, type: "website", ...(logo ? { images: [logo] } : {}) },
  };
}

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
  const { language, askLanguage } = await resolveRequestMenuLanguage({
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
    chooseLanguage: t.menu.chooseLanguage,
  };

  return (
    <PublicMenu
      theme={theme}
      data={menu}
      labels={labels}
      chrome={chrome}
      languages={settings.supportedLanguages}
      language={language}
      askLanguage={askLanguage}
      className="overflow-hidden rounded-2xl border border-[rgb(var(--color-border))] shadow-[var(--shadow-pronounced)]"
    />
  );
}
