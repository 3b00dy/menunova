/** Public API of the `auth` feature. Import only from here. */
export type { Role, AuthUser, Session } from "@/features/auth/domain/session.entity";
export { hasRole } from "@/features/auth/domain/session.entity";

// Capability-based authorization (the source of truth for "who can do what").
export type { Permission } from "@/features/auth/domain/permissions";
export { can, permissionsFor, ROLE_PERMISSIONS } from "@/features/auth/domain/permissions";

export { getSession, DEMO_ROLES } from "@/features/auth/application/getSession";
export { requireRole } from "@/features/auth/application/requireRole";
export { requirePermission } from "@/features/auth/application/requirePermission";
export { setDemoRole } from "@/features/auth/application/setDemoRole";

// UI (a Client Component — client callers must import it from this path
// directly, NOT via server-only siblings on this barrel).
export { RoleSwitcher } from "@/features/auth/ui/RoleSwitcher";
