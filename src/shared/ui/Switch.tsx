'use client'

import { cn } from '@/shared/utils/cn'
interface Props {
  checked: boolean
  onChange: (next: boolean) => void
  label?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, label, disabled }: Props) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked
            ? 'bg-[rgb(var(--color-primary))]'
            : 'bg-[rgb(var(--color-border))]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5 rtl:-translate-x-5 left-0.5' : 'left-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-[rgb(var(--color-text))]">{label}</span>}
    </label>
  )
}
