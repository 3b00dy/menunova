import Link from "next/link";
import { Button } from "@/shared/ui";

/**
 * Not-found for routes under a locale. Renders WITHOUT <html>/<body> because the
 * `[locale]` layout already provides them — the root `not-found.tsx` (which does
 * render its own shell) is only for locale-less paths. Nesting two <html> tags
 * would cause a hydration mismatch.
 */
export default function LocaleNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold text-[rgb(var(--color-text))]">
        Page not found
      </h1>
      <p className="text-sm text-[rgb(var(--color-muted))]">
        The page you’re looking for doesn’t exist.
      </p>
      <Link href="/">
        <Button variant="outline">Go home</Button>
      </Link>
    </div>
  );
}
