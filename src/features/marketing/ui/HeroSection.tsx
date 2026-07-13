"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, QrCode, Sparkles } from "lucide-react";
import type { Locale } from "@/shared/i18n/config";
import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import type { HeroContent } from "@/features/marketing/domain/landing";

/** Animated hero. Client Component (uses `motion`). */
export function HeroSection({ content, locale }: { content: HeroContent; locale: Locale }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-accent))]/10 px-3 py-1 text-xs font-medium text-[rgb(var(--color-accent))]">
            <Sparkles className="h-3 w-3" /> {content.badge}
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[rgb(var(--color-muted))] sm:text-lg">
            {content.subtitle}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={routes.register(locale)}>
              <Button size="lg" block>
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={routes.publicMenu(locale, content.demoSlug)}>
              <Button size="lg" variant="outline" block>
                {content.ctaSecondary}
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[rgb(var(--color-muted))]">
            {content.trust.map((item) => (
              <span key={item} className="inline-flex items-center gap-1">
                <Check className="h-3 w-3" /> {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2.5rem] border-8 border-[rgb(var(--color-text))]/95 shadow-2xl sm:aspect-[5/6]">
            {/* eslint-disable-next-line @next/next/no-img-element -- external mock asset */}
            <img
              src={content.preview.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="text-xs uppercase tracking-wider opacity-80">
                {content.preview.tonightLabel}
              </span>
              <h3 className="text-3xl font-semibold leading-tight">
                {content.preview.restaurantName}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {content.preview.items.map((it) => (
                  <div key={it.name} className="rounded-lg bg-white/10 p-2.5 backdrop-blur">
                    <div className="text-xs font-medium">{it.name}</div>
                    <div className="text-xs opacity-80">{it.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <FloatingCard
            className="-left-4 top-12 sm:-left-12"
            iconWrap="bg-emerald-100 text-emerald-700"
            icon={<QrCode className="h-5 w-5" />}
            label={content.floatingScans.label}
            sub={content.floatingScans.sub}
          />
          <FloatingCard
            className="-right-2 bottom-10 sm:-right-10"
            iconWrap="bg-amber-100 text-amber-700"
            icon={<Sparkles className="h-5 w-5" />}
            label={content.floatingTheme.label}
            sub={content.floatingTheme.sub}
          />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCard({
  className,
  iconWrap,
  icon,
  label,
  sub,
}: {
  className: string;
  iconWrap: string;
  icon: ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={`absolute hidden items-center gap-3 rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 shadow-lg sm:flex ${className}`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${iconWrap}`}>{icon}</div>
      <div className="text-sm">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-[rgb(var(--color-muted))]">{sub}</div>
      </div>
    </motion.div>
  );
}
