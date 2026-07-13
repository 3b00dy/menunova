import Link from "next/link";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import type { ThemesContent } from "@/features/marketing/domain/landing";

/** Grid of demo tenants linking to their live public menus. Server-rendered. */
export function ThemeShowcase({
  content,
  locale,
}: {
  content: ThemesContent;
  locale: Locale;
}) {
  return (
    <section id="themes" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
            {content.label}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-[rgb(var(--color-muted))]">{content.subtitle}</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.demos.map((demo) => (
            <Link
              key={demo.slug}
              href={routes.publicMenu(locale, demo.slug)}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-[rgb(var(--color-border))]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary))]/30 to-[rgb(var(--color-accent))]/30 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="font-semibold">{demo.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
