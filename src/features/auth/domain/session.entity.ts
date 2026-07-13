/** Auth domain: roles and the authenticated user/session shape. */

export type Role = "owner" | "staff" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  /** Restaurant the user belongs to (owners/staff); absent for customers. */
  restaurantId?: string;
}

export interface Session {
  user: AuthUser;
  token: string;
}

/** Role hierarchy check used for gating. */
export function hasRole(user: AuthUser, required: Role): boolean {
  const rank: Record<Role, number> = { customer: 0, staff: 1, owner: 2 };
  return rank[user.role] >= rank[required];
}
