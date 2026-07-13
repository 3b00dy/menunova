/** Public API of the `auth` feature. Import only from here. */
export type { Role, AuthUser, Session } from "@/features/auth/domain/session.entity";
export { hasRole } from "@/features/auth/domain/session.entity";
export { getSession } from "@/features/auth/application/getSession";
export { requireRole } from "@/features/auth/application/requireRole";
