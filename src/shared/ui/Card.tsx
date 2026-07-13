import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]',
        'rounded-[var(--radius-active)] shadow-[var(--shadow-active)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-[rgb(var(--color-border))]',
        className,
      )}
      {...props}
    />
  )
}
