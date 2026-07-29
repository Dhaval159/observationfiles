"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <span className="bg-danger-subtle text-danger mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <h1 className="text-foreground mb-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted mb-6 text-sm">An unexpected error occurred. Please try again.</p>
        {process.env.NODE_ENV !== "production" && (
          <div className="bg-surface mb-6 rounded-lg p-4 text-left">
            <p className="text-muted font-mono text-xs break-all">{error.message}</p>
            {error.digest && (
              <p className="text-muted mt-2 font-mono text-xs">Digest: {error.digest}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
