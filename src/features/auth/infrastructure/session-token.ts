import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import type { AuthUser, Role } from "@/features/auth/domain/session.entity";

/**
 * Self-contained session tokens for the BFF `POST /api/auth/register` endpoint.
 *
 * The deployed backend implements `/auth/login` and `/auth/me` but **not**
 * `/auth/register` (self-serve signup). Until it ships, the Next BFF issues its
 * own signed session for freshly-registered owners. It's a minimal HS256 JWT
 * carrying the same claims the backend's login token does (`sub`, `email`,
 * `role`, `restaurant_id`), so the rest of the app treats it identically.
 *
 * Server-only (uses `node:crypto`). Backend-issued login JWTs are signed with a
 * different secret, so {@link verifySessionToken} rejects them and the caller
 * falls back to `GET /auth/me` — the two token sources never collide.
 */

const SECRET = process.env.AUTH_SECRET ?? "menunova-dev-secret-change-me";
/** Token lifetime: 30 days (the cookie outlives it; expiry is enforced here). */
const TTL_SECONDS = 60 * 60 * 24 * 30;

interface Claims {
  sub: string;
  email: string;
  name?: string;
  role: Role;
  restaurant_id?: string | null;
  iat: number;
  exp: number;
}

function b64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", SECRET).update(input).digest("base64url");
}

/** Deterministic user id from email, so re-registering yields a stable id. */
function userIdFor(email: string): string {
  return `u_${createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 12)}`;
}

/**
 * Mint a signed session token for a newly-registered owner. `issuedAt` is
 * passed in (route handlers have a real clock) to keep this function pure.
 */
export function signSession(user: AuthUser, issuedAt: number): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const iat = Math.floor(issuedAt / 1000);
  const claims: Claims = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurant_id: user.restaurantId ?? null,
    iat,
    exp: iat + TTL_SECONDS,
  };
  const payload = b64url(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  return `${signingInput}.${sign(signingInput)}`;
}

/**
 * Verify a BFF-issued token and return the user, or `null` if the signature is
 * wrong (e.g. it's a backend login JWT), it's malformed, or it has expired.
 * `now` is passed in by the caller so this stays a pure function.
 */
export function verifySessionToken(token: string, now: number): AuthUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;

  const expected = sign(`${header}.${payload}`);
  const got = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;

  let claims: Claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Claims;
  } catch {
    return null;
  }
  if (typeof claims.exp !== "number" || claims.exp * 1000 <= now) return null;

  return {
    id: claims.sub,
    email: claims.email,
    name: claims.name ?? undefined,
    role: claims.role,
    restaurantId: claims.restaurant_id ?? undefined,
  };
}

/** Build the owner {@link AuthUser} a registration produces (id derived from email). */
export function ownerUserFrom(input: {
  email: string;
  name?: string;
  restaurantId?: string;
}): AuthUser {
  return {
    id: userIdFor(input.email),
    email: input.email,
    name: input.name,
    role: "owner",
    restaurantId: input.restaurantId,
  };
}
