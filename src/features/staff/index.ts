/** Public API of the `staff` feature. Import only from here. */
export type {
  StaffMember,
  StaffRole,
  StaffStatus,
  StaffDraft,
  StaffPatch,
} from "@/features/staff/domain/staff.entity";
export { STAFF_ROLES } from "@/features/staff/domain/staff.entity";

export { listStaff } from "@/features/staff/application/list-staff";
export {
  createStaff,
  updateStaff,
  removeStaff,
} from "@/features/staff/application/staff-actions";

export { StaffManager } from "@/features/staff/ui/StaffManager";

// Intentionally NOT exported: repositories, ports, DTOs — private.
