"use client"

import { forwardRef, type ReactNode, type FormHTMLAttributes, type LabelHTMLAttributes } from "react"

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
}

const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { children, ...props },
  ref
) {
  return <form ref={ref} {...props}>{children}</form>
})

interface FormGroupProps {
  children: ReactNode
  className?: string
}

function FormGroup({ children, className }: FormGroupProps) {
  return <div className={className}>{children}</div>
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, ...props },
  ref
) {
  return <label ref={ref} {...props}>{children}</label>
})

interface FormErrorProps {
  message?: string
  className?: string
}

function FormError({ message, className }: FormErrorProps) {
  return <div className={className}>{message}</div>
}

export { Form, FormGroup, Label, FormError }
export type { FormProps, FormGroupProps, LabelProps, FormErrorProps }
