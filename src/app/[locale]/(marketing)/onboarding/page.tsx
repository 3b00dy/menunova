import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { formatMoney } from "@/shared/utils/formatMoney";
import { routes } from "@/shared/config/routes";
import { Card, Button } from "@/shared/ui";
import { listPlans } from "@/features/billing";

/** Onboarding step 1: choose a plan. Payment happens only from here onward. */
export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const plans = await listPlans();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Choose your plan</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-5 flex flex-col gap-3">
            <h2 className="text-xl font-medium">{plan.name}</h2>
            <p className="font-mono">{formatMoney(plan.price, locale)}</p>
            <Link href={routes.checkout(locale)}>
              <Button variant={plan.id === "pro" ? "primary" : "secondary"}>
                Select {plan.name}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
