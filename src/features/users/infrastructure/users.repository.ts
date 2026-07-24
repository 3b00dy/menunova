import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { UsersRepository } from "@/features/users/domain/users.ports";
import { InMemoryUsersRepository } from "@/features/users/infrastructure/users.mock.repository";
import { HttpUsersRepository } from "@/features/users/infrastructure/users.http.repository";

/**
 * Composition edge: route the users repository per request (see
 * `requestRoutedRepository`). Demo sessions and mock mode use the seeded
 * in-memory directory; live sessions talk to the backend users endpoints
 * (`GET|POST /users`, `PATCH|DELETE /users/{id}`) — live and verified.
 */
export const usersRepository: UsersRepository = requestRoutedRepository(
  new InMemoryUsersRepository(),
  new HttpUsersRepository(),
);
