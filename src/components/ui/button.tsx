"use client"

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", children, ...props },
  ref
) {
  return <button ref={ref} {...props}>{children}</button>
})

export { Button, type ButtonProps, type ButtonVariant }
