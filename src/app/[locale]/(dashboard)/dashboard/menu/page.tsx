import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { EmptyState } from "@/shared/ui";
import { getMenu, MenuManager } from "@/features/menu";
import { getRestaurantSettings, listRestaurants } from "@/features/restaurant";
import { can, getSession } from "@/features/auth";
import { RestaurantSelect } from "@/app/[locale]/(dashboard)/dashboard/menu/_components/RestaurantSelect";

/**
 * Dashboard menu management. Thin composition root.
 *
 * Which restaurant's menu loads depends on the role: an **owner/staff** are
 * scoped to their own restaurant; a **super admin** (who belongs to no single
 * restaurant) picks one via the `?restaurant=<slug>` param, defaulting to the
 * first. Content is authored in every supported language. Data source is the
 * in-memory mock until `MENUNOVA_DATA_MODE=live` wires the real API.
 */
const FALLBACK_SLUG = "demo";

export default async function DashboardMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const [session, sp] = await Promise.all([getSession(), searchParams]);

  const isSuperAdmin = !!session && can(session.user, "restaurants:manage");
  const canManage = !!session && can(session.user, "menu:manage");

  // Super admin: choose which tenant to manage (default: first restaurant).
  // Owner/staff: locked to their own restaurant.
  const restaurants = isSuperAdmin ? await listRestaurants() : [];
  let slug: string | null;
  if (isSuperAdmin) {
    slug =
      restaurants.find((r) => r.slug === sp.restaurant)?.slug ??
      restaurants[0]?.slug ??
      null;
  } else {
    slug = session?.user.restaurantId ?? FALLBACK_SLUG;
  }

  // Super admin with no restaurants yet — nothing to manage.
  if (isSuperAdmin && !slug) {
    const t = await getDictionary(locale);
    return (
      <EmptyState
        title={t.dashboard.menuAdmin.noRestaurants}
        description={t.dashboard.menuAdmin.noRestaurantsHint}
      />
    );
  }

  const activeSlug = slug as string;
  const [menu, settings] = await Promise.all([
    getMenu(activeSlug),
    getRestaurantSettings(activeSlug),
  ]);

  return (
    <div className="flex flex-col gap-5">
      {isSuperAdmin && (
        <RestaurantSelect
          restaurants={restaurants.map((r) => ({ slug: r.slug, name: r.name }))}
          selected={activeSlug}
        />
      )}
      <MenuManager
        key={activeSlug}
        menu={menu}
        slug={activeSlug}
        languages={settings.supportedLanguages}
        defaultLanguage={settings.defaultLanguage}
        canManage={canManage}
      />
    </div>
  );
}
