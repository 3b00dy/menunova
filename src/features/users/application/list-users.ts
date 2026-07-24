import type { User } from "@/features/users/domain/user.entity";
import { requirePermission } from "@/features/auth";
import { usersRepository } from "@/features/users/infrastructure/users.repository";

/**
 * List every user on the platform (super-admin view). The live `GET /users`
 * endpoint enforces auth (401 without a bearer token), so we resolve the
 * caller's token via `requirePermission("users:manage")` and forward it — the
 * same way the create/update/delete actions do. Swallows backend errors and
 * returns an empty list so the page renders a clean empty state when the API is
 * down (same convention as the staff/restaurant query use-cases).
 */
export async function listUsers(): Promise<User[]> {
  try {
    const { token } = await requirePermission("users:manage");
    return await usersRepository.list(token);
  } catch {
    return [];
  }
}
