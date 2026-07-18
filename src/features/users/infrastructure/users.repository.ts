import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { UsersRepository } from "@/features/users/domain/users.ports";
import { InMemoryUsersRepository } from "@/features/users/infrastructure/users.mock.repository";
import { HttpUsersRepository } from "@/features/users/infrastructure/users.http.repository";

/**
 * Composition edge: route the users repository per request (see
 * `requestRoutedRepository`). Demo sessions and mock mode use the seeded
 * in-memory directory; live sessions talk to the backend users endpoints (still
 * missing — see docs/missed-endpoints.md, so live falls back to an empty list).
 */
export const usersRepository: UsersRepository = requestRoutedRepository(
  new InMemoryUsersRepository(),
  new HttpUsersRepository(),
);
