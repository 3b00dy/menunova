import { httpClient } from "@/shared/http/httpClient";
import type { Menu, MenuItem, MenuItemId } from "@/features/menu/domain/menu.entity";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";
import { toMenu, type MenuDto } from "@/features/menu/infrastructure/menu.mapper";

/**
 * HTTP implementation of {@link MenuRepository} against the separate backend.
 * Implements the domain port; nothing in domain/application imports this file
 * directly — it is wired in at the composition edge (see application layer).
 */
export class HttpMenuRepository implements MenuRepository {
  async getByRestaurantSlug(slug: string): Promise<Menu | null> {
    const dto = await httpClient.get<MenuDto>(
      `/restaurants/${encodeURIComponent(slug)}/menu`,
      { next: { revalidate: 60, tags: [`menu:${slug}`] } },
    );
    return toMenu(dto);
  }

  async updateItem(
    id: MenuItemId,
    patch: Partial<Pick<MenuItem, "name" | "description" | "price" | "available">>,
    token: string,
  ): Promise<MenuItem> {
    const dto = await httpClient.patch<MenuDto["items"][number]>(
      `/menu-items/${encodeURIComponent(id)}`,
      patch,
      { token },
    );
    return {
      id: dto.id,
      categoryId: dto.category_id,
      name: dto.name,
      description: dto.description,
      price: { amountMinor: dto.price_minor, currency: dto.currency },
      available: dto.available,
      imageUrl: dto.image_url ?? undefined,
    };
  }
}

/** Default repository instance used by the application layer. */
export const menuRepository: MenuRepository = new HttpMenuRepository();
