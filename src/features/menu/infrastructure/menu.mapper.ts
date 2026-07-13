import type { Category, Menu, MenuItem } from "@/features/menu/domain/menu.entity";

/**
 * Maps backend API DTOs to domain entities. Keeping this boundary here means a
 * change in the API's JSON shape only touches this file, not the domain or UI.
 */

export interface MenuDto {
  restaurant_slug: string;
  categories: Array<{ id: string; name: string; position: number }>;
  items: Array<{
    id: string;
    category_id: string;
    name: string;
    description: string;
    price_minor: number;
    currency: string;
    available: boolean;
    image_url?: string | null;
  }>;
}

function toCategory(dto: MenuDto["categories"][number]): Category {
  return { id: dto.id, name: dto.name, position: dto.position };
}

function toItem(dto: MenuDto["items"][number]): MenuItem {
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

export function toMenu(dto: MenuDto): Menu {
  return {
    restaurantSlug: dto.restaurant_slug,
    categories: dto.categories.map(toCategory),
    items: dto.items.map(toItem),
  };
}
