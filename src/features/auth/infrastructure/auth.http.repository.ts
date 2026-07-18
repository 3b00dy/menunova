import { httpClient } from "@/shared/http/httpClient";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { AuthRepository, RegisterInput } from "@/features/auth/domain/auth.ports";
import type { Role, Session } from "@/features/auth/domain/session.entity";

/**
 * HTTP implementation of {@link AuthRepository}.
 *
 * NOTE: the `/auth/*` endpoints it calls are NOT YET IMPLEMENTED by the backend
 * — this documents the expected contract so flipping `dataMode=live` works the
 * moment they ship. See docs/backend-endpoints-missing.md.
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

function toSession(dto: AuthDto): Session {
  return {
    token: dto.token,
    user: {
      id: dto.user.id,
      email: dto.user.email,
      name: dto.user.name ?? undefined,
      role: dto.user.role,
      restaurantId: dto.user.restaurant_id ?? undefined,
    },
  };
}

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<Session> {
    const dto = await httpClient.post<AuthDto>(API_ENDPOINTS.auth.login, { email, password });
    return toSession(dto);
  }

  async register(input: RegisterInput): Promise<Session> {
    const dto = await httpClient.post<AuthDto>(API_ENDPOINTS.auth.register, {
      email: input.email,
      password: input.password,
      name: input.name,
      restaurant_id: input.restaurantId,
    });
    return toSession(dto);
  }

  async verify(token: string): Promise<Session | null> {
    try {
      const dto = await httpClient.get<AuthDto>(API_ENDPOINTS.auth.me, { token });
      return toSession(dto);
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
