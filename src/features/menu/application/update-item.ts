"use server";

import { revalidateTag } from "next/cache";
import type { MenuItem, MenuItemId } from "@/features/menu/domain/menu.entity";
import { menuRepository } from "@/features/menu/infrastructure/menu.http.repository";
import { getServerSession } from "@/shared/auth/getServerSession";

/**
 * Mutation use-case as a Server Action. Server Actions are independently
 * reachable POST endpoints, so authorization MUST be checked inside — never
 * assume the proxy gated it (see Next.js 16 data-security guidance).
 */
export async function updateMenuItem(
  restaurantSlug: string,
  id: MenuItemId,
  patch: Partial<Pick<MenuItem, "name" | "description" | "price" | "available">>,
): Promise<MenuItem> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const updated = await menuRepository.updateItem(id, patch, session.token);

  // Next.js 16: revalidateTag requires a cacheLife profile as the 2nd argument.
  revalidateTag(`menu:${restaurantSlug}`, "max");

  return updated;
}
