'use client'

import type { ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { toErrorMessage } from '@/shared/http/toErrorMessage'
import { Button } from './Button'
import { Spinner } from './Spinner'

/** Centered loading indicator for first-load states. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[rgb(var(--color-muted))]">
      <Spinner className="h-6 w-6" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

/** Error panel with a retry affordance. */
export function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  retryLabel = 'Try again',
}: {
  error: unknown
  title?: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-full bg-red-50 border border-red-200 grid place-items-center text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[rgb(var(--color-text))]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[rgb(var(--color-muted))]">{toErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" /> {retryLabel}
        </Button>
      )}
    </div>
  )
}

interface QueryLike<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch?: () => void
}

/**
 * Renders the right UI for a query's lifecycle: spinner while first-loading,
 * an error panel (with retry) on failure, otherwise the data. Keeps the
 * loading/error/success branching out of every page.
 */
export function QueryBoundary<T>({
  query,
  children,
  loadingLabel,
  errorTitle,
}: {
  query: QueryLike<T>
  children: (data: T) => ReactNode
  loadingLabel?: string
  errorTitle?: string
}) {
  if (query.isLoading) return <LoadingState label={loadingLabel} />
  if (query.isError) {
    return <ErrorState error={query.error} title={errorTitle} onRetry={query.refetch} />
  }
  if (query.data === undefined) return <LoadingState label={loadingLabel} />
  return <>{children(query.data)}</>
}
