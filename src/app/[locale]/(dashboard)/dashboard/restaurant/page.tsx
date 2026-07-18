import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { EmptyState, PageHeader } from "@/shared/ui";
import { can, getSession } from "@/features/auth";
import { getRestaurantSettings, listRestaurants, LanguageSettingsForm } from "@/features/restaurant";
import { RestaurantScopePicker } from "@/app/[locale]/(dashboard)/_components/RestaurantScopePicker";

/**
 * Restaurant settings — the menu language configuration. Requires
 * `settings:manage`. An **owner** manages their own restaurant; a **super
 * admin** (who owns no single restaurant) picks any tenant via
 * `?restaurant=<slug>` and controls its settings.
 */
export default async function RestaurantSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const [session, sp, t] = await Promise.all([getSession(), searchParams, getDictionary(locale)]);
  if (!session || !can(session.user, "settings:manage")) {
    redirect(routes.dashboard(locale));
  }

  const isSuperAdmin = can(session.user, "restaurants:manage");
  const restaurants = isSuperAdmin ? await listRestaurants() : [];

  let slug: string | null;
  if (isSuperAdmin) {
    slug = restaurants.find((r) => r.slug === sp.restaurant)?.slug ?? restaurants[0]?.slug ?? null;
  } else {
    slug = session.user.restaurantId ?? null;
  }

  if (!slug) {
    return (
      <EmptyState
        title={t.dashboard.menuAdmin.noRestaurants}
        description={t.dashboard.menuAdmin.noRestaurantsHint}
      />
    );
  }

  const settings = await getRestaurantSettings(slug);

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title={t.dashboard.languageSettings.title}
        description={t.dashboard.languageSettings.subtitle}
      />
      {isSuperAdmin && (
        <RestaurantScopePicker
          restaurants={restaurants.map((r) => ({ slug: r.slug, name: r.name }))}
          selected={slug}
          scope="settings"
          label={t.dashboard.menuAdmin.restaurant}
        />
      )}
      <LanguageSettingsForm key={slug} settings={settings} slug={slug} />
    </section>
  );
}
