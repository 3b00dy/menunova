import { env } from "@/shared/config/env";
import { isDemoToken } from "@/shared/auth/getServerSession";
import { can, getSession } from "@/features/auth";

/**
 * Capability projection for the dashboard, resolved once from the current
 * session and shared by the layout (nav gating) and the overview page (quick
 * actions). Booleans only, so it crosses the RSC boundary into client nav.
 */
export interface DashboardCapabilities {
  /** View the menu; staff may toggle availability. (`menu:availability`) */
  menu: boolean;
  /** Full menu CRUD — categories & items. (`menu:manage`) */
  menuManage: boolean;
  /** Customize the public theme. (`theme:manage`) */
  theme: boolean;
  /** Restaurant settings & billing. (`settings:manage`) */
  settings: boolean;
  /** Manage staff. (`staff:manage`) */
  staff: boolean;
  /** Platform-wide: all restaurants. (`restaurants:manage`) */
  restaurants: boolean;
  /** Platform-wide: all user accounts. (`users:manage`) */
  users: boolean;
}

export interface DashboardAccess {
  /** Current role (e.g. "owner"), or null when unauthenticated. */
  role: string | null;
  /** The restaurant this user is scoped to (its slug), or null (super admin). */
  restaurantId: string | null;
  /** Show the dev role switcher (demo/mock mode only). */
  showRoleSwitcher: boolean;
  /** This is a public demo session (sandboxed data, no live backend). */
  isDemo: boolean;
  caps: DashboardCapabilities;
}

/** Resolve the current session's dashboard capabilities. */
export async function getDashboardAccess(): Promise<DashboardAccess> {
  const session = await getSession();
  const user = session?.user ?? null;
  const has = (perm: Parameters<typeof can>[1]) => !!user && can(user, perm);
  return {
    role: user?.role ?? null,
    restaurantId: user?.restaurantId ?? null,
    showRoleSwitcher: env.dataMode === "mock",
    isDemo: !!session && isDemoToken(session.token),
    caps: {
      menu: has("menu:availability"),
      menuManage: has("menu:manage"),
      theme: has("theme:manage"),
      settings: has("settings:manage"),
      staff: has("staff:manage"),
      restaurants: has("restaurants:manage"),
      users: has("users:manage"),
    },
  };
}
