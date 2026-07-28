"use client"

import { forwardRef, type InputHTMLAttributes } from "react"

type InputVariant = "default" | "outline" | "filled"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = "default", label, error, ...props },
  ref
) {
  return <input ref={ref} {...props} />
})

export { Input, type InputProps, type InputVariant }
