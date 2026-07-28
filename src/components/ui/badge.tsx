import type { ReactNode, HTMLAttributes } from "react"

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

function Badge({ variant = "default", children, ...props }: BadgeProps) {
  return <span {...props}>{children}</span>
}

export { Badge, type BadgeProps, type BadgeVariant }
