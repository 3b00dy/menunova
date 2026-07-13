import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";

/** SKELETON: staff management — owner-only (gate with `requireRole('owner')`). */
export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);
  return <h1 className="text-2xl font-semibold">{t.dashboard.staff}</h1>;
}
