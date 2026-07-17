import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type {
  Category,
  CategoryDraft,
  CategoryId,
  CategoryPatch,
  Menu,
  MenuItem,
  MenuItemDraft,
  MenuItemId,
  MenuItemPatch,
} from "@/features/menu/domain/menu.entity";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";
import {
  toCategory,
  toItem,
  toMenu,
  type CategoryDto,
  type ItemDto,
  type MenuDto,
} from "@/features/menu/infrastructure/menu.mapper";

/**
 * HTTP implementation of {@link MenuRepository} against the separate backend.
 * Implements the domain port; nothing in domain/application imports this file
 * directly — it is wired in at the composition edge (see `menu.repository.ts`).
 */
export class HttpMenuRepository implements MenuRepository {
  async getByRestaurantSlug(slug: string): Promise<Menu | null> {
    const dto = await httpClient.get<MenuDto>(
      API_ENDPOINTS.restaurants.menu(slug),
      { next: { revalidate: 60, tags: [`menu:${slug}`] } },
    );
    return toMenu(dto);
  }

  async createItem(slug: string, draft: MenuItemDraft, token: string): Promise<MenuItem> {
    const dto = await httpClient.post<ItemDto>(
      API_ENDPOINTS.restaurants.menuItems(slug),
      itemBody(draft),
      { token },
    );
    return toItem(dto);
  }

  async updateItem(id: MenuItemId, patch: MenuItemPatch, token: string): Promise<MenuItem> {
    const dto = await httpClient.patch<ItemDto>(
      API_ENDPOINTS.menuItems.byId(id),
      itemBody(patch),
      { token },
    );
    return toItem(dto);
  }

  async deleteItem(id: MenuItemId, token: string): Promise<void> {
    await httpClient.delete<void>(API_ENDPOINTS.menuItems.byId(id), { token });
  }

  async createCategory(slug: string, draft: CategoryDraft, token: string): Promise<Category> {
    const dto = await httpClient.post<CategoryDto>(
      API_ENDPOINTS.restaurants.categories(slug),
      { name: draft.name, position: draft.position },
      { token },
    );
    return toCategory(dto);
  }

  async updateCategory(id: CategoryId, patch: CategoryPatch, token: string): Promise<Category> {
    const dto = await httpClient.patch<CategoryDto>(
      API_ENDPOINTS.categories.byId(id),
      { name: patch.name, position: patch.position },
      { token },
    );
    return toCategory(dto);
  }

  async deleteCategory(id: CategoryId, token: string): Promise<void> {
    await httpClient.delete<void>(API_ENDPOINTS.categories.byId(id), { token });
  }
}

/** Domain item draft/patch → backend snake_case body (only defined fields sent). */
function itemBody(patch: MenuItemPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.categoryId !== undefined) body.category_id = patch.categoryId;
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.description !== undefined) body.description = patch.description;
  if (patch.price !== undefined) {
    body.price_minor = patch.price.amountMinor;
    body.currency = patch.price.currency;
  }
  if (patch.available !== undefined) body.available = patch.available;
  if (patch.imageUrl !== undefined) body.image_url = patch.imageUrl ?? null;
  return body;
}
