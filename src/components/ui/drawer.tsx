"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

type DrawerSide = "left" | "right" | "top" | "bottom"

interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  side?: DrawerSide
  children: ReactNode
}

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { isOpen, onClose, side = "right", children, ...props },
  ref
) {
  if (!isOpen) return null
  return <div ref={ref} {...props}>{children}</div>
})

export { Drawer, type DrawerProps, type DrawerSide }
