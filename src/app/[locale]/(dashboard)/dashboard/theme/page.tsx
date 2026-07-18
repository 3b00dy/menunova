import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { EmptyState } from "@/shared/ui";
import { can, getSession } from "@/features/auth";
import { getMenuView, type MenuView } from "@/features/menu";
import { ThemeBuilder } from "@/features/theme-builder";
import { getRestaurantTheme, listRestaurants } from "@/features/restaurant";
import { RestaurantScopePicker } from "@/app/[locale]/(dashboard)/_components/RestaurantScopePicker";

/** An empty preview when a restaurant has no menu yet (keeps the builder usable). */
const EMPTY_PREVIEW: MenuView = {
  restaurant: { name: "", tagline: "", hoursOpen: "", hoursClose: "" },
  categories: [],
  items: [],
};

/**
 * Tenant Theme Builder — "/{locale}/dashboard/theme".
 *
 * Requires `theme:manage`. An **owner** edits their own restaurant's design; a
 * **super admin** (who owns no single restaurant) picks any tenant via
 * `?restaurant=<slug>`. Loads that restaurant's saved theme + its real menu so
 * the live preview matches the public `/r/{slug}` page.
 */
export default async function ThemeBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const [session, sp, t] = await Promise.all([getSession(), searchParams, getDictionary(locale)]);

  if (!session || !can(session.user, "theme:manage")) {
    redirect(routes.dashboard(locale));
  }

  const isSuperAdmin = can(session.user, "restaurants:manage");
  const restaurants = isSuperAdmin ? await listRestaurants() : [];

  let slug: string | null;
  if (isSuperAdmin) {
    slug = restaurants.find((r) => r.slug === sp.restaurant)?.slug ?? restaurants[0]?.slug ?? null;
  } else {
    slug = session.user.restaurantId ?? "demo";
  }

  if (isSuperAdmin && !slug) {
    return (
      <EmptyState
        title={t.dashboard.menuAdmin.noRestaurants}
        description={t.dashboard.menuAdmin.noRestaurantsHint}
      />
    );
  }

  const activeSlug = slug as string;
  const [theme, menu] = await Promise.all([
    getRestaurantTheme(activeSlug),
    getMenuView(activeSlug, locale),
  ]);

  return (
    <div className="flex flex-col gap-5">
      {isSuperAdmin && (
        <RestaurantScopePicker
          restaurants={restaurants.map((r) => ({ slug: r.slug, name: r.name }))}
          selected={activeSlug}
          scope="theme"
          label={t.dashboard.menuAdmin.restaurant}
        />
      )}
      <ThemeBuilder
        key={activeSlug}
        slug={activeSlug}
        initialConfig={theme}
        menu={menu ?? EMPTY_PREVIEW}
      />
    </div>
  );
}
