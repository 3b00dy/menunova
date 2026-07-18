import type { AuthUser, Session } from "@/features/auth/domain/session.entity";

/**
 * Demo accounts for public visitors — "try it before you subscribe".
 *
 * Signing in with these credentials NEVER calls the backend: the `login` action
 * recognizes them and short-circuits to a demo {@link Session}, and for that
 * request the app serves the seeded in-memory **"demo"** tenant instead of the
 * live API (see `@/shared/data/request-routed-repository`). Two roles are
 * offered so both dashboard flows are walkable:
 *   • **restaurant admin** (`owner`) — full menu / staff / theme / settings
 *   • **staff** — availability toggle only ("only see what you can do")
 * Both belong to the same demo restaurant, and the staff member (Sara) was
 * "created by" the admin (Layla) — they're seeded together in the mock team.
 *
 * Demo tokens are opaque and prefixed `demo-` so the session resolver and the
 * repositories can recognize them with no backend round-trip. They deliberately
 * can't authorize real API calls — the whole point is an isolated sandbox.
 */

/** The seeded tenant the demo users belong to (matches the mock repositories). */
export const DEMO_RESTAURANT_ID = "demo";

export interface DemoAccount {
  email: string;
  password: string;
  /** Opaque session token (see `isDemoToken`). */
  token: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "owner@pizzapalace.test",
    password: "demo1234",
    token: "demo-owner",
    user: {
      id: "s_owner",
      email: "owner@pizzapalace.test",
      name: "Layla Hassan",
      role: "owner",
      restaurantId: DEMO_RESTAURANT_ID,
    },
  },
  {
    email: "sara@pizzapalace.test",
    password: "demo1234",
    token: "demo-staff",
    user: {
      id: "s_sara",
      email: "sara@pizzapalace.test",
      name: "Sara Karim",
      role: "staff",
      restaurantId: DEMO_RESTAURANT_ID,
    },
  },
];

/** Match typed login credentials to a demo account (email case-insensitive). */
export function matchDemoAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === normalized && account.password === password,
    ) ?? null
  );
}

/** Resolve a demo session token back to its full session (works in any mode). */
export function demoSessionForToken(token: string): Session | null {
  const account = DEMO_ACCOUNTS.find((a) => a.token === token);
  return account ? { user: account.user, token: account.token } : null;
}
