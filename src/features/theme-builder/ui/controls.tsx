"use client";

import type { ReactNode } from "react";
import { Card } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

/** Titled section wrapper for the settings panel. */
export function SectionCard({
  title,
  hint,
  children,
}: {
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[rgb(var(--color-text))]">{title}</h3>
        {hint ? (
          <p className="mt-0.5 text-xs text-[rgb(var(--color-muted))]">{hint}</p>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

/** Segmented control — the app's replacement for a range slider / radio group. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-1 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-[calc(var(--radius-active)-2px)] px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))]"
                : "text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Native color swatch + editable HEX input, kept in sync. */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-[rgb(var(--color-muted))]">{label}</span>
      <span className="inline-flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="h-9 w-24 rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-2 font-mono text-xs uppercase text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
        />
        <span
          className="relative h-9 w-9 overflow-hidden rounded-[var(--radius-active)] border border-[rgb(var(--color-border))]"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </span>
      </span>
    </label>
  );
}
