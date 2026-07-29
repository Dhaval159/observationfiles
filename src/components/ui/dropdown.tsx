"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
  contentClassName?: string;
}

function Dropdown({
  trigger,
  children,
  align = "start",
  className,
  contentClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            "z-dropdown animate-scale-in border-border bg-surface-elevated absolute top-full mt-1 min-w-[10rem] rounded-lg border p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
            contentClassName,
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}

function DropdownItem({
  children,
  onClick,
  disabled = false,
  danger = false,
  className,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        danger
          ? "text-danger hover:bg-danger-subtle"
          : "text-foreground hover:bg-interactive-hover",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export { Dropdown, DropdownItem, type DropdownProps, type DropdownItemProps };
