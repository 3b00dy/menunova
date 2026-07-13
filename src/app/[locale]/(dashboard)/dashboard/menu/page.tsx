import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getMenu, MenuBoard } from "@/features/menu";

/**
 * Dashboard menu management. Thin composition root: resolve params, call the
 * feature use-case, render the feature UI. (Editing UI is a follow-up.)
 */
export default async function DashboardMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);
  // In the real app the slug comes from the authenticated user's restaurant.
  const menu = await getMenu("demo");

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t.dashboard.menu}</h1>
      <MenuBoard menu={menu} locale={locale} emptyLabel={t.menu.empty} />
    </section>
  );
}
