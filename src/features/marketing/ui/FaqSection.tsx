import type { FaqContent } from "@/features/marketing/domain/landing";

/** Accordion FAQ using native <details>. Server-rendered (no JS needed). */
export function FaqSection({ content }: { content: FaqContent }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-accent))]">
            {content.label}
          </span>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
        </div>
        <div className="mt-10 space-y-3">
          {content.items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[rgb(var(--color-bg))] transition-transform group-open:rotate-45">
                  <span className="text-lg leading-none">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--color-muted))]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
