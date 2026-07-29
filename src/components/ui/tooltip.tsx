"use client";

import { forwardRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
  delay?: number;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, position = "top", children, delay = 300, className, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  let timeout: ReturnType<typeof setTimeout>;

  const show = () => {
    timeout = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeout);
    setVisible(false);
  };

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      {visible && (
        <div
          className={cn(
            "z-dropdown border-border bg-surface-elevated text-foreground animate-fade-in pointer-events-none absolute rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-lg",
            "whitespace-nowrap",
            positionClasses[position],
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
});

export { Tooltip, type TooltipProps, type TooltipPosition };
