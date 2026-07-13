import { env } from "@/shared/config/env";
import type { MenuRepository } from "@/features/menu/domain/menu.ports";
import { HttpMenuRepository } from "@/features/menu/infrastructure/menu.http.repository";
import { InMemoryMenuRepository } from "@/features/menu/infrastructure/menu.mock.repository";

/**
 * The default menu repository, selected by `env.dataMode`:
 *  - `"mock"` (default) — in-memory store; the app works with no backend.
 *  - `"live"` — HTTP calls to the real API.
 * Application use-cases import this; they never pick a concrete class themselves.
 */
export const menuRepository: MenuRepository =
  env.dataMode === "live" ? new HttpMenuRepository() : new InMemoryMenuRepository();
