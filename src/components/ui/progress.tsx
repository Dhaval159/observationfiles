import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
};

const variantClasses = {
  default: "bg-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div
        className={cn("bg-surface flex-1 overflow-hidden rounded-full", sizeClasses[size])}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantClasses[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-muted text-xs font-medium tabular-nums">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export { Progress, type ProgressProps };
