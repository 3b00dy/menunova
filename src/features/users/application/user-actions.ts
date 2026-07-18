"use server";

import { revalidatePath } from "next/cache";
import { createUser as createLogin, requirePermission } from "@/features/auth";
import type {
  User,
  UserDraft,
  UserPatch,
} from "@/features/users/domain/user.entity";
import { usersRepository } from "@/features/users/infrastructure/users.repository";

/**
 * System-user mutations, exposed as Server Actions. Each re-checks the
 * `users:manage` capability in the app layer — Server Actions are independently
 * reachable endpoints and must not trust path gating or the client UI. Only a
 * super admin holds `users:manage`.
 */

async function revalidate(locale: string): Promise<void> {
  revalidatePath(`/${locale}/dashboard/users`);
}

/**
 * Create a user account. We create the user record AND a matching login so the
 * person can actually sign in (`createLogin` is a no-op in live mode, where the
 * backend's users endpoint owns login creation).
 */
export async function createUserAccount(input: {
  locale: string;
  draft: UserDraft;
}): Promise<User> {
  const { token } = await requirePermission("users:manage");
  const created = await usersRepository.create(input.draft, token);
  await createLogin({
    email: input.draft.email,
    password: input.draft.password,
    name: input.draft.name,
    role: input.draft.role,
    restaurantId: input.draft.restaurantId,
  });
  await revalidate(input.locale);
  return created;
}

export async function updateUserAccount(input: {
  locale: string;
  id: string;
  patch: UserPatch;
}): Promise<User> {
  const { token } = await requirePermission("users:manage");
  const updated = await usersRepository.update(input.id, input.patch, token);
  await revalidate(input.locale);
  return updated;
}

export async function deleteUserAccount(input: {
  locale: string;
  id: string;
}): Promise<void> {
  const { token } = await requirePermission("users:manage");
  await usersRepository.remove(input.id, token);
  await revalidate(input.locale);
}
