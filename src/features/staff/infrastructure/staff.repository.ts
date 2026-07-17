import { env } from "@/shared/config/env";
import type { StaffRepository } from "@/features/staff/domain/staff.ports";
import { InMemoryStaffRepository } from "@/features/staff/infrastructure/staff.mock.repository";
import { HttpStaffRepository } from "@/features/staff/infrastructure/staff.http.repository";

/**
 * Composition edge: pick the staff repository by data mode. `mock` (default)
 * uses the in-memory team; `live` talks to the backend (once its staff
 * endpoints exist — see docs/backend-endpoints-missing.md).
 */
export const staffRepository: StaffRepository =
  env.dataMode === "live" ? new HttpStaffRepository() : new InMemoryStaffRepository();
