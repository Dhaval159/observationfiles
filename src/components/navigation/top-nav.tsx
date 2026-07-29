"use client";

import { useTheme } from "@/providers/theme-provider";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/button";
import type { BreadcrumbItem } from "@/types/ui";

interface TopNavProps {
  breadcrumbs?: BreadcrumbItem[];
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function TopNav({ breadcrumbs, onToggleSidebar, sidebarOpen }: TopNavProps) {
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((s) => s.user);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="text-muted hover:bg-interactive-hover hover:text-foreground flex items-center justify-center rounded-lg p-1.5 transition-colors"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg
          width="18"
          height="18"
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

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, index) => (
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
                  className="text-muted"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              {crumb.href ? (
                <a href={crumb.href} className="text-muted hover:text-foreground transition-colors">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="border-border text-muted hover:bg-interactive-hover hover:text-foreground flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors"
          aria-label="Open global search"
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
          <kbd className="border-border bg-surface text-muted ml-auto hidden rounded border px-1.5 font-mono text-[10px] md:inline-flex">
            ⌘K
          </kbd>
        </button>

        <IconButton
          label="Toggle theme"
          icon={
            theme === "dark" ? (
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
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
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
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )
          }
          variant="ghost"
          size="md"
          onClick={toggleTheme}
        />

        <IconButton
          label="Notifications"
          icon={
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
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          }
          variant="ghost"
          size="md"
        />

        {user && (
          <Avatar
            size="sm"
            name={user.displayName ?? user.email ?? "User"}
            src={user.avatarUrl ?? undefined}
            className="ml-1 cursor-pointer"
          />
        )}
      </div>
    </header>
  );
}
