import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPatch,
  RestaurantPlan,
  RestaurantStatus,
} from "@/features/restaurant/domain/restaurant.entity";
import type { RestaurantRepository } from "@/features/restaurant/domain/restaurant.ports";

/**
 * HTTP implementation of {@link RestaurantRepository} against the separate
 * backend. Endpoints follow the same REST convention as the menu repo; wired in
 * at the composition edge (see `restaurant.repository.ts`) when `dataMode=live`.
 */

interface RestaurantDto {
  id: string;
  slug: string;
  name: string;
  plan: RestaurantPlan;
  status: RestaurantStatus;
  owner_email?: string | null;
  logo_url?: string | null;
  brand_color?: string | null;
  created_at?: string | null;
}

function toRestaurant(dto: RestaurantDto): Restaurant {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    plan: dto.plan,
    status: dto.status,
    ownerEmail: dto.owner_email ?? undefined,
    logoUrl: dto.logo_url ?? undefined,
    brandColor: dto.brand_color ?? undefined,
    createdAt: dto.created_at ?? undefined,
  };
}

function toBody(patch: RestaurantPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.slug !== undefined) body.slug = patch.slug;
  if (patch.ownerEmail !== undefined) body.owner_email = patch.ownerEmail ?? null;
  if (patch.plan !== undefined) body.plan = patch.plan;
  if (patch.status !== undefined) body.status = patch.status;
  return body;
}

export class HttpRestaurantRepository implements RestaurantRepository {
  async getBySlug(slug: string): Promise<Restaurant | null> {
    const dto = await httpClient.get<RestaurantDto | null>(
      API_ENDPOINTS.restaurants.bySlug(slug),
    );
    return dto ? toRestaurant(dto) : null;
  }

  async getById(id: string): Promise<Restaurant | null> {
    const dto = await httpClient.get<RestaurantDto | null>(
      API_ENDPOINTS.restaurants.byId(id),
    );
    return dto ? toRestaurant(dto) : null;
  }

  async list(): Promise<Restaurant[]> {
    const dtos = await httpClient.get<RestaurantDto[]>(API_ENDPOINTS.restaurants.list);
    return dtos.map(toRestaurant);
  }

  async create(draft: RestaurantDraft, token: string): Promise<Restaurant> {
    const dto = await httpClient.post<RestaurantDto>(
      API_ENDPOINTS.restaurants.list,
      toBody(draft),
      { token },
    );
    return toRestaurant(dto);
  }

  async update(id: string, patch: RestaurantPatch, token: string): Promise<Restaurant> {
    const dto = await httpClient.patch<RestaurantDto>(
      API_ENDPOINTS.restaurants.byId(id),
      toBody(patch),
      { token },
    );
    return toRestaurant(dto);
  }

  async delete(id: string, token: string): Promise<void> {
    await httpClient.delete<void>(API_ENDPOINTS.restaurants.byId(id), { token });
  }
}
