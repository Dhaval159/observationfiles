import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalConfig {
  isOpen: boolean;
  title?: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export interface DrawerConfig {
  isOpen: boolean;
  children?: ReactNode;
  onClose: () => void;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  state: LoadingState;
  error: string | null;
}
