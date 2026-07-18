import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { StaffRepository } from "@/features/staff/domain/staff.ports";
import { InMemoryStaffRepository } from "@/features/staff/infrastructure/staff.mock.repository";
import { HttpStaffRepository } from "@/features/staff/infrastructure/staff.http.repository";

/**
 * Composition edge: route the staff repository per request (see
 * `requestRoutedRepository`). Demo sessions and mock mode use the in-memory
 * team; live sessions talk to the backend staff endpoints (still missing — see
 * docs/missed-endpoints.md, so live staff falls back to an empty team for now).
 */
export const staffRepository: StaffRepository = requestRoutedRepository(
  new InMemoryStaffRepository(),
  new HttpStaffRepository(),
);
