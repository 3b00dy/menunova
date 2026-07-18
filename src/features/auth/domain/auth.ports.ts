import type { Session } from "@/features/auth/domain/session.entity";

/** Fields needed to register a new owner + their restaurant binding. */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  /** The restaurant the new owner is bound to (its slug in this app's convention). */
  restaurantId: string;
}

/**
 * Port for authentication. Implemented by the in-memory mock (demo/dev) and the
 * HTTP repository (live). The session `token` returned here is what gets written
 * to the `mn_session` cookie and later handed back to {@link verify}.
 */
export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
  register(input: RegisterInput): Promise<Session>;
  /** Validate a raw session token; null if invalid/expired. */
  verify(token: string): Promise<Session | null>;
  logout(token: string): Promise<void>;
}
