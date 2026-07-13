import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";

/** SKELETON: restaurant settings (wire `@/features/restaurant`). */
export default async function RestaurantSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);
  return <h1 className="text-2xl font-semibold">{t.dashboard.restaurant}</h1>;
}
