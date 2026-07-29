"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-foreground text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          "border-border bg-surface text-foreground placeholder:text-muted flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm",
          "transition-colors duration-150",
          "focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger focus:border-danger",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export { Textarea, type TextareaProps };
