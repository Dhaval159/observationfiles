"use client";

import {
  type ReactNode,
  type HTMLAttributes,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { cn } from "@/lib/utils";

export type PanelVariant = "default" | "elevated" | "ghost";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  variant?: PanelVariant;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  resizable?: boolean;
  resizeDirection?: "horizontal" | "vertical";
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
  scrollable?: boolean;
  sticky?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  empty?: boolean;
  emptyState?: ReactNode;
  badge?: string | number;
  actions?: ReactNode;
  panelId?: string;
}

const variantClasses: Record<PanelVariant, string> = {
  default: "border border-border bg-surface",
  elevated: "border border-border bg-surface shadow-md",
  ghost: "bg-transparent",
};

export function Panel({
  children,
  header,
  footer,
  variant = "default",
  collapsible = false,
  collapsed = false,
  onToggle,
  resizable = false,
  resizeDirection = "horizontal",
  defaultSize = 320,
  minSize = 180,
  maxSize = 800,
  onResize,
  scrollable = true,
  sticky = false,
  stickyHeader = false,
  loading = false,
  empty = false,
  emptyState,
  badge,
  actions,
  panelId,
  className,
  style,
  ...props
}: PanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(defaultSize);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startPos = resizeDirection === "horizontal" ? e.clientX : e.clientY;
      const startSize = size;

      const handleMouseMove = (ev: MouseEvent) => {
        const currentPos = resizeDirection === "horizontal" ? ev.clientX : ev.clientY;
        const delta = currentPos - startPos;
        const newSize = Math.min(maxSize, Math.max(minSize, startSize + delta));
        setSize(newSize);
        onResize?.(newSize);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = resizeDirection === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [resizeDirection, size, minSize, maxSize, onResize],
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    ...(resizable && resizeDirection === "horizontal" ? { width: size, flexShrink: 0 } : {}),
    ...(resizable && resizeDirection === "vertical" ? { height: size, flexShrink: 0 } : {}),
    ...(collapsed && collapsible ? { display: "none" } : {}),
    ...style,
  };

  return (
    <div
      ref={panelRef}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg",
        variantClasses[variant],
        isResizing && "pointer-events-none",
        sticky && "sticky",
        className,
      )}
      style={panelStyle}
      role="region"
      aria-label={panelId ? `Panel: ${panelId}` : undefined}
      {...props}
    >
      {(header || collapsible || badge !== undefined || actions) && (
        <div
          className={cn(
            "border-border flex items-center gap-2 border-b px-3 py-2",
            stickyHeader && "bg-surface sticky top-0 z-10",
          )}
        >
          {collapsible && (
            <button
              type="button"
              onClick={onToggle}
              className="text-muted hover:bg-interactive-hover hover:text-foreground flex items-center justify-center rounded p-0.5 transition-colors"
              aria-label={collapsed ? "Expand panel" : "Collapse panel"}
              aria-expanded={!collapsed}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-transform", collapsed && "-rotate-90")}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
          {header && (
            <div className="text-foreground flex-1 truncate text-sm font-medium">{header}</div>
          )}
          {badge !== undefined && (
            <span className="bg-accent-subtle text-accent flex h-5 items-center rounded px-1.5 text-[10px] font-medium">
              {badge}
            </span>
          )}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}

      <div
        className={cn(
          "flex-1",
          scrollable && "scrollable",
          loading || empty ? "flex items-center justify-center" : "",
        )}
      >
        {loading ? (
          <div className="space-y-3 p-4">
            <div className="animate-pulse-soft bg-surface-alt h-3 w-3/4 rounded" />
            <div className="animate-pulse-soft bg-surface-alt h-3 w-1/2 rounded" />
            <div className="animate-pulse-soft bg-surface-alt h-3 w-5/6 rounded" />
            <div className="animate-pulse-soft bg-surface-alt h-3 w-2/3 rounded" />
          </div>
        ) : empty && emptyState ? (
          emptyState
        ) : (
          children
        )}
      </div>

      {footer && <div className="border-border border-t px-3 py-2">{footer}</div>}

      {resizable && (
        <div
          className={cn(
            "hover:bg-accent absolute top-0 right-0 bottom-0 z-10 w-1 cursor-col-resize transition-colors",
            isResizing && "bg-accent",
            resizeDirection === "vertical" &&
              "right-0 bottom-0 left-0 h-1 w-full cursor-row-resize",
          )}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation={resizeDirection === "horizontal" ? "vertical" : "horizontal"}
          aria-label="Resize panel"
        />
      )}
    </div>
  );
}
