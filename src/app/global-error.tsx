"use client";

/**
 * Top-level error boundary. It replaces the root layout when it renders, so it
 * must provide its own <html>/<body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-black/60">{error.message}</p>
        <button onClick={reset} className="underline text-sm">
          Try again
        </button>
      </body>
    </html>
  );
}
