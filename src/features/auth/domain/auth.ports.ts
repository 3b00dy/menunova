import type { Session } from "@/features/auth/domain/session.entity";

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
  /** Validate a raw session token against the backend. */
  verify(token: string): Promise<Session | null>;
  logout(token: string): Promise<void>;
}
