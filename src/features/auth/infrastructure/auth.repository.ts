import { env } from "@/shared/config/env";
import type { AuthRepository } from "@/features/auth/domain/auth.ports";
import { mockAuthRepository } from "@/features/auth/infrastructure/auth.mock.repository";
import { HttpAuthRepository } from "@/features/auth/infrastructure/auth.http.repository";

/**
 * Composition edge: pick the auth repository by data mode. `mock` (default)
 * uses the in-memory user store; `live` talks to the backend's `/auth/*`
 * endpoints (once they exist — see docs/backend-endpoints-missing.md).
 */
export const authRepository: AuthRepository =
  env.dataMode === "live" ? new HttpAuthRepository() : mockAuthRepository;
