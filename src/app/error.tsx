"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-8xl">⚠️</div>
      <div>
        <h1 className="text-2xl font-bold">發生了一些問題</h1>
        <p className="mt-2 text-muted-foreground">Something went wrong. Please try again.</p>
        {process.env.NODE_ENV === "development" && error.message && (
          <p className="mt-3 rounded bg-muted px-3 py-1 text-xs text-destructive">{error.message}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={reset}
          type="button"
        >
          重試 / Retry
        </button>
        <Link
          className="rounded-md border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
          href="/"
        >
          回首頁 / Home
        </Link>
      </div>
    </div>
  );
}
