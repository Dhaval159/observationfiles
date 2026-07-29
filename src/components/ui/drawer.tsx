"use client";

import { forwardRef, useEffect, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type DrawerSide = "left" | "right";

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm: "w-72",
  md: "w-80",
  lg: "w-96",
};

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { isOpen, onClose, side = "right", size = "md", children, className, ...props },
  ref,
) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="z-drawer fixed inset-0" role="dialog" aria-modal="true">
      <div
        className="animate-fade-in fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          "border-border bg-surface-elevated fixed top-0 bottom-0 flex flex-col shadow-xl",
          side === "right"
            ? "animate-slide-up right-0 border-l"
            : "animate-slide-up left-0 border-r",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-interactive-hover hover:text-foreground rounded-lg p-1.5 transition-colors"
            aria-label="Close drawer"
          >
            <svg
              width="18"
              height="18"
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
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
});

export { Drawer, type DrawerProps, type DrawerSide };
