/**
 * Platform insights for the super admin — pure derivations over the full
 * restaurant list (no React/fetch). Mirrors the menu feature's `menu.stats.ts`.
 */

import {
  RESTAURANT_PLANS,
  RESTAURANT_STATUSES,
  type Restaurant,
  type RestaurantPlan,
  type RestaurantStatus,
} from "@/features/restaurant/domain/restaurant.entity";

export interface PlanCount {
  plan: RestaurantPlan;
  count: number;
}
export interface StatusCount {
  status: RestaurantStatus;
  count: number;
}

export interface PlatformStats {
  total: number;
  activeCount: number;
  trialCount: number;
  suspendedCount: number;
  /** Count per plan, in the canonical plan order (includes zero-count plans). */
  byPlan: PlanCount[];
  /** Count per status, in the canonical status order. */
  byStatus: StatusCount[];
  /** Most-recently created restaurants (up to 5), newest first. */
  recent: Restaurant[];
}

export function computePlatformStats(restaurants: Restaurant[]): PlatformStats {
  const countStatus = (s: RestaurantStatus) => restaurants.filter((r) => r.status === s).length;
  const recent = [...restaurants]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5);

  return {
    total: restaurants.length,
    activeCount: countStatus("active"),
    trialCount: countStatus("trial"),
    suspendedCount: countStatus("suspended"),
    byPlan: RESTAURANT_PLANS.map((plan) => ({
      plan,
      count: restaurants.filter((r) => r.plan === plan).length,
    })),
    byStatus: RESTAURANT_STATUSES.map((status) => ({ status, count: countStatus(status) })),
    recent,
  };
}
