"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "bottom" | "top";
  className?: string;
  contentClassName?: string;
}

function Popover({
  trigger,
  children,
  align = "start",
  side = "bottom",
  className,
  contentClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideClasses = {
    bottom: "top-full mt-2",
    top: "bottom-full mb-2",
  };

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
            "z-dropdown animate-scale-in border-border bg-surface-elevated absolute min-w-[12rem] rounded-lg border p-1 shadow-lg",
            alignClasses[align],
            sideClasses[side],
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

interface PopoverItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

function PopoverItem({ children, onClick, disabled = false, className }: PopoverItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={cn(
        "text-foreground flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        "hover:bg-interactive-hover",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export { Popover, PopoverItem, type PopoverProps, type PopoverItemProps };
