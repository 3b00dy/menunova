import type { Money } from "@/shared/utils/formatMoney";

/** Billing domain: subscription plans chosen during onboarding. */

export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: Money;
  /** Feature keys unlocked by this plan. */
  features: string[];
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export interface Subscription {
  planId: PlanId;
  status: SubscriptionStatus;
  restaurantId: string;
}
