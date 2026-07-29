"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, TopNav } from "@/components/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { SidebarSection } from "@/components/navigation";
import type { BreadcrumbItem } from "@/types/ui";

interface AppShellProps {
  children: ReactNode;
  sidebarSections: SidebarSection[];
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export type { AppShellProps };

export function AppShell({ children, sidebarSections, breadcrumbs, className }: AppShellProps) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="flex min-h-screen">
      <Sidebar sections={sidebarSections} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          !isMobile && sidebarOpen ? "ml-56" : "ml-0",
        )}
      >
        <TopNav
          breadcrumbs={breadcrumbs}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-auto">
          <div className={cn("mx-auto w-full max-w-7xl px-6 py-6", className)}>{children}</div>
        </main>
      </div>
    </div>
  );
}

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageShell({ children, title, description, actions, className }: PageShellProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && <p className="text-muted text-sm">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
