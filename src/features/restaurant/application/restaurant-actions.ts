"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/features/auth";
import type {
  Restaurant,
  RestaurantDraft,
  RestaurantPatch,
} from "@/features/restaurant/domain/restaurant.entity";
import { restaurantRepository } from "@/features/restaurant/infrastructure/restaurant.repository";

/**
 * Restaurant (tenant) mutations, exposed as Server Actions. Each re-checks
 * super-admin authorization in the app layer — Server Actions are independently
 * reachable endpoints and must not trust path gating. `locale` is used to
 * revalidate the list after the change.
 */

async function revalidate(locale: string): Promise<void> {
  revalidatePath(`/${locale}/dashboard/restaurants`);
}

export async function createRestaurant(input: {
  locale: string;
  draft: RestaurantDraft;
}): Promise<Restaurant> {
  const session = await requireRole("super_admin");
  const created = await restaurantRepository.create(input.draft, session.token);
  await revalidate(input.locale);
  return created;
}

export async function updateRestaurant(input: {
  locale: string;
  id: string;
  patch: RestaurantPatch;
}): Promise<Restaurant> {
  const session = await requireRole("super_admin");
  const updated = await restaurantRepository.update(input.id, input.patch, session.token);
  await revalidate(input.locale);
  return updated;
}

export async function deleteRestaurant(input: {
  locale: string;
  id: string;
}): Promise<void> {
  const session = await requireRole("super_admin");
  await restaurantRepository.delete(input.id, session.token);
  await revalidate(input.locale);
}
