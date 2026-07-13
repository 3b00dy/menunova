import Link from "next/link";
import { defaultLocale } from "@/shared/i18n/config";

/**
 * Root not-found for paths outside any locale. Since the locale layout owns
 * <html>/<body>, this top-level page provides its own.
 */
export default function NotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link href={`/${defaultLocale}`} className="underline text-sm">
          Go home
        </Link>
      </body>
    </html>
  );
}
