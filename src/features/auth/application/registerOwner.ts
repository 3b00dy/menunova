"use server";

import { redirect } from "next/navigation";
import { setServerSession } from "@/shared/auth/getServerSession";
import { routes } from "@/shared/config/routes";
import type { Locale } from "@/shared/i18n/config";
import {
  getRestaurantBySlug,
  provisionRestaurantBranding,
  provisionRestaurantLanguages,
  type RestaurantPlan,
} from "@/features/restaurant";
import { provisionFirstMenu } from "@/features/menu";
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
 * Self-serve onboarding. `authRepository.register` creates the owner account AND
 * their restaurant (live: one `POST /auth/register` call → a real, persistent
 * account the owner can log back into). Then, with the owner's own token, it
 * applies the wizard's extras — branding, language settings, optional first
 * dish — logs them in and redirects to their dashboard.
 *
 * Returns an error code on failure (the wizard maps it to a localized message
 * and jumps back to the relevant step); on success it redirects and never
 * returns. Extras are best-effort: once the account exists, a failed extra must
 * not fail signup — the owner finishes it from the dashboard checklist.
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
  /** Optional first category (+ item) from the wizard's menu step. */
  firstMenu?: {
    categoryName: string;
    item?: { name: string; priceMinor: number; currency: string };
  };
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

  // Fast, friendly check (the backend also rejects a taken slug with 409).
  if (await getRestaurantBySlug(slug)) {
    return { error: "slug_taken" };
  }

  let session: Session;
  try {
    session = await authRepository.register({
      email,
      password: input.password,
      name,
      restaurant: { name: restaurantName, slug, plan: input.restaurant.plan },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "generic" };
  }

  const token = session.token;
  await provisionRestaurantBranding(
    slug,
    {
      logoUrl: input.restaurant.logoUrl?.trim() || undefined,
      brandColor: input.restaurant.brandColor?.trim() || undefined,
    },
    token,
  ).catch((e) => console.error("Signup: branding failed", e));

  await provisionRestaurantLanguages(slug, { defaultLanguage, supportedLanguages }, token).catch((e) =>
    console.error("Signup: language settings failed", e),
  );

  const categoryName = input.firstMenu?.categoryName.trim();
  if (categoryName) {
    const item = input.firstMenu?.item;
    await provisionFirstMenu(
      slug,
      {
        language: defaultLanguage,
        categoryName,
        item: item?.name.trim() && item.priceMinor >= 0 ? { ...item, name: item.name.trim() } : undefined,
      },
      token,
    ).catch((e) => console.error("Signup: first menu failed", e));
  }

  await setServerSession(token);
  redirect(routes.dashboard(input.locale));
}
