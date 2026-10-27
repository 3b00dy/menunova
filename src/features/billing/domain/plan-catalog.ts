import type { PlanId } from "@/features/billing/domain/plan.entity";

/**
 * Single source of truth for plan prices shown in the app (signup wizard and the
 * billing page). Monthly, in USD — the values the signup wizard has always shown.
 * Plan names/taglines/features live in the dictionaries (`onboarding.plan.items`).
 *
 * NOTE: the landing page currently advertises only "Growth" ($49/mo ≈ `pro`) and
 * its FAQ still mentions a free "Starter" plan — keep this table and the landing
 * copy in sync when pricing is final. No payment is taken in the app yet.
 */
export const PLAN_ORDER: readonly PlanId[] = ["free", "pro", "enterprise"];

export const PLAN_MONTHLY_PRICE_USD: Record<PlanId, number> = {
  free: 0,
  pro: 49,
  enterprise: 99,
};
