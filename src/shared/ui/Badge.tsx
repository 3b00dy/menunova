import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'
type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

const toneMap: Record<Tone, string> = {
  neutral:
    'bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text))] border-[rgb(var(--color-border))]',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  accent:
    'bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))]/30',
}

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ className, tone = 'neutral', ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneMap[tone],
        className,
      )}
      {...props}
    />
  )
}
