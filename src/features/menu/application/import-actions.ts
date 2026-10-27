"use server";

import { revalidateTag } from "next/cache";
import type { LocalizedText } from "@/shared/i18n/localized";
import { requirePermission } from "@/features/auth";
import { IMPORT_BATCH_SIZE, MAX_IMPORT_ROWS } from "@/features/menu/domain/menu-import";
import { menuRepository } from "@/features/menu/infrastructure/menu.repository";

/**
 * Bulk import (CSV template) as Server Actions. The browser parses + previews
 * the file, then calls these in small batches with a progress bar — so a large
 * import never hits a hosting time limit. Both re-check `menu:manage` and
 * re-validate their input: Server Actions are reachable directly, so the
 * client's validation is never trusted.
 */

const MAX_NAME = 200;
const MAX_DESCRIPTION = 1000;

/** Keep only non-empty string values, trimmed and length-capped. */
function clean(text: LocalizedText | undefined, max: number): LocalizedText {
  const out: LocalizedText = {};
  for (const [lang, value] of Object.entries(text ?? {})) {
    if (typeof value === "string" && value.trim()) out[lang] = value.trim().slice(0, max);
  }
  return out;
}

const keyOf = (name: LocalizedText, defaultLanguage: string) =>
  (name[defaultLanguage] ?? "").trim().toLocaleLowerCase();

/**
 * Resolve every category the file mentions to an id, creating the missing ones
 * (appended after existing categories). Matching is by the default-language
 * name, case-insensitive, against a FRESH read of the menu. Returns a map keyed
 * by the lowercased default-language name.
 */
export async function prepareMenuImport(input: {
  slug: string;
  defaultLanguage: string;
  categories: LocalizedText[];
}): Promise<{ ids: Record<string, string>; created: number }> {
  const { token } = await requirePermission("menu:manage");
  if (input.categories.length > MAX_IMPORT_ROWS) throw new Error("too_many_rows");

  const menu = await menuRepository.getByRestaurantSlug(input.slug, { fresh: true });
  const ids: Record<string, string> = {};
  let position = 1;
  for (const category of menu?.categories ?? []) {
    ids[keyOf(category.name, input.defaultLanguage)] ??= category.id;
    position = Math.max(position, category.position + 1);
  }

  let created = 0;
  for (const raw of input.categories) {
    const name = clean(raw, MAX_NAME);
    const key = keyOf(name, input.defaultLanguage);
    if (!key || ids[key]) continue;
    const category = await menuRepository.createCategory(input.slug, { name, position: position++ }, token);
    ids[key] = category.id;
    created++;
  }
  if (created) revalidateTag(`menu:${input.slug}`, "max");
  return { ids, created };
}

export interface ImportItemDraft {
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: { amountMinor: number; currency: string };
  available: boolean;
  imageUrl?: string;
}

/**
 * Create one batch of items (≤ {@link IMPORT_BATCH_SIZE}). Invalid or failed
 * entries are reported by index instead of aborting the batch.
 */
export async function importMenuItems(input: {
  slug: string;
  items: ImportItemDraft[];
}): Promise<{ created: number; failed: number[] }> {
  const { token } = await requirePermission("menu:manage");
  if (input.items.length > IMPORT_BATCH_SIZE) throw new Error("batch_too_large");

  let created = 0;
  const failed: number[] = [];
  for (const [index, item] of input.items.entries()) {
    const name = clean(item.name, MAX_NAME);
    const valid =
      typeof item.categoryId === "string" &&
      item.categoryId !== "" &&
      Object.keys(name).length > 0 &&
      Number.isInteger(item.price?.amountMinor) &&
      item.price.amountMinor >= 0 &&
      /^[A-Z]{3}$/.test(item.price.currency) &&
      (item.imageUrl === undefined || /^https?:\/\/\S+$/i.test(item.imageUrl));
    if (!valid) {
      failed.push(index);
      continue;
    }
    try {
      await menuRepository.createItem(
        input.slug,
        {
          categoryId: item.categoryId,
          name,
          description: clean(item.description, MAX_DESCRIPTION),
          price: { amountMinor: item.price.amountMinor, currency: item.price.currency },
          available: item.available !== false,
          imageUrl: item.imageUrl,
        },
        token,
      );
      created++;
    } catch {
      failed.push(index);
    }
  }
  if (created) revalidateTag(`menu:${input.slug}`, "max");
  return { created, failed };
}
