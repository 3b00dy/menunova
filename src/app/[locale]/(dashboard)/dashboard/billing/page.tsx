import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";

/**
 * SKELETON: billing overview — READ-ONLY here (view current plan/invoices).
 * Purchasing a plan happens only in the onboarding flow, not here.
 */
export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const t = await getDictionary(locale);
  return <h1 className="text-2xl font-semibold">{t.dashboard.billing}</h1>;
}
