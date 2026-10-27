import type { StaffMember } from "@/features/staff/domain/staff.entity";
import { staffRepository } from "@/features/staff/infrastructure/staff.repository";

/**
 * List a restaurant's staff. The live endpoint requires the caller's bearer
 * `token` (401 without one) — the server page passes `session.token` (this
 * module stays session-free so it never drags `next/headers` into a client
 * bundle). Swallows errors and returns an empty list so the page renders a clean
 * empty state (same convention as the menu/restaurant query use-cases).
 */
export async function listStaff(restaurantId: string, token: string): Promise<StaffMember[]> {
  try {
    return await staffRepository.list(restaurantId, token);
  } catch {
    return [];
  }
}
