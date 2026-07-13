import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] grid place-items-center text-[rgb(var(--color-muted))]">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[rgb(var(--color-text))]">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[rgb(var(--color-muted))]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
