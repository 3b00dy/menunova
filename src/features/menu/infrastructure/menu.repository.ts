import { requestRoutedRepository } from "@/shared/data/request-routed-repository";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";
import { HttpMenuRepository } from "@/features/menu/infrastructure/menu.http.repository";
import { InMemoryMenuRepository } from "@/features/menu/infrastructure/menu.mock.repository";

/**
 * The default menu repository. Routes per request (see
 * `requestRoutedRepository`): demo sessions and mock mode read the in-memory
 * store, live sessions hit the real API. Application use-cases import this; they
 * never pick a concrete class themselves.
 */
export const menuRepository: MenuRepository =
  requestRoutedRepository(new InMemoryMenuRepository(), new HttpMenuRepository());
