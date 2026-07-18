"use server";

import { redirect } from "next/navigation";
import { setServerSession } from "@/shared/auth/getServerSession";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";
import {
  getRestaurantBySlug,
  provisionRestaurant,
  provisionRestaurantLanguages,
  type RestaurantPlan,
} from "@/features/restaurant";
import type { Session } from "@/features/auth/domain/session.entity";
import { authRepository } from "@/features/auth/infrastructure/auth.repository";

/** Turn a restaurant name into a URL-safe slug (falls back for non-latin names). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Self-serve onboarding: create the owner account, provision their restaurant
 * (name, slug, plan, branding) AND its language settings, log them in, and drop
 * them into their own dashboard. Returns an error code on failure (the wizard
 * maps it to a localized message and jumps back to the relevant step); on
 * success it redirects and never returns.
 *
 * The owner's `restaurantId` is the restaurant's slug — this app scopes the
 * dashboard by slug (see the menu/staff pages).
 */
export async function registerOwner(input: {
  locale: Locale;
  name: string;
  email: string;
  password: string;
  restaurant: {
    name: string;
    slug: string;
    plan: RestaurantPlan;
    logoUrl?: string;
    brandColor?: string;
  };
  defaultLanguage: string;
  supportedLanguages: string[];
}): Promise<{ error: string } | void> {
  const name = input.name.trim();
  const email = input.email.trim();
  const restaurantName = input.restaurant.name.trim();
  const slug = slugify(input.restaurant.slug || restaurantName);
  const supportedLanguages = input.supportedLanguages.filter(Boolean);
  const defaultLanguage = input.defaultLanguage || supportedLanguages[0] || "en";

  if (!name || !email || !input.password || !restaurantName || !slug || supportedLanguages.length === 0) {
    return { error: "required" };
  }

  // Respect the owner's chosen slug — surface a conflict instead of mutating it.
  if (await getRestaurantBySlug(slug)) {
    return { error: "slug_taken" };
  }

  // Create the user first so a duplicate email fails BEFORE we provision a tenant.
  let session: Session;
  try {
    session = await authRepository.register({ email, password: input.password, name, restaurantId: slug });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "register_failed" };
  }

  await provisionRestaurant({
    name: restaurantName,
    slug,
    ownerEmail: email,
    plan: input.restaurant.plan,
    status: "trial",
    logoUrl: input.restaurant.logoUrl?.trim() || undefined,
    brandColor: input.restaurant.brandColor?.trim() || undefined,
  });

  // Persist the restaurant's language settings (the new owner's token authorizes
  // the live PUT; the mock ignores it).
  await provisionRestaurantLanguages(
    slug,
    { defaultLanguage, supportedLanguages },
    session.token,
  );

  await setServerSession(session.token);
  redirect(routes.dashboard(input.locale));
}
