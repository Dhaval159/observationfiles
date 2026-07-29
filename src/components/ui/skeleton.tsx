import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "circular" | "rectangular";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-md",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

function Skeleton({ variant = "text", width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-skeleton from-surface via-surface-alt to-surface bg-gradient-to-r bg-[length:200%_100%]",
        variantClasses[variant],
        className,
      )}
      style={{
        width: width ?? (variant === "circular" ? height : undefined),
        height:
          height ?? (variant === "text" ? undefined : variant === "circular" ? width : undefined),
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton, type SkeletonProps, type SkeletonVariant };
