"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Globe,
  Palette,
  QrCode,
  Shield,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { FeaturesContent } from "@/features/marketing/domain/landing";

/** Icons paired with feature items by index (data stays icon-agnostic). */
const FEATURE_ICONS: LucideIcon[] = [Palette, QrCode, Globe, Zap, BarChart3, Shield];

/** Feature grid with scroll-in animation. Client Component (uses `motion`). */
export function FeaturesSection({ content }: { content: FeaturesContent }) {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
            {content.label}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            {content.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map((feature, i) => {
            const Icon = FEATURE_ICONS[i] ?? Sparkles;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--color-muted))]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
