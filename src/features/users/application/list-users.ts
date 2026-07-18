import type { User } from "@/features/users/domain/user.entity";
import { usersRepository } from "@/features/users/infrastructure/users.repository";

/**
 * List every user on the platform (super-admin view). Swallows backend errors
 * and returns an empty list so the page renders a clean empty state when the API
 * is down (same convention as the staff/restaurant query use-cases).
 */
export async function listUsers(): Promise<User[]> {
  try {
    return await usersRepository.list();
  } catch {
    return [];
  }
}
