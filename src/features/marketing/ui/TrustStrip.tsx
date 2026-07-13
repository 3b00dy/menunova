import type { TrustContent } from "@/features/marketing/domain/landing";

/** Logo/brand strip beneath the hero. Static, server-rendered. */
export function TrustStrip({ content }: { content: TrustContent }) {
  return (
    <div className="border-y border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-6 py-5 text-xs uppercase tracking-wider text-[rgb(var(--color-muted))]">
        <span>{content.label}</span>
        {content.brands.map((brand) => (
          <span key={brand} className="font-medium">
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
