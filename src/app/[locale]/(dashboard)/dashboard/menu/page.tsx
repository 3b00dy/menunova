import type { Locale } from "@/shared/i18n/config";
import { getMenu, MenuManager } from "@/features/menu";

/**
 * Dashboard menu management. Thin composition root: resolve the menu for the
 * user's restaurant, then render the client CRUD manager. (Data source is the
 * in-memory mock until `MENUNOVA_DATA_MODE=live` wires the real API.)
 */
const RESTAURANT_SLUG = "demo"; // TODO: derive from the authenticated user's restaurant

export default async function DashboardMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  void ((await params) as { locale: Locale });
  const menu = await getMenu(RESTAURANT_SLUG);

  return <MenuManager menu={menu} slug={RESTAURANT_SLUG} />;
}
