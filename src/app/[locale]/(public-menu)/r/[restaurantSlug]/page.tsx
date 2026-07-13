import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getMenu, MenuBoard } from "@/features/menu";
import { getRestaurantBySlug } from "@/features/restaurant";

/**
 * Public per-tenant menu — "/{locale}/r/{restaurantSlug}".
 *
 * Composition root: resolve tenant + menu via feature barrels, render feature
 * UI. `params` is async (Next.js 16). Renders an empty state (no crash) when
 * the backend API is unreachable.
 */
export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ locale: string; restaurantSlug: string }>;
}) {
  const { locale, restaurantSlug } = (await params) as { locale: Locale; restaurantSlug: string };
  const t = await getDictionary(locale);

  const [restaurant, menu] = await Promise.all([
    getRestaurantBySlug(restaurantSlug),
    getMenu(restaurantSlug),
  ]);

  return (
    <section className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold">{restaurant?.name ?? restaurantSlug}</h1>
      </header>
      <MenuBoard menu={menu} locale={locale} emptyLabel={t.menu.empty} />
    </section>
  );
}
