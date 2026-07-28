"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

type TooltipPosition = "top" | "bottom" | "left" | "right"

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string
  position?: TooltipPosition
  children: ReactNode
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, position = "top", children, ...props },
  ref
) {
  return <div ref={ref} {...props}>{children}</div>
})

export { Tooltip, type TooltipProps, type TooltipPosition }
