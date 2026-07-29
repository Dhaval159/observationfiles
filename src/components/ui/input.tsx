"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputVariant = "default" | "outline" | "filled";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const variantClasses: Record<InputVariant, string> = {
  default: "border-border bg-surface focus:border-focus-ring/50",
  outline: "border-border bg-transparent focus:border-focus-ring/50",
  filled: "border-transparent bg-surface-alt focus:bg-surface",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "default", label, error, icon, className, id, ...props },
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
      <div className="relative">
        {icon && (
          <span className="text-muted absolute top-1/2 left-3 -translate-y-1/2">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "text-foreground placeholder:text-muted flex h-9 w-full rounded-lg border px-3 py-2 text-sm",
            "transition-colors duration-150",
            "focus-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-danger focus:border-danger",
            variantClasses[variant],
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-danger text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export { Input, type InputProps, type InputVariant };
