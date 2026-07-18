/** Public API of the `users` feature. Import only from here. */
export type {
  User,
  UserRole,
  UserStatus,
  UserDraft,
  UserPatch,
} from "@/features/users/domain/user.entity";
export {
  USER_ROLES,
  USER_STATUSES,
  roleNeedsRestaurant,
  roleTone,
  userStatusTone,
} from "@/features/users/domain/user.entity";

export { listUsers } from "@/features/users/application/list-users";
export {
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
} from "@/features/users/application/user-actions";

export { UsersManager } from "@/features/users/ui/UsersManager";

// Intentionally NOT exported: repositories, ports, DTOs — private.
