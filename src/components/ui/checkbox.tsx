"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={inputId}
      className={cn("group flex cursor-pointer items-center gap-2.5", className)}
    >
      <input ref={ref} id={inputId} type="checkbox" className="peer sr-only" {...props} />
      <span
        className={cn(
          "border-border bg-surface flex h-4 w-4 shrink-0 items-center justify-center rounded border",
          "transition-colors duration-150",
          "group-hover:border-focus-ring/50",
          "peer-checked:bg-foreground peer-checked:border-foreground peer-checked:text-background",
          "peer-focus-visible:outline-focus-ring peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        )}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-0 transition-opacity peer-checked:opacity-100"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {label && <span className="text-foreground text-sm select-none">{label}</span>}
    </label>
  );
});

export { Checkbox, type CheckboxProps };
