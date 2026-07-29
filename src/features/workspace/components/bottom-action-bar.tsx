"use client";

import { cn } from "@/lib/utils";

interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
}

const actions: ActionItem[] = [
  {
    id: "observe",
    label: "Observe",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    shortcut: "Space",
    disabled: true,
  },
  {
    id: "inspect",
    label: "Inspect",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "talk",
    label: "Talk",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    shortcut: "T",
    disabled: true,
  },
  {
    id: "present",
    label: "Present Evidence",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "move",
    label: "Move",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="5 9 2 12 5 15" />
        <polyline points="9 5 12 2 15 5" />
        <polyline points="15 19 12 22 9 19" />
        <polyline points="19 9 22 12 19 15" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
    disabled: true,
  },
  {
    id: "deduce",
    label: "Deduce",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    shortcut: "D",
    disabled: true,
  },
];

export function BottomActionBar() {
  return (
    <div
      className="border-border bg-background-alt flex h-12 items-center gap-1 border-t px-3"
      role="toolbar"
      aria-label="Action bar"
    >
      <div className="flex items-center gap-1">
        {actions.slice(0, 4).map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={action.disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              action.disabled
                ? "cursor-not-allowed opacity-40"
                : "text-muted hover:bg-interactive-hover hover:text-foreground",
            )}
            aria-label={action.label}
            aria-disabled={action.disabled}
          >
            <span className="shrink-0">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-border mx-2 h-6 w-px" />

      <div className="flex items-center gap-1">
        {actions.slice(4).map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={action.disabled}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              action.disabled
                ? "cursor-not-allowed opacity-40"
                : "text-muted hover:bg-interactive-hover hover:text-foreground",
            )}
            aria-label={action.label}
            aria-disabled={action.disabled}
          >
            <span className="shrink-0">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <div className="text-muted flex items-center gap-2 text-[10px]">
        <span className="tabular-nums">--:--:--</span>
      </div>
    </div>
  );
}
