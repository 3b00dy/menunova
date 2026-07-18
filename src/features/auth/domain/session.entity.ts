/** Auth domain: roles and the authenticated user/session shape. */

export type Role = "super_admin" | "owner" | "staff" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  /** Display name (collected at registration); optional for legacy/demo users. */
  name?: string;
  role: Role;
  /** Restaurant the user belongs to (owners/staff); absent for super_admin/customers. */
  restaurantId?: string;
}

export interface Session {
  user: AuthUser;
  token: string;
}

/** Role hierarchy check used for gating. */
export function hasRole(user: AuthUser, required: Role): boolean {
  const rank: Record<Role, number> = { customer: 0, staff: 1, owner: 2, super_admin: 3 };
  return rank[user.role] >= rank[required];
}
