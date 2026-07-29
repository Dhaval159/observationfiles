"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/types/ui";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted shrink-0"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link href={item.href} className="text-muted hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(isLast ? "text-foreground font-medium" : "text-muted")}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
