import { env } from "@/shared/config/env";
import type { Role } from "@/features/auth/domain/session.entity";
import { addMockUser } from "@/features/auth/infrastructure/auth.mock.repository";

/**
 * Create a login for a user an admin is provisioning (e.g. a new staff member).
 *
 * Mode-aware: in `mock` mode it adds the credential to the in-memory auth store
 * so the person can sign in locally. In `live` mode the backend endpoint that
 * created the record (e.g. `POST /restaurants/{slug}/staff`) owns login
 * creation, so this is a no-op. Callers therefore always invoke it without
 * branching on the data mode.
 */
export async function createUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  restaurantId?: string;
}): Promise<void> {
  if (env.dataMode === "mock") {
    addMockUser(input);
  }
}
