"use server";

import { revalidatePath } from "next/cache";
import { createUser, requirePermission } from "@/features/auth";
import type {
  StaffDraft,
  StaffMember,
  StaffPatch,
} from "@/features/staff/domain/staff.entity";
import { staffRepository } from "@/features/staff/infrastructure/staff.repository";

/**
 * Staff mutations, exposed as Server Actions. Each re-checks the `staff:manage`
 * capability in the app layer — Server Actions are independently reachable
 * endpoints and must not trust path gating or the client UI. Only a restaurant
 * admin (owner) or super admin holds `staff:manage`.
 */

async function revalidate(locale: string): Promise<void> {
  revalidatePath(`/${locale}/dashboard/staff`);
}

/**
 * Create a staff USER: the admin sets an initial password and the account is
 * active immediately (no invitation). We create the staff record AND a matching
 * login so the person can actually sign in (`createUser` is a no-op in live mode,
 * where the backend's staff endpoint owns login creation).
 */
export async function createStaff(input: {
  locale: string;
  restaurantId: string;
  draft: StaffDraft;
}): Promise<StaffMember> {
  const { token } = await requirePermission("staff:manage");
  const created = await staffRepository.create(input.restaurantId, input.draft, token);
  await createUser({
    email: input.draft.email,
    password: input.draft.password,
    name: input.draft.name,
    role: input.draft.role,
    restaurantId: input.restaurantId,
  });
  await revalidate(input.locale);
  return created;
}

export async function updateStaff(input: {
  locale: string;
  id: string;
  patch: StaffPatch;
}): Promise<StaffMember> {
  const { token } = await requirePermission("staff:manage");
  const updated = await staffRepository.update(input.id, input.patch, token);
  await revalidate(input.locale);
  return updated;
}

export async function removeStaff(input: {
  locale: string;
  id: string;
}): Promise<void> {
  const { token } = await requirePermission("staff:manage");
  await staffRepository.remove(input.id, token);
  await revalidate(input.locale);
}
