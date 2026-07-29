"use client";

import { forwardRef, useEffect, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[calc(100vw-2rem)]",
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { isOpen, onClose, children, title, description, size = "md", className, ...props },
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
    <div
      className="z-modal fixed inset-0 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="animate-fade-in fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          "animate-scale-in border-border bg-surface-elevated relative w-full rounded-xl border shadow-xl",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {(title || description) && (
          <div className="border-border flex items-start justify-between border-b px-6 py-4">
            <div className="space-y-1">
              {title && <h2 className="text-foreground text-lg font-semibold">{title}</h2>}
              {description && <p className="text-muted text-sm">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:bg-interactive-hover hover:text-foreground ml-4 rounded-lg p-1 transition-colors"
              aria-label="Close"
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
        )}
        <div className={cn("px-6 py-4", !title && !description && "pt-6")}>{children}</div>
      </div>
    </div>
  );
});

export { Modal, type ModalProps };
