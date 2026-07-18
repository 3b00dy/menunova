/** Restaurant (tenant) domain entity. */

export type RestaurantPlan = "free" | "pro" | "enterprise";
export type RestaurantStatus = "active" | "trial" | "suspended";

export const RESTAURANT_PLANS: readonly RestaurantPlan[] = ["free", "pro", "enterprise"];
export const RESTAURANT_STATUSES: readonly RestaurantStatus[] = ["active", "trial", "suspended"];

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  /** Subscription plan (platform-admin view). */
  plan: RestaurantPlan;
  status: RestaurantStatus;
  ownerEmail?: string;
  logoUrl?: string;
  /** Brand color used to theme the public menu. */
  brandColor?: string;
  /** ISO date the restaurant was created (fixed string for stable SSR). */
  createdAt?: string;
}

/** Fields to create a restaurant (id assigned server-side). */
export interface RestaurantDraft {
  name: string;
  slug: string;
  ownerEmail?: string;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  /** Optional branding captured at onboarding (both are real API fields). */
  logoUrl?: string;
  brandColor?: string;
}

/** Partial update for an existing restaurant. */
export type RestaurantPatch = Partial<RestaurantDraft>;

/** Badge tone for a status (matches the shared `Badge` tones). */
export function statusTone(status: RestaurantStatus): "success" | "warning" | "danger" {
  switch (status) {
    case "active":
      return "success";
    case "trial":
      return "warning";
    case "suspended":
      return "danger";
  }
}
