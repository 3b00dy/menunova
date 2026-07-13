import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'
const base =
  'w-full bg-[rgb(var(--color-bg))] border border-[rgb(var(--color-border))] rounded-[var(--radius-active)] px-3 py-2 text-sm text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(base, 'h-10', className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, 'min-h-[88px]', className)} {...props} />
})

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-xs font-medium text-[rgb(var(--color-muted))]', className)}
    >
      {children}
    </label>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-[rgb(var(--color-muted))]">{hint}</p>}
    </div>
  )
}
