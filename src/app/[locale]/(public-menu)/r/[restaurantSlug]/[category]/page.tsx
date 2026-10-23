import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { languageDir } from "@/shared/i18n/languages";
import { resolveRequestMenuLanguage } from "@/shared/i18n/request-menu-language";
import { getMenu, MenuBoard } from "@/features/menu";
import { getRestaurantSettings } from "@/features/restaurant";

/**
 * Deep link to a single category of a restaurant's public menu.
 * "/{locale}/r/{restaurantSlug}/{category}". Honors `?lang=` for the content
 * language, like the full menu page.
 */
export default async function PublicMenuCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; restaurantSlug: string; category: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { locale, restaurantSlug, category } = (await params) as { locale: Locale; restaurantSlug: string; category: string };
  const [sp, t, settings, menu] = await Promise.all([
    searchParams,
    getDictionary(locale),
    getRestaurantSettings(restaurantSlug),
    getMenu(restaurantSlug),
  ]);
  const { language } = await resolveRequestMenuLanguage({
    requested: sp.lang,
    routeLocale: locale,
    supported: settings.supportedLanguages,
    defaultLanguage: settings.defaultLanguage,
  });

  // Narrow to the requested category (by id) if the menu loaded.
  const filtered = menu
    ? { ...menu, items: menu.items.filter((i) => i.categoryId === category) }
    : null;

  return (
    <section className="flex flex-col gap-6" dir={languageDir(language)} lang={language}>
      <h1 className="text-2xl font-semibold">
        {t.menu.category}: {category}
      </h1>
      <MenuBoard
        menu={filtered}
        locale={language}
        fallback={settings.defaultLanguage}
        emptyLabel={t.menu.empty}
      />
    </section>
  );
}
