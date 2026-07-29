import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

function Divider({ orientation = "horizontal", className, ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-border shrink-0",
        orientation === "horizontal" ? "h-px w-full border-t" : "mx-1 h-full w-px border-l",
        className,
      )}
      {...props}
    />
  );
}

export { Divider, type DividerProps };
