import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/shared/ui/styles/globals.css";

import { locales, isLocale, dir, type Locale } from "@/shared/i18n/config";
import { getDictionary } from "@/shared/i18n/getDictionary";
import { AppProviders } from "@/shared/providers/AppProviders";

export const metadata: Metadata = {
  title: "MenuNova",
  description: "Beautiful digital menus for every restaurant",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

/** Pre-render one static path per supported locale. */
export function generateStaticParams(): Array<{ locale: string }> {
  return locales.map((locale) => ({ locale }));
}

/**
 * Effective ROOT layout for the app (there is no `src/app/layout.tsx`). Because
 * text direction depends on the locale, `<html>`/`<body>` live here where the
 * locale is known — the standard App Router i18n pattern. `params` is async in
 * Next.js 16 and must be awaited.
 *
 * Fonts are loaded via the Google Fonts `@import` in globals.css and consumed
 * through the `--font-body` token, so ThemeProvider can swap them per tenant at
 * runtime (no build-time `next/font`).
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: Locale };
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} dir={dir(locale)} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
