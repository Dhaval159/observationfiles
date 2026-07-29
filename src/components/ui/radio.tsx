"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className, id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label
      htmlFor={inputId}
      className={cn("group flex cursor-pointer items-center gap-2.5", className)}
    >
      <input ref={ref} id={inputId} type="radio" className="peer sr-only" {...props} />
      <span
        className={cn(
          "border-border bg-surface flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          "transition-colors duration-150",
          "group-hover:border-focus-ring/50",
          "peer-checked:border-foreground",
          "peer-focus-visible:outline-focus-ring peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        )}
      >
        <span className="bg-foreground h-2 w-2 scale-0 rounded-full transition-transform duration-150 peer-checked:scale-100" />
      </span>
      {label && <span className="text-foreground text-sm select-none">{label}</span>}
    </label>
  );
});

export { Radio, type RadioProps };
