import type {
  User,
  UserDraft,
  UserPatch,
} from "@/features/users/domain/user.entity";
import type { UsersRepository } from "@/features/users/domain/users.ports";

/**
 * In-memory {@link UsersRepository} for demo & local development.
 *
 * Seeded with a realistic cross-section of the platform's users — a super admin,
 * restaurant owners and staff across several tenants, and a couple of customers
 * — so the super-admin Users page has something to manage. State lives in a
 * module-level array; CRUD changes persist across requests within a running
 * server process (they reset on restart — fine for a demo). Swap for the HTTP
 * repository once the backend exposes the users endpoints (see
 * docs/missed-endpoints.md).
 */

const USERS: User[] = [
  { id: "u_super", email: "admin@menunova.app", name: "Platform Admin", role: "super_admin", status: "active", createdAt: "2025-08-01", lastActiveAt: "2026-07-18T09:12:00Z" },
  { id: "s_owner", email: "owner@pizzapalace.test", name: "Layla Hassan", role: "owner", restaurantId: "r_demo", status: "active", createdAt: "2025-11-02", lastActiveAt: "2026-07-17T20:40:00Z" },
  { id: "s_sara", email: "sara@pizzapalace.test", name: "Sara Karim", role: "staff", restaurantId: "r_demo", status: "active", createdAt: "2025-11-05", lastActiveAt: "2026-07-16T14:05:00Z" },
  { id: "s_omar", email: "omar@pizzapalace.test", name: "Omar Ali", role: "staff", restaurantId: "r_demo", status: "invited", createdAt: "2026-01-20" },
  { id: "u_sakura", email: "hello@sakura.test", name: "Kenji Sato", role: "owner", restaurantId: "r_sushi", status: "active", createdAt: "2025-09-18", lastActiveAt: "2026-07-15T11:30:00Z" },
  { id: "u_smash", email: "team@smashhouse.test", name: "Marco Diaz", role: "owner", restaurantId: "r_burger", status: "active", createdAt: "2026-06-27" },
  { id: "u_amwaj", email: "manager@amwaj.test", name: "Nour Fahmy", role: "owner", restaurantId: "r_cafe", status: "suspended", createdAt: "2025-12-11" },
  { id: "u_najd", email: "info@najdgrill.test", name: "Faisal Otaibi", role: "owner", restaurantId: "r_grill", status: "active", createdAt: "2026-02-04", lastActiveAt: "2026-07-10T08:00:00Z" },
  { id: "u_najd_staff", email: "huda@najdgrill.test", name: "Huda Zahrani", role: "staff", restaurantId: "r_grill", status: "active", createdAt: "2026-03-01" },
  { id: "u_cust1", email: "diner1@example.com", name: "Ahmad Yusuf", role: "customer", status: "active", createdAt: "2026-05-14", lastActiveAt: "2026-07-18T19:22:00Z" },
  { id: "u_cust2", email: "diner2@example.com", name: "Mona Saleh", role: "customer", status: "active", createdAt: "2026-06-30" },
];

// Monotonic id generator — avoids Math.random/Date so ids are stable per run.
let seq = 0;
const nextId = () => `u_new_${(seq += 1).toString(36)}`;
/** Fixed "created today" stamp for new mock users (stable SSR, no `Date`). */
const CREATED_TODAY = "2026-07-18";

const clone = (u: User): User => ({ ...u });

/** Number of active-or-any super admins (guard against removing the last one). */
function superAdminCount(): number {
  return USERS.filter((u) => u.role === "super_admin").length;
}

export class InMemoryUsersRepository implements UsersRepository {
  async list(): Promise<User[]> {
    return USERS.map(clone);
  }

  async create(draft: UserDraft): Promise<User> {
    const email = draft.email.trim().toLowerCase();
    if (USERS.some((u) => u.email.toLowerCase() === email)) {
      throw new Error(`A user with email "${draft.email}" already exists.`);
    }
    const restaurantId =
      draft.role === "owner" || draft.role === "staff" ? draft.restaurantId : undefined;
    const user: User = {
      id: nextId(),
      email: draft.email.trim(),
      name: draft.name.trim(),
      role: draft.role,
      restaurantId,
      status: draft.status ?? "active",
      createdAt: CREATED_TODAY,
    };
    USERS.push(user);
    return clone(user);
  }

  async update(id: string, patch: UserPatch): Promise<User> {
    const user = USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User not found: ${id}`);
    // Guard: never demote the last super admin — the platform must keep one.
    if (patch.role && patch.role !== "super_admin" && user.role === "super_admin" && superAdminCount() <= 1) {
      throw new Error("The platform must keep at least one super admin.");
    }
    const nextRole = patch.role ?? user.role;
    const keepsRestaurant = nextRole === "owner" || nextRole === "staff";
    Object.assign(user, {
      name: patch.name?.trim() ?? user.name,
      role: nextRole,
      status: patch.status ?? user.status,
      restaurantId: keepsRestaurant
        ? patch.restaurantId ?? user.restaurantId
        : undefined,
    });
    return clone(user);
  }

  async remove(id: string): Promise<void> {
    const user = USERS.find((u) => u.id === id);
    if (!user) return;
    if (user.role === "super_admin" && superAdminCount() <= 1) {
      throw new Error("The platform must keep at least one super admin.");
    }
    const idx = USERS.findIndex((u) => u.id === id);
    if (idx !== -1) USERS.splice(idx, 1);
  }
}
