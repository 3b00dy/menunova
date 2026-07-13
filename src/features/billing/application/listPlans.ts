import type { Plan } from "@/features/billing/domain/plan.entity";

/**
 * SKELETON use-case: list selectable plans for onboarding.
 * TODO: back with `BillingHttpRepository.listPlans` against the API.
 */
export async function listPlans(): Promise<Plan[]> {
  return [
    { id: "free", name: "Free", price: { amountMinor: 0, currency: "IQD" }, features: ["1 menu"] },
    { id: "pro", name: "Pro", price: { amountMinor: 9900, currency: "IQD" }, features: ["Unlimited menus", "Custom branding"] },
  ];
}
