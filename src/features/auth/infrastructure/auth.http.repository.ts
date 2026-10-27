import { httpClient } from "@/shared/http/httpClient";
import { ApiError } from "@/shared/http/httpError";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { AuthRepository, RegisterInput } from "@/features/auth/domain/auth.ports";
import type { AuthUser, Role, Session } from "@/features/auth/domain/session.entity";

/**
 * HTTP implementation of {@link AuthRepository} against the deployed backend.
 * Every token is a backend JWT: `register`/`login` mint one, `verify` checks it
 * via `GET /auth/me`, `logout` revokes it. No session is ever signed locally.
 */

interface UserDto {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  /** Restaurant uuid (FK). */
  restaurant_id?: string | null;
  /** Restaurant public slug — returned by `/auth/register`, `/auth/login`, `/auth/me`. */
  restaurant_slug?: string | null;
}

interface AuthDto {
  token: string;
  user: UserDto;
}

/**
 * Fallback bridge from the restaurant **uuid** to the public **slug** the
 * dashboard pages are keyed by (menu / theme / language / staff all call
 * `/restaurants/{slug}/...`) — only used when the backend omits
 * `restaurant_slug`. Cached; keeps the original value on failure.
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

/** `session.user.restaurantId` is always the restaurant SLUG in this app. */
async function userFromDto(dto: UserDto, token: string): Promise<AuthUser> {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name ?? undefined,
    role: dto.role,
    restaurantId:
      dto.restaurant_slug ?? (await resolveRestaurantSlug(dto.restaurant_id ?? undefined, token)),
  };
}

/**
 * Map a `/auth/register` failure to the wizard's error codes. The backend
 * returns `409` for both a taken email and a taken slug; its message names which.
 */
function registerErrorCode(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 409) {
      const message = (e.body as { message?: string } | null)?.message ?? "";
      return /slug/i.test(message) ? "slug_taken" : "email_taken";
    }
    if (e.status === 400) return "invalid";
  }
  return "generic";
}

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<Session> {
    // `/auth/login` returns { token, user }.
    const dto = await httpClient.post<AuthDto>(API_ENDPOINTS.auth.login, { email, password });
    return { token: dto.token, user: await userFromDto(dto.user, dto.token) };
  }

  /**
   * Public self-serve signup: the backend creates the owner account AND their
   * restaurant (name, slug, plan) in one call and returns a real session.
   * Throws `Error(code)` with a wizard error code on failure.
   */
  async register(input: RegisterInput): Promise<Session> {
    let dto: AuthDto;
    try {
      dto = await httpClient.post<AuthDto>(API_ENDPOINTS.auth.register, {
        name: input.name,
        email: input.email,
        password: input.password,
        restaurant_name: input.restaurant.name,
        slug: input.restaurant.slug,
        plan: input.restaurant.plan,
      });
    } catch (e) {
      throw new Error(registerErrorCode(e));
    }
    return { token: dto.token, user: await userFromDto(dto.user, dto.token) };
  }

  async verify(token: string): Promise<Session | null> {
    // `/auth/me` returns a bare user DTO (no wrapper, no token) — pair it back
    // with the caller's token.
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
