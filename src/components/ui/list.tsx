import type { ReactNode, HTMLAttributes, LiHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ListProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
  variant?: "unordered" | "ordered";
}

function List({ children, variant = "unordered", className, ...props }: ListProps) {
  const Tag = variant === "ordered" ? "ol" : "ul";
  return (
    <Tag className={cn("flex flex-col", className)} {...props}>
      {children}
    </Tag>
  );
}

interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

function ListItem({ children, className, ...props }: ListItemProps) {
  return (
    <li
      className={cn(
        "border-border flex items-center gap-3 border-b px-3 py-2.5 last:border-0",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

export { List, ListItem, type ListProps, type ListItemProps };
