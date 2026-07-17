import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getMenu, computeMenuStats } from "@/features/menu";
import { getRestaurantSettings, getRestaurantBySlug, type Restaurant } from "@/features/restaurant";
import { DashboardOverview } from "@/app/[locale]/(dashboard)/dashboard/_components/DashboardOverview";
import { getDashboardAccess } from "@/app/[locale]/(dashboard)/_lib/access";

const RESTAURANT_SLUG = "demo"; // TODO: derive from the authenticated user's restaurant

/** Dashboard overview — insights about the restaurant admin's account. */
export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);

  const [menu, settings, restaurant, access] = await Promise.all([
    getMenu(RESTAURANT_SLUG),
    getRestaurantSettings(RESTAURANT_SLUG),
    getRestaurantBySlug(RESTAURANT_SLUG),
    getDashboardAccess(),
  ]);

  const stats = computeMenuStats(menu, settings.supportedLanguages);

  // Fallback if the restaurant record is unavailable (backend down / empty).
  const account: Restaurant =
    restaurant ?? { id: RESTAURANT_SLUG, slug: RESTAURANT_SLUG, name: RESTAURANT_SLUG, plan: "free", status: "active" };

  return (
    <DashboardOverview
      restaurant={account}
      supportedLanguages={settings.supportedLanguages}
      defaultLanguage={settings.defaultLanguage}
      stats={stats}
      dict={t.dashboard}
      locale={locale}
      caps={access.caps}
    />
  );
}
