import type { HowContent } from "@/features/marketing/domain/landing";

/** Numbered "how it works" steps. Static, server-rendered. */
export function HowItWorksSection({ content }: { content: HowContent }) {
  return (
    <section id="how" className="bg-[rgb(var(--color-surface))] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
            {content.label}
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
            {content.title}
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {content.items.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] p-6"
            >
              <div className="text-5xl font-semibold text-[rgb(var(--color-accent))] opacity-30">
                0{i + 1}
              </div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-[rgb(var(--color-muted))]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
