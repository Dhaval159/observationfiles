"use client";

import { useEffect, type ReactNode } from "react";
import { useUIStore } from "@/stores/ui-store";
import { Toast, ToastContainer } from "@/components/ui/toast";
import { constants } from "@/config/constants";

export function ToastProvider({ children }: { children: ReactNode }) {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <>
      {children}
      {toasts.length > 0 && (
        <ToastContainer>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </ToastContainer>
      )}
    </>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: {
    id: string;
    message: string;
    variant: "success" | "error" | "warning" | "info";
    duration?: number;
  };
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const duration = toast.duration ?? constants.timings.toastDuration;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <Toast
      variant={toast.variant}
      message={toast.message}
      isVisible={true}
      onClose={() => onRemove(toast.id)}
    />
  );
}
