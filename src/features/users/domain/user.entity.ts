import type { Role } from "@/features/auth/domain/session.entity";

/**
 * Users domain: a single account anywhere in the platform.
 *
 * Unlike `staff` (a restaurant-scoped team member, only `owner`/`staff`), a
 * `User` here is **system-wide** — it can hold any auth {@link Role}, including
 * `super_admin` (platform staff) and `customer` (menu viewer). Only super admins
 * see and manage these, via the Users page.
 */

/** Any platform role — reuses the auth `Role` union so the two never drift. */
export type UserRole = Role;
export type UserStatus = "active" | "invited" | "suspended";

export const USER_ROLES: readonly UserRole[] = ["super_admin", "owner", "staff", "customer"];
export const USER_STATUSES: readonly UserStatus[] = ["active", "invited", "suspended"];

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Restaurant the user belongs to (its slug); absent for super_admin/customer. */
  restaurantId?: string;
  status: UserStatus;
  /** ISO date the account was created (fixed string for stable SSR). */
  createdAt?: string;
  /** ISO timestamp the user was last active, if known. */
  lastActiveAt?: string;
}

/** Fields to CREATE a user (id/createdAt assigned server-side). */
export interface UserDraft {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  restaurantId?: string;
  status?: UserStatus;
}

/** Partial update for an existing user (email is immutable — it's the login). */
export type UserPatch = Partial<Pick<User, "name" | "role" | "restaurantId" | "status">>;

/** Roles that are scoped to a single restaurant (must carry a `restaurantId`). */
export function roleNeedsRestaurant(role: UserRole): boolean {
  return role === "owner" || role === "staff";
}

/** Badge tone for a role (matches the shared `Badge` tones). */
export function roleTone(role: UserRole): "accent" | "info" | "neutral" {
  if (role === "super_admin") return "accent";
  if (role === "owner") return "info";
  return "neutral";
}

/** Badge tone for a status (matches the shared `Badge` tones). */
export function userStatusTone(status: UserStatus): "success" | "warning" | "danger" {
  switch (status) {
    case "active":
      return "success";
    case "invited":
      return "warning";
    case "suspended":
      return "danger";
  }
}
