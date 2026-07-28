"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  children: ReactNode
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
  { isOpen = true, children, ...props },
  ref
) {
  return <div ref={ref} {...props}>{children}</div>
})

interface SidebarItemProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean
  children: ReactNode
}

function SidebarItem({ active = false, children, ...props }: SidebarItemProps) {
  return <div {...props}>{children}</div>
}

export { Sidebar, SidebarItem }
export type { SidebarProps, SidebarItemProps }
