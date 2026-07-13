import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/shared/i18n/config";
// TEMP: dashboard auth gating disabled below — restore this import with it.
// import { SESSION_COOKIE } from "@/shared/auth/getServerSession";

/**
 * Proxy (Next.js 16's renamed middleware; runs on the Node.js runtime).
 *
 * Responsibilities:
 *  1. i18n — ensure every path is locale-prefixed; redirect if missing.
 *  2. Auth gating — bounce unauthenticated users away from the dashboard.
 *     (Server Actions bypass this, so authorization is ALSO enforced in the
 *     application layer — see `@/features/auth`.)
 */

const LOCALE_COOKIE = "mn_locale";

function resolveLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header.split(",")[0]?.split("-")[0]?.trim();
  if (preferred && isLocale(preferred)) return preferred;

  return defaultLocale;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Locale prefix enforcement.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const locale = resolveLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/" });
    return response;
  }

  // 2. Dashboard auth gating (coarse; defense-in-depth is in the app layer).
  // TEMPORARILY DISABLED for local exploration — restore before shipping.
  // const segments = pathname.split("/");
  // const isDashboard = segments[2] === "dashboard";
  // if (isDashboard && !request.cookies.get(SESSION_COOKIE)) {
  //   const locale = segments[1] || defaultLocale;
  //   const url = request.nextUrl.clone();
  //   url.pathname = `/${locale}/login`;
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
