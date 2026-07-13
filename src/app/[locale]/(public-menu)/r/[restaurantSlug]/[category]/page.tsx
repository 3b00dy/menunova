import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getMenu, MenuBoard } from "@/features/menu";

/**
 * Deep link to a single category of a restaurant's public menu.
 * "/{locale}/r/{restaurantSlug}/{category}".
 */
export default async function PublicMenuCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantSlug: string; category: string }>;
}) {
  const { locale, restaurantSlug, category } = (await params) as { locale: Locale; restaurantSlug: string; category: string };
  const t = await getDictionary(locale);
  const menu = await getMenu(restaurantSlug);

  // Narrow to the requested category (by id) if the menu loaded.
  const filtered = menu
    ? { ...menu, items: menu.items.filter((i) => i.categoryId === category) }
    : null;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">
        {t.menu.category}: {category}
      </h1>
      <MenuBoard menu={filtered} locale={locale} emptyLabel={t.menu.empty} />
    </section>
  );
}
