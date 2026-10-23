import { menuRepository } from "@/features/menu/infrastructure/menu.repository";

/**
 * System-level menu seed used by self-serve signup (onboarding wizard's
 * "first category + item" step, BRD BR-LP-05). Like
 * `provisionRestaurantLanguages`, it carries NO permission gate — it runs while
 * the owner is being provisioned, before their session cookie exists — and the
 * freshly minted owner `token` authorizes the writes.
 *
 * Text is stored in the restaurant's default `language` only; the menu editor
 * flags the missing translations afterwards. The item is optional.
 */
export async function provisionFirstMenu(
  slug: string,
  input: {
    language: string;
    categoryName: string;
    item?: { name: string; priceMinor: number; currency: string };
  },
  token: string,
): Promise<void> {
  const category = await menuRepository.createCategory(
    slug,
    { name: { [input.language]: input.categoryName }, position: 1 },
    token,
  );
  if (!input.item) return;
  await menuRepository.createItem(
    slug,
    {
      categoryId: category.id,
      name: { [input.language]: input.item.name },
      description: {},
      price: { amountMinor: input.item.priceMinor, currency: input.item.currency },
      available: true,
    },
    token,
  );
}
