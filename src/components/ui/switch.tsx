"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={inputId}
      className={cn("group flex cursor-pointer items-center gap-3", className)}
    >
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "border-border bg-surface block h-5 w-9 rounded-full border transition-colors duration-150",
            "group-hover:border-focus-ring/50",
            "peer-checked:bg-foreground peer-checked:border-foreground",
            "peer-focus-visible:outline-focus-ring peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          )}
        />
        <span
          className={cn(
            "bg-muted absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-all duration-150",
            "peer-checked:bg-background peer-checked:translate-x-4",
          )}
        />
      </div>
      {label && <span className="text-foreground text-sm select-none">{label}</span>}
    </label>
  );
});

export { Switch, type SwitchProps };
