/**
 * Staff domain: a member of a restaurant's team.
 *
 * A staff member's `role` maps onto the auth roles that carry restaurant-scoped
 * permissions: `owner` is the restaurant admin (full control) and `staff` can
 * only toggle item availability. Keeping this list here (rather than the whole
 * auth `Role` union) means the manager UI only ever offers restaurant-scoped
 * roles — never `super_admin` or `customer`.
 */

export type StaffRole = "owner" | "staff";
export type StaffStatus = "active" | "invited";

export const STAFF_ROLES: readonly StaffRole[] = ["owner", "staff"];

export interface StaffMember {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  /** `invited` until the person accepts; `active` once they've signed in. */
  status: StaffStatus;
}

/**
 * Fields to CREATE a new staff user (id/status assigned server-side). The admin
 * sets an initial password — the member is a real, immediately-active login, not
 * an emailed invitation.
 */
export interface StaffDraft {
  email: string;
  name: string;
  role: StaffRole;
  password: string;
}

/** Partial update for an existing staff member (e.g. change their role). */
export type StaffPatch = Partial<Pick<StaffMember, "role" | "name">>;
