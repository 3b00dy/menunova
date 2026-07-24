import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type {
  User,
  UserDraft,
  UserPatch,
  UserRole,
  UserStatus,
} from "@/features/users/domain/user.entity";
import type { UsersRepository } from "@/features/users/domain/users.ports";

/**
 * HTTP implementation of {@link UsersRepository}.
 *
 * NOTE: the `/users` endpoints it calls are NOT YET IMPLEMENTED by the backend —
 * this repo documents the expected contract (snake_case DTOs) so flipping to
 * live works the moment they ship. Until then the mock repo serves the demo.
 * See docs/missed-endpoints.md.
 */

interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurant_id?: string | null;
  status: UserStatus;
  created_at?: string | null;
  last_active_at?: string | null;
}

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    role: dto.role,
    restaurantId: dto.restaurant_id ?? undefined,
    status: dto.status,
    createdAt: dto.created_at ?? undefined,
    lastActiveAt: dto.last_active_at ?? undefined,
  };
}

/** Domain draft/patch → backend snake_case body (only defined fields sent). */
function toBody(patch: UserPatch & Partial<UserDraft>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.email !== undefined) body.email = patch.email;
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.role !== undefined) body.role = patch.role;
  if (patch.password !== undefined) body.password = patch.password;
  if (patch.restaurantId !== undefined) body.restaurant_id = patch.restaurantId ?? null;
  if (patch.status !== undefined) body.status = patch.status;
  return body;
}

export class HttpUsersRepository implements UsersRepository {
  async list(token: string): Promise<User[]> {
    const dtos = await httpClient.get<UserDto[]>(API_ENDPOINTS.users.list, { token });
    return dtos.map(toUser);
  }

  async create(draft: UserDraft, token: string): Promise<User> {
    const dto = await httpClient.post<UserDto>(API_ENDPOINTS.users.list, toBody(draft), { token });
    return toUser(dto);
  }

  async update(id: string, patch: UserPatch, token: string): Promise<User> {
    const dto = await httpClient.patch<UserDto>(API_ENDPOINTS.users.byId(id), toBody(patch), { token });
    return toUser(dto);
  }

  async remove(id: string, token: string): Promise<void> {
    await httpClient.delete<void>(API_ENDPOINTS.users.byId(id), { token });
  }
}
