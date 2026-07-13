"use server";

import { revalidateTag } from "next/cache";
import type {
  MenuItem,
  MenuItemDraft,
  MenuItemId,
  MenuItemPatch,
} from "@/features/menu/domain/menu.entity";
import { menuRepository } from "@/features/menu/infrastructure/menu.repository";
import { requireMenuToken } from "@/features/menu/application/_token";

/**
 * Menu item mutations, exposed as Server Actions. Authorization is enforced
 * inside each (see {@link requireMenuToken}) — Server Actions are independently
 * reachable endpoints and must not trust path-based gating.
 */

function revalidate(slug: string): void {
  // Next.js 16: revalidateTag requires a cacheLife profile as the 2nd argument.
  revalidateTag(`menu:${slug}`, "max");
}

export async function createMenuItem(
  slug: string,
  draft: MenuItemDraft,
): Promise<MenuItem> {
  const token = await requireMenuToken();
  const created = await menuRepository.createItem(slug, draft, token);
  revalidate(slug);
  return created;
}

export async function updateMenuItem(
  slug: string,
  id: MenuItemId,
  patch: MenuItemPatch,
): Promise<MenuItem> {
  const token = await requireMenuToken();
  const updated = await menuRepository.updateItem(id, patch, token);
  revalidate(slug);
  return updated;
}

export async function deleteMenuItem(
  slug: string,
  id: MenuItemId,
): Promise<void> {
  const token = await requireMenuToken();
  await menuRepository.deleteItem(id, token);
  revalidate(slug);
}
