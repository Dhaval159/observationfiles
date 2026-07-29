"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import type { PanelId } from "@/features/workspace/types/workspace";

type NavItemId = PanelId | "bookmarks" | "case-files";

interface NavItem {
  id: NavItemId;
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  section?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Investigation",
    items: [
      { id: "locations", label: "Locations", icon: <MapPinIcon />, shortcut: "1" },
      { id: "evidence", label: "Evidence", icon: <PackageIcon />, shortcut: "2" },
      { id: "suspects", label: "Suspects", icon: <UsersIcon />, shortcut: "3" },
      { id: "witnesses", label: "Witnesses", icon: <UserCheckIcon />, shortcut: "4" },
    ],
  },
  {
    title: "Analysis",
    items: [
      { id: "timeline", label: "Timeline", icon: <ClockIcon />, shortcut: "5" },
      { id: "theory-board", label: "Theory Board", icon: <GitGraphIcon />, shortcut: "6" },
      { id: "dialogue", label: "Dialogue", icon: <MessageIcon />, shortcut: "7" },
      { id: "observations", label: "Observations", icon: <EyeIcon />, shortcut: "8" },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "objectives", label: "Objectives", icon: <TargetIcon />, shortcut: "9" },
      { id: "notebook", label: "Notebook", icon: <NotebookIcon />, shortcut: "0" },
      { id: "map", label: "Map", icon: <MapIcon />, shortcut: "M" },
      { id: "case-files", label: "Case Files", icon: <FolderIcon />, shortcut: "F" },
    ],
  },
];

export function InvestigationNavigation() {
  const layout = useWorkspaceStore((s) => s.layout);
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);
  const toggleNavigation = useWorkspaceStore((s) => s.toggleNavigation);

  const handleNavClick = useCallback(
    (id: NavItemId) => {
      if (id === "bookmarks" || id === "case-files") return;
      setActivePanel(id === layout.activePanel ? null : id);
    },
    [layout.activePanel, setActivePanel],
  );

  return (
    <>
      {layout.navigationCollapsed && (
        <button
          type="button"
          onClick={toggleNavigation}
          className="border-border bg-surface text-muted hover:bg-interactive-hover hover:text-foreground fixed top-1/2 left-3 z-30 -translate-y-1/2 rounded-full border p-2 shadow-md transition-colors"
          aria-label="Open investigation navigation"
        >
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
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      <aside
        className={cn(
          "border-border bg-background-alt flex h-full flex-col border-r transition-all duration-200",
          layout.navigationCollapsed
            ? "w-0 overflow-hidden border-transparent"
            : "w-[220px] min-w-[220px]",
        )}
        aria-label="Investigation navigation"
      >
        <div className="border-border flex h-12 items-center justify-between border-b px-3">
          <span className="text-muted text-xs font-semibold tracking-wider uppercase">
            Navigation
          </span>
          <button
            type="button"
            onClick={toggleNavigation}
            className="text-muted hover:bg-interactive-hover hover:text-foreground flex items-center justify-center rounded p-1 transition-colors"
            aria-label="Close navigation"
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
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="scrollable flex-1 overflow-y-auto px-2 py-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="text-muted mb-1.5 px-2 text-[10px] font-semibold tracking-widest uppercase">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = layout.activePanel === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150",
                          isActive
                            ? "bg-accent-subtle text-accent font-medium"
                            : "text-muted hover:bg-interactive-hover hover:text-foreground",
                        )}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`${item.label} panel`}
                      >
                        <span className="flex h-4 w-4 items-center justify-center">
                          {item.icon}
                        </span>
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        {item.shortcut && (
                          <kbd className="border-border bg-surface text-muted rounded border px-1 font-mono text-[10px]">
                            {item.shortcut}
                          </kbd>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-border border-t p-3">
          <p className="text-muted text-[10px]">Ctrl+K to search</p>
        </div>
      </aside>
    </>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GitGraphIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="6" r="3" />
      <circle cx="5" cy="18" r="3" />
      <circle cx="19" cy="6" r="3" />
      <circle cx="19" cy="18" r="3" />
      <line x1="5" y1="9" x2="5" y2="15" />
      <line x1="19" y1="9" x2="19" y2="15" />
      <polyline points="5 15 12 18 19 15" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="15"
      height="15"
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
  );
}

function TargetIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );
}
