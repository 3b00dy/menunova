import type { Plan } from "@/features/billing/domain/plan.entity";

export interface BillingRepository {
  listPlans(): Promise<Plan[]>;
  /** Start a checkout session and return the provider redirect URL. */
  createCheckout(planId: Plan["id"], token: string): Promise<{ checkoutUrl: string }>;
}
