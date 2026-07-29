"use client";

import { forwardRef, useState, type InputHTMLAttributes, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value: externalValue, onChange, placeholder = "Search...", className, ...props },
  ref,
) {
  const [localValue, setLocalValue] = useState(externalValue ?? "");
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    setLocalValue(externalValue ?? "");
  }, [externalValue]);

  useEffect(() => {
    if (onChange && debouncedValue !== externalValue) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, externalValue]);

  return (
    <div className="relative">
      <span className="text-muted absolute top-1/2 left-3 -translate-y-1/2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        ref={ref}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "border-border bg-surface text-foreground placeholder:text-muted flex h-9 w-full rounded-lg border pr-3 pl-10 text-sm",
          "transition-colors duration-150",
          "focus-ring",
          className,
        )}
        {...props}
      />
      {localValue && (
        <button
          type="button"
          onClick={() => setLocalValue("")}
          className="text-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
});

export { SearchInput, type SearchInputProps };
