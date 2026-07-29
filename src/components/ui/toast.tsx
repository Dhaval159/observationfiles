"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant;
  message: string;
  isVisible: boolean;
  onClose?: () => void;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-success-subtle border-success/30 text-success",
  error: "bg-danger-subtle border-danger/30 text-danger",
  warning: "bg-warning-subtle border-warning/30 text-warning",
  info: "bg-info-subtle border-info/30 text-info",
};

const variantIcons: Record<ToastVariant, ReactNode> = {
  success: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { variant = "info", message, isVisible, onClose, className, ...props },
  ref,
) {
  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "animate-slide-up flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <span className="shrink-0">{variantIcons[variant]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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

interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function ToastContainer({ children, className, ...props }: ToastContainerProps) {
  return (
    <div
      className={cn("z-toast fixed right-4 bottom-4 flex max-w-sm flex-col gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Toast, ToastContainer, type ToastProps, type ToastContainerProps, type ToastVariant };
