import type { AuthRepository, RegisterInput } from "@/features/auth/domain/auth.ports";
import type { AuthUser, Role, Session } from "@/features/auth/domain/session.entity";

/**
 * In-memory {@link AuthRepository} for demo & local development.
 *
 * A module-level user list persists across requests within a running server
 * process (resets on restart — fine for a demo). Tokens are opaque strings of
 * the form `mock.<userId>`; {@link verify} decodes them back to a session.
 *
 * Passwords are compared in plaintext — this is a DEV-ONLY mock. Real password
 * hashing and token signing are the backend's responsibility (live mode uses
 * {@link HttpAuthRepository}).
 */

interface StoredUser extends AuthUser {
  password: string;
}

const USERS: StoredUser[] = [
  { id: "u_super", email: "admin@menunova.app", name: "Platform Admin", role: "super_admin", password: "password" },
  { id: "u_owner", email: "owner@pizzapalace.test", name: "Layla Hassan", role: "owner", restaurantId: "demo", password: "password" },
  { id: "u_staff", email: "staff@pizzapalace.test", name: "Sara Karim", role: "staff", restaurantId: "demo", password: "password" },
];

// Monotonic id generator — avoids Math.random/Date so ids are stable per run.
let seq = 0;
const nextId = () => `u_${(seq += 1).toString(36)}`;

const TOKEN_PREFIX = "mock.";

function publicUser(u: StoredUser): AuthUser {
  const { password, ...rest } = u;
  void password;
  return { ...rest };
}

function toSession(u: StoredUser): Session {
  return { user: publicUser(u), token: TOKEN_PREFIX + u.id };
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export const mockAuthRepository: AuthRepository = {
  async login(email, password) {
    const user = USERS.find((u) => sameEmail(u.email, email) && u.password === password);
    if (!user) throw new Error("invalid_credentials");
    return toSession(user);
  },

  async register(input: RegisterInput) {
    if (USERS.some((u) => sameEmail(u.email, input.email))) {
      throw new Error("email_taken");
    }
    const user: StoredUser = {
      id: nextId(),
      email: input.email.trim(),
      name: input.name.trim(),
      role: "owner",
      restaurantId: input.restaurantId,
      password: input.password,
    };
    USERS.push(user);
    return toSession(user);
  },

  async verify(token) {
    if (!token.startsWith(TOKEN_PREFIX)) return null;
    const id = token.slice(TOKEN_PREFIX.length);
    const user = USERS.find((u) => u.id === id);
    return user ? toSession(user) : null;
  },

  async logout() {
    // Stateless mock: tokens are not tracked, so there is nothing to revoke.
  },
};

/**
 * Add a login-capable user to the mock store with an explicit role. Used when a
 * restaurant admin creates a staff member so that person can actually sign in
 * (in live mode the backend's staff endpoint owns this). No-ops on duplicate
 * email so re-creating a known email doesn't clobber the existing login.
 */
export function addMockUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
  restaurantId?: string;
}): void {
  if (USERS.some((u) => sameEmail(u.email, input.email))) return;
  USERS.push({
    id: nextId(),
    email: input.email.trim(),
    name: input.name.trim(),
    role: input.role,
    restaurantId: input.restaurantId,
    password: input.password,
  });
}
