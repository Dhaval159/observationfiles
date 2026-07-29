import type { ReactNode, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TagVariant = "default" | "success" | "warning" | "danger" | "info" | "accent";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TagVariant;
  children: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const variantClasses: Record<TagVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
  accent: "bg-accent-subtle text-accent",
};

function Tag({
  variant = "default",
  children,
  removable = false,
  onRemove,
  className,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex items-center justify-center rounded-sm hover:opacity-70"
          aria-label="Remove"
          {...props}
        >
          <svg
            width="12"
            height="12"
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
    </span>
  );
}

export { Tag, type TagProps, type TagVariant };
