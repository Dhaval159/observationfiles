"use client"

import { forwardRef, type ReactNode, type HTMLAttributes } from "react"

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { isOpen, onClose, children, ...props },
  ref
) {
  if (!isOpen) return null
  return <div ref={ref} {...props}>{children}</div>
})

export { Modal, type ModalProps }
