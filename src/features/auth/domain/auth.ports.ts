import type { Session } from "@/features/auth/domain/session.entity";
import type { RestaurantPlan } from "@/features/restaurant";

/**
 * Self-serve signup: the new owner AND their restaurant. `register` creates
 * both (the live backend does it in one `/auth/register` call), so callers never
 * provision the restaurant separately.
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  restaurant: { name: string; slug: string; plan: RestaurantPlan };
}

/**
 * Port for authentication. Implemented by the in-memory mock (demo/dev) and the
 * HTTP repository (live). The session `token` returned here is what gets written
 * to the `mn_session` cookie and later handed back to {@link verify}.
 */
export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
  /** Create the owner + restaurant; throws `Error(code)` (`email_taken`, `slug_taken`, …). */
  register(input: RegisterInput): Promise<Session>;
  /** Validate a raw session token; null if invalid/expired. */
  verify(token: string): Promise<Session | null>;
  logout(token: string): Promise<void>;
}
