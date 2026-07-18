import type {
  StaffDraft,
  StaffMember,
  StaffPatch,
} from "@/features/staff/domain/staff.entity";
import type { StaffRepository } from "@/features/staff/domain/staff.ports";

/**
 * In-memory {@link StaffRepository} for demo & local development.
 *
 * State lives in a module-level map keyed by restaurant id, so CRUD changes
 * persist across requests within a running server process (they reset on
 * restart — fine for a demo). Swap for the HTTP repository once the backend
 * exposes the staff endpoints (see docs/backend-endpoints-missing.md).
 */

const STAFF: Record<string, StaffMember[]> = {
  demo: [
    { id: "s_owner", email: "owner@pizzapalace.test", name: "Layla Hassan", role: "owner", status: "active" },
    { id: "s_sara", email: "sara@pizzapalace.test", name: "Sara Karim", role: "staff", status: "active" },
    { id: "s_omar", email: "omar@pizzapalace.test", name: "Omar Ali", role: "staff", status: "active" },
  ],
};

// Monotonic id generator — avoids Math.random/Date so ids are stable per run.
let seq = 0;
const nextId = () => `s_${(seq += 1).toString(36)}`;

const clone = (m: StaffMember): StaffMember => ({ ...m });
const teamOf = (restaurantId: string): StaffMember[] => (STAFF[restaurantId] ??= []);

export class InMemoryStaffRepository implements StaffRepository {
  async list(restaurantId: string): Promise<StaffMember[]> {
    return teamOf(restaurantId).map(clone);
  }

  async create(restaurantId: string, draft: StaffDraft): Promise<StaffMember> {
    const team = teamOf(restaurantId);
    const email = draft.email.trim().toLowerCase();
    if (team.some((m) => m.email.toLowerCase() === email)) {
      throw new Error(`A staff member with email "${draft.email}" already exists.`);
    }
    // Created accounts are active immediately — the admin sets the password, so
    // there is no pending-invitation state. (The login itself is created in the
    // application layer via auth `createUser`.)
    const member: StaffMember = {
      id: nextId(),
      email: draft.email.trim(),
      name: draft.name.trim(),
      role: draft.role,
      status: "active",
    };
    team.push(member);
    return clone(member);
  }

  async update(id: string, patch: StaffPatch): Promise<StaffMember> {
    const member = find(id);
    if (!member) throw new Error(`Staff member not found: ${id}`);
    // Guard: never demote the last owner — a restaurant must keep an admin.
    if (patch.role && patch.role !== "owner" && member.role === "owner" && ownerCount(member) <= 1) {
      throw new Error("A restaurant must have at least one admin (owner).");
    }
    Object.assign(member, {
      role: patch.role ?? member.role,
      name: patch.name?.trim() ?? member.name,
    });
    return clone(member);
  }

  async remove(id: string): Promise<void> {
    const member = find(id);
    if (!member) return;
    if (member.role === "owner" && ownerCount(member) <= 1) {
      throw new Error("A restaurant must have at least one admin (owner).");
    }
    const team = teamContaining(id);
    if (team) {
      const idx = team.findIndex((m) => m.id === id);
      if (idx !== -1) team.splice(idx, 1);
    }
  }
}

// --- helpers (operate across all seeded teams) --------------------------------

function teamContaining(id: string): StaffMember[] | undefined {
  return Object.values(STAFF).find((team) => team.some((m) => m.id === id));
}

function find(id: string): StaffMember | undefined {
  return teamContaining(id)?.find((m) => m.id === id);
}

/** Number of owners in the same team as `member`. */
function ownerCount(member: StaffMember): number {
  const team = Object.values(STAFF).find((t) => t.includes(member)) ?? [];
  return team.filter((m) => m.role === "owner").length;
}
