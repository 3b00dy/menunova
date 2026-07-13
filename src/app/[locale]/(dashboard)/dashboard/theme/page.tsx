import { getMenuView } from "@/features/menu";
import { ThemeBuilder } from "@/features/theme-builder";

/**
 * Tenant Theme Builder — "/{locale}/dashboard/theme".
 * Fetches the sample menu (mock) on the server and hands it to the client
 * builder, whose live preview renders the exact same `RestaurantMenu` as the
 * real public page.
 */
export default async function ThemeBuilderPage() {
  const menu = await getMenuView("preview");
  return <ThemeBuilder menu={menu} />;
}
