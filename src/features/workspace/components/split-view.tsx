"use client";

import { type ReactNode, useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SplitViewProps {
  children: ReactNode[];
  mode: "single" | "dual" | "triple";
  sizes: number[];
  onSizesChange?: (sizes: number[]) => void;
  minSize?: number;
  className?: string;
}

export function SplitView({
  children,
  mode,
  sizes,
  onSizesChange,
  minSize = 200,
  className,
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [activeDivider, setActiveDivider] = useState<number>(-1);

  const visibleChildren = children.slice(0, mode === "single" ? 1 : mode === "dual" ? 2 : 3);

  const handleDividerMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setActiveDivider(index);
      const startX = e.clientX;
      const containerWidth = containerRef.current?.getBoundingClientRect().width ?? 800;
      const startSizes = [...sizes];

      const handleMouseMove = (ev: MouseEvent) => {
        if (!containerWidth) return;
        const delta = ev.clientX - startX;
        const deltaRatio = delta / containerWidth;

        const newSizes = [...startSizes];
        const leftIdx = index;
        const rightIdx = index + 1;

        const leftSize = Math.max(
          minSize / containerWidth,
          (startSizes[leftIdx] ?? 0.5) + deltaRatio,
        );
        const rightSize = Math.max(
          minSize / containerWidth,
          (startSizes[rightIdx] ?? 0.5) - deltaRatio,
        );
        const total = leftSize + rightSize;
        newSizes[leftIdx] = leftSize / total;
        newSizes[rightIdx] = rightSize / total;

        onSizesChange?.(newSizes);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setActiveDivider(-1);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [sizes, onSizesChange, minSize],
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  if (visibleChildren.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full w-full overflow-hidden", className)}
      role="region"
      aria-label="Split view"
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="flex h-full"
          style={{
            flex: sizes[index] ?? 1,
            minWidth: 0,
          }}
        >
          <div className="flex h-full w-full min-w-0">{child}</div>
          {index < visibleChildren.length - 1 && (
            <div
              className={cn(
                "relative flex w-1 shrink-0 cursor-col-resize items-center justify-center transition-colors",
                isResizing && activeDivider === index ? "bg-accent" : "hover:bg-accent/50",
              )}
              onMouseDown={(e) => handleDividerMouseDown(index, e)}
              role="separator"
              aria-orientation="vertical"
              aria-label={`Resize panels ${index + 1} and ${index + 2}`}
            >
              <div className="bg-border h-8 w-0.5 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
