"use client";

import {
  forwardRef,
  type ReactNode,
  type FormHTMLAttributes,
  type LabelHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { children, className, ...props },
  ref,
) {
  return (
    <form ref={ref} className={cn("space-y-5", className)} {...props}>
      {children}
    </form>
  );
});

interface FormGroupProps {
  children: ReactNode;
  className?: string;
}

function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>;
}

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, className, ...props },
  ref,
) {
  return (
    <label ref={ref} className={cn("text-foreground text-sm font-medium", className)} {...props}>
      {children}
    </label>
  );
});

interface FormErrorProps {
  message?: string;
  className?: string;
}

function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p className={cn("text-danger text-xs", className)} role="alert">
      {message}
    </p>
  );
}

export { Form, FormGroup, Label, FormError };
export type { FormProps, FormGroupProps, LabelProps, FormErrorProps };
