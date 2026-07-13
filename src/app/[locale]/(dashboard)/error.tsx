"use client";

/** Error boundary scoped to the dashboard segment. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-black/60 dark:text-white/60">{error.message}</p>
      <button onClick={reset} className="text-sm underline">
        Try again
      </button>
    </div>
  );
}
