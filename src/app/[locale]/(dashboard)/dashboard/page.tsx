import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { getMenu, computeMenuStats } from "@/features/menu";
import {
  getRestaurantSettings,
  getRestaurantBySlug,
  getRestaurantTheme,
  listRestaurants,
  computePlatformStats,
  type Restaurant,
} from "@/features/restaurant";
import { DashboardOverview } from "@/app/[locale]/(dashboard)/dashboard/_components/DashboardOverview";
import { SuperAdminOverview } from "@/app/[locale]/(dashboard)/dashboard/_components/SuperAdminOverview";
import { getDashboardAccess } from "@/app/[locale]/(dashboard)/_lib/access";

/** Dashboard overview — platform insights for the super admin, or account
 * insights for a restaurant admin/staff. */
export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const access = await getDashboardAccess();

  // Staff hold only `menu:availability`: skip the account overview (plan,
  // stats) and land them on their one task — item availability (BR-ST-01).
  if (access.caps.menu && !access.caps.menuManage && !access.caps.restaurants) {
    redirect(routes.dashboardMenu(locale));
  }

  const t = await getDictionary(locale);

  // Super admin manages no single restaurant — show the platform overview.
  if (access.caps.restaurants && !access.restaurantId) {
    const restaurants = await listRestaurants();
    const platform = computePlatformStats(restaurants);
    const menus = await Promise.all(restaurants.map((r) => getMenu(r.slug)));
    const menuItems = menus.reduce((n, m) => n + (m?.items.length ?? 0), 0);
    const menuCategories = menus.reduce((n, m) => n + (m?.categories.length ?? 0), 0);
    return (
      <SuperAdminOverview
        stats={platform}
        menuItems={menuItems}
        menuCategories={menuCategories}
        dict={t.dashboard}
        locale={locale}
      />
    );
  }

  const slug = access.restaurantId ?? "demo";

  const [menu, settings, restaurant, theme] = await Promise.all([
    getMenu(slug),
    getRestaurantSettings(slug),
    getRestaurantBySlug(slug),
    getRestaurantTheme(slug),
  ]);

  const stats = computeMenuStats(menu, settings.supportedLanguages);

  // Fallback if the restaurant record is unavailable (backend down / empty).
  const account: Restaurant =
    restaurant ?? { id: slug, slug, name: slug, plan: "free", status: "active" };

  return (
    <DashboardOverview
      restaurant={account}
      supportedLanguages={settings.supportedLanguages}
      defaultLanguage={settings.defaultLanguage}
      stats={stats}
      logoUrl={theme.brandAssets.logoUrl || restaurant?.logoUrl}
      dict={t.dashboard}
      locale={locale}
      caps={access.caps}
    />
  );
}
