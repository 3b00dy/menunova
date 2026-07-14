import type { Locale } from "@/shared/i18n/config";
import { getMenu, MenuManager } from "@/features/menu";
import { getRestaurantSettings } from "@/features/restaurant";

/**
 * Dashboard menu management. Thin composition root: resolve the menu + the
 * restaurant's language settings, then render the client CRUD manager (content
 * is authored in every supported language). Data source is the in-memory mock
 * until `MENUNOVA_DATA_MODE=live` wires the real API.
 */
const RESTAURANT_SLUG = "demo"; // TODO: derive from the authenticated user's restaurant

export default async function DashboardMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  void ((await params) as { locale: Locale });
  const [menu, settings] = await Promise.all([
    getMenu(RESTAURANT_SLUG),
    getRestaurantSettings(RESTAURANT_SLUG),
  ]);

  return (
    <MenuManager
      menu={menu}
      slug={RESTAURANT_SLUG}
      languages={settings.supportedLanguages}
      defaultLanguage={settings.defaultLanguage}
    />
  );
}
