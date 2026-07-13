"use server";

import { revalidateTag } from "next/cache";
import type {
  Category,
  CategoryDraft,
  CategoryId,
  CategoryPatch,
} from "@/features/menu/domain/menu.entity";
import { menuRepository } from "@/features/menu/infrastructure/menu.repository";
import { requireMenuToken } from "@/features/menu/application/_token";

/**
 * Category mutations, exposed as Server Actions. Deleting a category cascades to
 * its items (see the repository). Authorization is enforced inside each.
 */

function revalidate(slug: string): void {
  revalidateTag(`menu:${slug}`, "max");
}

export async function createCategory(
  slug: string,
  draft: CategoryDraft,
): Promise<Category> {
  const token = await requireMenuToken();
  const created = await menuRepository.createCategory(slug, draft, token);
  revalidate(slug);
  return created;
}

export async function updateCategory(
  slug: string,
  id: CategoryId,
  patch: CategoryPatch,
): Promise<Category> {
  const token = await requireMenuToken();
  const updated = await menuRepository.updateCategory(id, patch, token);
  revalidate(slug);
  return updated;
}

export async function deleteCategory(
  slug: string,
  id: CategoryId,
): Promise<void> {
  const token = await requireMenuToken();
  await menuRepository.deleteCategory(id, token);
  revalidate(slug);
}
