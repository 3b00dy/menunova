import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { Button, BrandBadge, BrandWordmark, LanguagePicker } from "@/shared/ui";
import type { NavContent } from "@/features/marketing/domain/landing";

/** Sticky landing header. Server-rendered; `LanguagePicker` is a client island. */
export function LandingNav({ content, locale }: { content: NavContent; locale: Locale }) {
  const anchors = [
    { href: "#features", label: content.features },
    { href: "#how", label: content.howItWorks },
    { href: "#themes", label: content.themes },
    { href: "#pricing", label: content.pricing },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={routes.home(locale)} className="flex items-center gap-2">
          <BrandBadge size="md" />
          <BrandWordmark className="text-lg" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {anchors.map((a) => (
            <a key={a.href} href={a.href} className="hover:opacity-70">
              {a.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguagePicker className="hidden sm:inline-flex" />
          <Link
            href={routes.login(locale)}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium hover:bg-[rgb(var(--color-surface))] sm:inline-flex"
          >
            {content.signIn}
          </Link>
          <Link href={routes.register(locale)}>
            <Button>
              {content.getStarted}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
