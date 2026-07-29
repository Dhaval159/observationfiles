"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

function Accordion({ items, multiple = false, defaultOpen, className }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={cn("divide-border divide-y", className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "text-foreground hover:text-foreground flex w-full items-center justify-between py-3 text-sm font-medium transition-colors",
                "focus-ring rounded",
              )}
              aria-expanded={isOpen}
            >
              {item.title}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "text-muted shrink-0 transition-transform duration-150",
                  isOpen && "rotate-180",
                )}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-150",
                isOpen ? "pb-3" : "max-h-0",
              )}
            >
              <div className="text-muted text-sm">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { Accordion, type AccordionProps, type AccordionItem };
