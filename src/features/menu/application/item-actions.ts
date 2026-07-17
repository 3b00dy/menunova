"use server";

import { revalidateTag } from "next/cache";
import { requirePermission } from "@/features/auth";
import type {
  MenuItem,
  MenuItemDraft,
  MenuItemId,
  MenuItemPatch,
} from "@/features/menu/domain/menu.entity";
import { menuRepository } from "@/features/menu/infrastructure/menu.repository";

/**
 * Menu item mutations, exposed as Server Actions. Authorization is enforced
 * inside each — Server Actions are independently reachable endpoints and must
 * not trust path-based gating or the client UI.
 *
 * Two distinct capabilities gate these: full CRUD requires `menu:manage`
 * (restaurant admin), while flipping availability requires only
 * `menu:availability` (restaurant staff). Keep {@link setItemAvailability}
 * separate so staff can mark items in/out of stock WITHOUT the ability to edit
 * or delete the menu.
 */

function revalidate(slug: string): void {
  // Next.js 16: revalidateTag requires a cacheLife profile as the 2nd argument.
  revalidateTag(`menu:${slug}`, "max");
}

export async function createMenuItem(
  slug: string,
  draft: MenuItemDraft,
): Promise<MenuItem> {
  const { token } = await requirePermission("menu:manage");
  const created = await menuRepository.createItem(slug, draft, token);
  revalidate(slug);
  return created;
}

export async function updateMenuItem(
  slug: string,
  id: MenuItemId,
  patch: MenuItemPatch,
): Promise<MenuItem> {
  const { token } = await requirePermission("menu:manage");
  const updated = await menuRepository.updateItem(id, patch, token);
  revalidate(slug);
  return updated;
}

export async function deleteMenuItem(
  slug: string,
  id: MenuItemId,
): Promise<void> {
  const { token } = await requirePermission("menu:manage");
  await menuRepository.deleteItem(id, token);
  revalidate(slug);
}

/**
 * Toggle a single item's availability (in / out of stock). Gated by
 * `menu:availability` — the ONE menu capability restaurant staff hold. This is
 * deliberately narrower than {@link updateMenuItem}: it only ever sends the
 * `available` flag, so a staff member can never edit price, name, etc.
 */
export async function setItemAvailability(
  slug: string,
  id: MenuItemId,
  available: boolean,
): Promise<MenuItem> {
  const { token } = await requirePermission("menu:availability");
  const updated = await menuRepository.updateItem(id, { available }, token);
  revalidate(slug);
  return updated;
}
