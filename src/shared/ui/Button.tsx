import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-fg))] hover:opacity-90 active:opacity-80',
  secondary:
    'bg-[rgb(var(--color-secondary))] text-[rgb(var(--color-primary))] hover:opacity-90',
  ghost:
    'bg-transparent text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-surface))]',
  outline:
    'bg-transparent text-[rgb(var(--color-text))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface))]',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', block, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-opacity',
        'rounded-[var(--radius-active)] shadow-[var(--shadow-active)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-bg))]',
        variantClasses[variant],
        sizeClasses[size],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
})
