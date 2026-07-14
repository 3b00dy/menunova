import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { PageHeader } from "@/shared/ui";
import { getRestaurantSettings, LanguageSettingsForm } from "@/features/restaurant";

const RESTAURANT_SLUG = "demo"; // TODO: derive from the authenticated user's restaurant

/** Restaurant settings — currently the menu language configuration. */
export default async function RestaurantSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);
  const settings = await getRestaurantSettings(RESTAURANT_SLUG);

  return (
    <section className="flex flex-col gap-2">
      <PageHeader
        title={t.dashboard.languageSettings.title}
        description={t.dashboard.languageSettings.subtitle}
      />
      <LanguageSettingsForm settings={settings} slug={RESTAURANT_SLUG} />
    </section>
  );
}
