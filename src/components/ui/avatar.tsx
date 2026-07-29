"use client";

import { forwardRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  size?: AvatarSize;
  fallback?: string;
  name?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-12 w-12 text-lg",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
  { size = "md", fallback, name, src, alt, className, ...props },
  ref,
) {
  const [error, setError] = useState(false);
  const initials = fallback ?? getInitials(name);
  const showFallback = error || !src;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        sizeClasses[size],
        showFallback ? "bg-secondary text-secondary-foreground" : "bg-transparent",
        className,
      )}
    >
      {showFallback ? (
        <span className="leading-none font-medium">{initials}</span>
      ) : (
        <img
          ref={ref}
          src={src}
          alt={alt ?? name ?? "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
          {...props}
        />
      )}
    </span>
  );
});

export { Avatar, type AvatarProps, type AvatarSize };
