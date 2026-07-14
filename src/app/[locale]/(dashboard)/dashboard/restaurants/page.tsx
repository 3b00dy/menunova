import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { PageHeader } from "@/shared/ui";
import { getSession, hasRole } from "@/features/auth";
import { listRestaurants, RestaurantsManager } from "@/features/restaurant";

/** Super-admin: list & manage every restaurant. Gated to `super_admin`. */
export default async function RestaurantsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };

  const session = await getSession();
  if (!session || !hasRole(session.user, "super_admin")) {
    redirect(routes.dashboard(locale));
  }

  const t = await getDictionary(locale);
  const restaurants = await listRestaurants();

  return (
    <section className="flex flex-col gap-2">
      <PageHeader
        title={t.dashboard.restaurantsAdmin.title}
        description={t.dashboard.restaurantsAdmin.subtitle}
      />
      <RestaurantsManager restaurants={restaurants} locale={locale} />
    </section>
  );
}
