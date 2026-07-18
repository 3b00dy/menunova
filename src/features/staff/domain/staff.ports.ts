import type { StaffDraft, StaffMember, StaffPatch } from "@/features/staff/domain/staff.entity";

/**
 * Port for staff persistence. Implemented by the in-memory mock (demo/dev) and
 * the HTTP repository (live). Mutations take a bearer `token`; authorization is
 * enforced in the application layer via `requirePermission("staff:manage")`.
 */
export interface StaffRepository {
  list(restaurantId: string): Promise<StaffMember[]>;
  create(restaurantId: string, draft: StaffDraft, token: string): Promise<StaffMember>;
  update(id: string, patch: StaffPatch, token: string): Promise<StaffMember>;
  remove(id: string, token: string): Promise<void>;
}
