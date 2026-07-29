import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextColor = "primary" | "secondary" | "muted" | "accent" | "success" | "warning" | "danger";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  color?: TextColor;
}

interface TextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  color?: TextColor;
}

const colorClasses: Record<TextColor, string> = {
  primary: "text-foreground",
  secondary: "text-secondary-foreground",
  muted: "text-muted",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

function H1({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h1
      className={cn("text-3xl font-semibold tracking-tight", colorClasses[color], className)}
      {...props}
    >
      {children}
    </h1>
  );
}

function H2({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h2
      className={cn("text-2xl font-semibold tracking-tight", colorClasses[color], className)}
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h3
      className={cn("text-xl font-semibold tracking-tight", colorClasses[color], className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function H4({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h4 className={cn("text-lg font-medium", colorClasses[color], className)} {...props}>
      {children}
    </h4>
  );
}

function H5({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h5 className={cn("text-base font-medium", colorClasses[color], className)} {...props}>
      {children}
    </h5>
  );
}

function H6({ children, className, color = "primary", ...props }: HeadingProps) {
  return (
    <h6 className={cn("text-sm font-medium", colorClasses[color], className)} {...props}>
      {children}
    </h6>
  );
}

function P({ children, className, color = "primary", ...props }: TextProps) {
  return (
    <p className={cn("text-base leading-relaxed", colorClasses[color], className)} {...props}>
      {children}
    </p>
  );
}

function Span({ children, className, color = "primary", ...props }: TextProps) {
  return (
    <span className={cn(colorClasses[color], className)} {...props}>
      {children}
    </span>
  );
}

function Small({ children, className, color = "muted", ...props }: TextProps) {
  return (
    <small className={cn("text-muted text-sm", colorClasses[color], className)} {...props}>
      {children}
    </small>
  );
}

function Caption({ children, className, color = "muted", ...props }: TextProps) {
  return (
    <span className={cn("text-muted text-xs", colorClasses[color], className)} {...props}>
      {children}
    </span>
  );
}

function Code({ children, className, ...props }: TextProps) {
  return (
    <code
      className={cn("bg-surface text-accent rounded-md px-1.5 py-0.5 font-mono text-sm", className)}
      {...props}
    >
      {children}
    </code>
  );
}

export { H1, H2, H3, H4, H5, H6, P, Span, Small, Caption, Code };
export type { HeadingProps, TextProps, TextColor };
