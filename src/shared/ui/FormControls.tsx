'use client'

import { X } from 'lucide-react'
import { Input, Label } from './Input'
import { LANGUAGE_CODES, MAX_MENU_LANGUAGES, SUPPORTED_LANGUAGES } from '@/shared/i18n/languages'
import { cn } from '@/shared/utils/cn'
/**
 * Shared form controls used by the tenant settings/create forms so field
 * coverage and styling stay consistent with the backend input shapes.
 */

/**
 * Multi-select for `supportedLanguages` (string[]), rendered as toggle chips.
 * Offers every content language in the catalog; once `max` are selected the
 * unselected chips are disabled and `hint` is shown.
 */
export function SupportedLanguagesField({
  label,
  value,
  onChange,
  primary,
  max = MAX_MENU_LANGUAGES,
  hint,
}: {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  /** The primary language is always included and can't be removed. */
  primary?: string
  /** Maximum number of languages that can be selected. */
  max?: number
  /** Helper text, e.g. "Up to 3 languages". */
  hint?: string
}) {
  const selected = new Set(value)
  if (primary) selected.add(primary)
  const atMax = selected.size >= max
  const toggle = (code: string) => {
    if (code === primary) return
    const next = new Set(selected)
    if (next.has(code)) next.delete(code)
    else if (!atMax) next.add(code)
    else return
    onChange(Array.from(next))
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {LANGUAGE_CODES.map((code) => {
          const def = SUPPORTED_LANGUAGES[code]
          const on = selected.has(code)
          const disabled = !on && atMax
          return (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              aria-pressed={on}
              disabled={disabled}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                on
                  ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-text))]'
                  : 'border-[rgb(var(--color-border))] text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-surface))]',
                code === primary && 'opacity-60 cursor-default',
                disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {def?.name ?? code}
            </button>
          )
        })}
      </div>
      {hint && <p className="text-xs text-[rgb(var(--color-muted))]">{hint}</p>}
    </div>
  )
}

/**
 * Comma-separated text entry that maps to/from a `string[]` (for ingredients,
 * allergens, etc.). Empty entries are dropped.
 */
export function StringListField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string[] | undefined
  onChange: (next: string[]) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input
        value={(value ?? []).join(', ')}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
      />
      {hint && <p className="text-xs text-[rgb(var(--color-muted))]">{hint}</p>}
    </div>
  )
}

/** A theme-preset picker (`<select>`) fed by the bundled/server presets. */
export function ThemePresetSelect({
  label,
  value,
  onChange,
  options,
  allowNone,
}: {
  label: string
  value: string | undefined
  onChange: (id: string | undefined) => void
  options: { id: string; name: string }[]
  allowNone?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="h-10 w-full rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg))] px-3 text-sm"
      >
        {allowNone && <option value="">—</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Small remove button used by repeatable-row editors (variants/addons). */
export function RemoveRowButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="h-9 w-9 shrink-0 grid place-items-center rounded-[var(--radius-active)] border border-[rgb(var(--color-border))] text-[rgb(var(--color-muted))] hover:text-red-600 hover:border-red-300"
    >
      <X className="h-4 w-4" />
    </button>
  )
}
