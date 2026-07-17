/**
 * Capability-based authorization model.
 *
 * Roles alone are too coarse for this app: a `staff` member may toggle item
 * availability but must NOT edit the menu, while an `owner` can do both — that
 * is not a clean rank ("staff ⊂ owner" holds today, but new roles need not fit a
 * line). So authorization is expressed as **permissions** (capabilities) mapped
 * per role. Adding a role = add a row to {@link ROLE_PERMISSIONS}; adding a gate
 * = check a {@link Permission}. UI and Server Actions both consult {@link can}.
 */

import type { AuthUser, Role } from "@/features/auth/domain/session.entity";

/** A single capability that can be granted to a role. */
export type Permission =
  /** Create / edit / delete categories and menu items. */
  | "menu:manage"
  /** Toggle an item's availability (in / out of stock) — nothing else. */
  | "menu:availability"
  /** Customize the public menu theme. */
  | "theme:manage"
  /** Change restaurant settings (languages, profile, billing). */
  | "settings:manage"
  /** Invite / update / remove staff members of the restaurant. */
  | "staff:manage"
  /** Platform-wide: see and manage every restaurant (tenant). */
  | "restaurants:manage";

/**
 * The permissions granted to each role. This is the single source of truth for
 * "who can do what" — both the dashboard nav and the Server Actions derive their
 * gating from it. A restaurant **admin** is the `owner` role; a restaurant
 * **staff** member is `staff`.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: [
    "menu:manage",
    "menu:availability",
    "theme:manage",
    "settings:manage",
    "staff:manage",
    "restaurants:manage",
  ],
  owner: ["menu:manage", "menu:availability", "theme:manage", "settings:manage", "staff:manage"],
  staff: ["menu:availability"],
  customer: [],
};

/** Whether a user's role grants a permission. */
export function can(user: AuthUser, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

/** All permissions a role holds (e.g. to serialize a capability set to the UI). */
export function permissionsFor(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}
