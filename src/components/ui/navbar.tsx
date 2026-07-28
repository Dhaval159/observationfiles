"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

interface NavbarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

const Navbar = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { children, ...props },
  ref
) {
  return <nav ref={ref} {...props}>{children}</nav>
})

interface NavbarBrandProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function NavbarBrand({ children, ...props }: NavbarBrandProps) {
  return <div {...props}>{children}</div>
}

interface NavbarLinksProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function NavbarLinks({ children, ...props }: NavbarLinksProps) {
  return <div {...props}>{children}</div>
}

export { Navbar, NavbarBrand, NavbarLinks }
export type { NavbarProps, NavbarBrandProps, NavbarLinksProps }
