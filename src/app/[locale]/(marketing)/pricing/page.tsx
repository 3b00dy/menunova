import type { Locale } from "@/shared/i18n/config";
import { formatMoney } from "@/shared/utils/formatMoney";
import { Card } from "@/shared/ui";
import { listPlans } from "@/features/billing";

/** Public pricing page. Reads plans via the billing feature barrel. */
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const plans = await listPlans();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Pricing</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-5 flex flex-col gap-3">
            <h2 className="text-xl font-medium">{plan.name}</h2>
            <p className="font-mono">{formatMoney(plan.price, locale)}</p>
            <ul className="text-sm text-black/60 dark:text-white/60 list-disc ps-5">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
}
