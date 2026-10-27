import { headers } from "next/headers";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { Download, ExternalLink, QrCode } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { env } from "@/shared/config/env";
import { routes } from "@/shared/config/routes";
import { Card, CardBody, EmptyState, PageHeader } from "@/shared/ui";
import { getRestaurantBySlug } from "@/features/restaurant";
import { RestaurantScopePicker } from "@/app/[locale]/(dashboard)/_components/RestaurantScopePicker";
import { resolveSettingsScope } from "@/app/[locale]/(dashboard)/_lib/scope";

/** Public origin for printed codes: `NEXT_PUBLIC_SITE_URL`, else this request's host. */
async function publicOrigin(): Promise<string> {
  if (env.siteUrl) return env.siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const LINK_BUTTON =
  "inline-flex h-10 items-center gap-2 rounded-[var(--radius-active)] px-4 text-sm font-medium transition-colors";

/**
 * Menu QR code (BRD BR-QR-01). The code encodes the locale-free `/r/{slug}`
 * link, so the proxy opens the menu in each guest's own language and printed
 * codes never go stale. Downloads: PNG (1024px, print-ready) and SVG (scalable).
 * Owners see their own restaurant; a super admin picks one.
 */
export default async function QrCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  const [sp, t] = await Promise.all([searchParams, getDictionary(locale)]);
  const scope = await resolveSettingsScope(sp.restaurant);
  if (!scope.allowed) redirect(routes.dashboard(locale));

  const q = t.dashboard.qr;
  if (!scope.slug) {
    return (
      <EmptyState
        title={t.dashboard.menuAdmin.noRestaurants}
        description={t.dashboard.menuAdmin.noRestaurantsHint}
      />
    );
  }

  const slug = scope.slug;
  const [restaurant, origin] = await Promise.all([getRestaurantBySlug(slug), publicOrigin()]);
  const menuUrl = `${origin}/r/${encodeURIComponent(slug)}`;
  const options = { margin: 2, errorCorrectionLevel: "M" as const };
  const [svg, png] = await Promise.all([
    QRCode.toString(menuUrl, { ...options, type: "svg" }),
    QRCode.toDataURL(menuUrl, { ...options, width: 1024 }),
  ]);
  const svgHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const fileBase = `${slug}-menu-qr`;

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title={q.title} description={q.subtitle} />
      {scope.isSuperAdmin && (
        <RestaurantScopePicker
          restaurants={scope.restaurants.map((r) => ({ slug: r.slug, name: r.name }))}
          selected={slug}
          scope="qr"
          label={t.dashboard.menuAdmin.restaurant}
        />
      )}

      <Card>
        <CardBody className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            <img
              src={svgHref}
              alt={`${q.title}: ${restaurant?.name ?? slug}`}
              className="h-56 w-56 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-white p-2"
            />
            <span className="text-sm font-semibold text-[rgb(var(--color-text))]">
              {restaurant?.name ?? slug}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{q.link}</span>
              <code
                dir="ltr"
                className="break-all rounded-[var(--radius-active)] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm text-[rgb(var(--color-text))]"
              >
                {menuUrl}
              </code>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={png}
                download={`${fileBase}.png`}
                className={`${LINK_BUTTON} bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))] hover:opacity-90`}
              >
                <Download className="h-4 w-4" />
                {q.downloadPng}
              </a>
              <a
                href={svgHref}
                download={`${fileBase}.svg`}
                className={`${LINK_BUTTON} border border-[rgb(var(--color-border))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]`}
              >
                <QrCode className="h-4 w-4" />
                {q.downloadSvg}
              </a>
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK_BUTTON} text-[rgb(var(--color-primary))] hover:underline`}
              >
                <ExternalLink className="h-4 w-4" />
                {q.openMenu}
              </a>
            </div>

            <p className="text-sm text-[rgb(var(--color-muted))]">{q.hint}</p>
            <p className="text-xs text-[rgb(var(--color-muted))]">{q.printTip}</p>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
