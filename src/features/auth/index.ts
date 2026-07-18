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

// Auth flow actions (client callers should import these from their own paths to
// avoid pulling server-only siblings — same rule as RoleSwitcher below).
export { login } from "@/features/auth/application/login";
export { logout } from "@/features/auth/application/logout";
export { registerOwner } from "@/features/auth/application/registerOwner";
export { createUser } from "@/features/auth/application/createUser";

// UI (Client Components — client callers must import these from their own paths
// directly, NOT via server-only siblings on this barrel).
export { RoleSwitcher } from "@/features/auth/ui/RoleSwitcher";
export { LoginForm } from "@/features/auth/ui/LoginForm";
export { OnboardingWizard } from "@/features/auth/ui/OnboardingWizard";
export { LogoutButton } from "@/features/auth/ui/LogoutButton";
