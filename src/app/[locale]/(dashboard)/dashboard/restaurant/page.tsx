import { redirect } from "next/navigation";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { routes } from "@/shared/config/routes";
import { PageHeader } from "@/shared/ui";
import { can, getSession } from "@/features/auth";
import { getRestaurantSettings, LanguageSettingsForm } from "@/features/restaurant";

/** Restaurant settings — currently the menu language configuration. Requires the
 * `settings:manage` capability; scoped to the user's own restaurant. */
export default async function RestaurantSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const session = await getSession();
  if (!session || !can(session.user, "settings:manage")) {
    redirect(routes.dashboard(locale));
  }
  // Super admin manages no single restaurant — send them to the platform view.
  if (!session.user.restaurantId) {
    redirect(routes.dashboardRestaurants(locale));
  }

  const slug = session.user.restaurantId;
  const t = await getDictionary(locale);
  const settings = await getRestaurantSettings(slug);

  return (
    <section className="flex flex-col gap-2">
      <PageHeader
        title={t.dashboard.languageSettings.title}
        description={t.dashboard.languageSettings.subtitle}
      />
      <LanguageSettingsForm settings={settings} slug={slug} />
    </section>
  );
}
