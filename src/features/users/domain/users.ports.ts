import type { User, UserDraft, UserPatch } from "@/features/users/domain/user.entity";

/**
 * Port for system-user persistence. Implemented by the in-memory mock (demo/dev)
 * and the HTTP repository (live). Mutations take a bearer `token`; authorization
 * is enforced in the application layer via `requirePermission("users:manage")`
 * — only super admins hold it.
 */
export interface UsersRepository {
  list(): Promise<User[]>;
  create(draft: UserDraft, token: string): Promise<User>;
  update(id: string, patch: UserPatch, token: string): Promise<User>;
  remove(id: string, token: string): Promise<void>;
}
