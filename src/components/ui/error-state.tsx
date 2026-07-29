import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  retry?: () => void;
  icon?: ReactNode;
  className?: string;
}

function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  retry,
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "border-danger/20 bg-danger-subtle/50 flex flex-col items-center justify-center rounded-xl border px-6 py-12 text-center",
        className,
      )}
    >
      {icon ?? (
        <div className="bg-danger-subtle text-danger mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <svg
            width="22"
            height="22"
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
        </div>
      )}
      <h3 className="text-foreground text-sm font-medium">{title}</h3>
      <p className="text-muted mt-1 max-w-sm text-sm">{message}</p>
      {error && process.env.NODE_ENV !== "production" && (
        <pre className="bg-surface text-muted mt-3 max-w-md overflow-auto rounded-lg p-3 text-left text-xs">
          {error.message}
        </pre>
      )}
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="bg-foreground text-background mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export { ErrorState, type ErrorStateProps };
