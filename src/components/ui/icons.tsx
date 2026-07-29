import type { SVGAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string;
  children: ReactNode;
}

function Icon({ size = 20, children, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

interface IconWrapperProps {
  icon?: ReactNode;
  size?: number | string;
  className?: string;
  children?: ReactNode;
}

function IconWrapper({ icon, children, className }: IconWrapperProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", className)}>
      {icon ?? children}
    </span>
  );
}

export { Icon, IconWrapper, type IconProps, type IconWrapperProps };
