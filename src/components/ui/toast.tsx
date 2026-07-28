"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

type ToastVariant = "success" | "error" | "warning" | "info"

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant
  message: string
  isVisible: boolean
  onClose?: () => void
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { variant = "info", message, isVisible, onClose, ...props },
  ref
) {
  if (!isVisible) return null
  return <div ref={ref} {...props}>{message}</div>
})

interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function ToastContainer({ children, ...props }: ToastContainerProps) {
  return <div {...props}>{children}</div>
}

export { Toast, ToastContainer, type ToastProps, type ToastContainerProps, type ToastVariant }
