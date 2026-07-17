import type { StaffMember } from "@/features/staff/domain/staff.entity";
import { staffRepository } from "@/features/staff/infrastructure/staff.repository";

/**
 * List a restaurant's staff. Swallows backend errors and returns an empty list
 * so the page renders a clean empty state when the API is down (same convention
 * as the menu/restaurant query use-cases).
 */
export async function listStaff(restaurantId: string): Promise<StaffMember[]> {
  try {
    return await staffRepository.list(restaurantId);
  } catch {
    return [];
  }
}
