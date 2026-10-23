import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { AuthRepository, RegisterInput } from "@/features/auth/domain/auth.ports";
import type { AuthUser, Role, Session } from "@/features/auth/domain/session.entity";
import {
  ownerUserFrom,
  signSession,
  verifySessionToken,
} from "@/features/auth/infrastructure/session-token";

/**
 * HTTP implementation of {@link AuthRepository} against the deployed backend.
 *
 * `login`/`verify`/`logout` hit the backend's live `/auth/*` endpoints.
 * `register` is served by the Next BFF (`POST /api/auth/register`) because the
 * backend has no signup endpoint yet — so its tokens are BFF-signed and
 * `verify` validates them locally before falling back to the backend.
 */

interface UserDto {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  restaurant_id?: string | null;
}

interface AuthDto {
  token: string;
  user: UserDto;
}

/**
 * Bridge the backend's restaurant **uuid** (`/auth/login` + `/auth/me` return
 * `restaurant_id` as a uuid) to the public **slug** the dashboard pages are keyed
 * by (menu / theme / language / staff all call `/restaurants/{slug}/...`). We
 * resolve the slug via `GET /restaurants/by-id/{id}` (cached — a restaurant's
 * slug rarely changes) and store the slug in `session.user.restaurantId`.
 *
 * Falls back to the original value on any failure, which also transparently
 * handles BFF-signed / demo owners whose `restaurantId` is *already* a slug
 * (the by-id lookup 404s → we keep the slug).
 */
async function resolveRestaurantSlug(
  idOrSlug: string | undefined,
  token: string,
): Promise<string | undefined> {
  if (!idOrSlug) return undefined;
  try {
    const restaurant = await httpClient.get<{ slug?: string } | null>(
      API_ENDPOINTS.restaurants.byId(idOrSlug),
      { token, next: { revalidate: 300, tags: [`restaurant:by-id:${idOrSlug}`] } },
    );
    return restaurant?.slug ?? idOrSlug;
  } catch {
    return idOrSlug;
  }
}

async function userFromDto(dto: UserDto, token: string): Promise<AuthUser> {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name ?? undefined,
    role: dto.role,
    restaurantId: await resolveRestaurantSlug(dto.restaurant_id ?? undefined, token),
  };
}

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<Session> {
    // `/auth/login` returns { token, user }.
    const dto = await httpClient.post<AuthDto>(API_ENDPOINTS.auth.login, { email, password });
    return { token: dto.token, user: await userFromDto(dto.user, dto.token) };
  }

  async register(input: RegisterInput): Promise<Session> {
    // No backend signup endpoint yet — mint a BFF-signed session locally (the
    // same thing `POST /api/auth/register` does). The restaurant is provisioned
    // separately by the caller via `POST /restaurants`.
    const user = ownerUserFrom({
      email: input.email,
      name: input.name,
      restaurantId: input.restaurantId,
    });
    return { token: signSession(user, Date.now()), user };
  }

  async verify(token: string): Promise<Session | null> {
    // BFF-issued (registration) tokens verify locally — no backend round-trip.
    const local = verifySessionToken(token, Date.now());
    if (local) return { token, user: local };

    // Otherwise it's a backend login token: `/auth/me` returns a bare user DTO
    // (no wrapper, no token) — pair it back with the caller's token.
    try {
      const dto = await httpClient.get<UserDto>(API_ENDPOINTS.auth.me, { token });
      return { token, user: await userFromDto(dto, token) };
    } catch {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await httpClient.post<void>(API_ENDPOINTS.auth.logout, undefined, { token });
    } catch {
      // Best-effort; the cookie is cleared regardless.
    }
  }
}
