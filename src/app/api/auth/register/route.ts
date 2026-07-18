import { NextResponse } from "next/server";
import {
  signSession,
  ownerUserFrom,
} from "@/features/auth/infrastructure/session-token";

/**
 * `POST /api/auth/register` — self-serve owner signup.
 *
 * The deployed backend implements `/auth/login` and `/auth/me` but not
 * `/auth/register`, so the Next BFF owns this endpoint. It mints a signed
 * session for the new owner (see `session-token.ts`) and returns the same
 * `{ token, user }` shape as `/auth/login`. The caller (the onboarding wizard's
 * `registerOwner` action) provisions the restaurant itself via the existing
 * `POST /restaurants` — this endpoint is only responsible for the account/session.
 *
 * Note: with no user store here, the password is accepted but not persisted and
 * email uniqueness isn't enforced (the wizard already guards slug uniqueness).
 * When the backend ships a real `/auth/register`, point the auth repository at
 * it and delete this route.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const name = typeof b.name === "string" ? b.name.trim() : undefined;
  const restaurantId =
    typeof b.restaurant_id === "string"
      ? b.restaurant_id
      : typeof b.restaurantId === "string"
        ? b.restaurantId
        : undefined;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = ownerUserFrom({ email, name, restaurantId });
  const token = signSession(user, Date.now());

  return NextResponse.json(
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
        restaurant_id: user.restaurantId ?? null,
      },
    },
    { status: 201 },
  );
}
