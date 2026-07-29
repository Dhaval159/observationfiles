import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoadingSize;
  label?: string;
}

const sizeClasses: Record<LoadingSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

function Loading({ size = "md", label, className, ...props }: LoadingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="status" {...props}>
      <div
        className={cn(
          "border-border border-t-foreground animate-spin rounded-full",
          sizeClasses[size],
        )}
      />
      {label && <span className="text-muted text-sm">{label}</span>}
    </div>
  );
}

export { Loading, type LoadingProps, type LoadingSize };
