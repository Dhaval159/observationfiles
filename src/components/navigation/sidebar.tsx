"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface SidebarSection {
  title?: string;
  items: SidebarItemConfig[];
}

export interface SidebarItemConfig {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  children?: SidebarItemConfig[];
}

interface SidebarProps {
  sections: SidebarSection[];
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ sections, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-30 bg-black/60" onClick={onToggle} aria-hidden="true" />
      )}
      <aside
        className={cn(
          "border-border bg-background fixed top-0 left-0 z-40 flex h-full flex-col border-r transition-transform duration-200",
          isOpen ? "w-56" : "w-0 overflow-hidden",
          isMobile && (isOpen ? "translate-x-0" : "-translate-x-full"),
          !isMobile && "sticky",
        )}
        aria-label="Sidebar navigation"
      >
        <div className="border-border flex h-14 items-center border-b px-4">
          <Link href="/" className="text-foreground flex items-center gap-2 font-semibold">
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">
              OF
            </span>
            <span className="text-sm">The Observation Files</span>
          </Link>
        </div>

        <nav className="scrollable flex-1 overflow-y-auto px-2 py-3">
          {sections.map((section, i) => (
            <div key={i} className="mb-4">
              {section.title && (
                <p className="text-muted mb-1.5 px-2 text-xs font-medium tracking-wider uppercase">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={isMobile ? onToggle : undefined}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-border border-t p-3">
          <p className="text-muted text-xs">v0.1.0</p>
        </div>
      </aside>
    </>
  );
}

interface SidebarNavItemProps {
  item: SidebarItemConfig;
  pathname: string;
  onNavigate?: () => void;
}

function SidebarNavItem({ item, pathname, onNavigate }: SidebarNavItemProps) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <Link
        href={item.disabled ? "#" : item.href}
        onClick={item.disabled ? (e) => e.preventDefault() : onNavigate}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150",
          isActive
            ? "bg-accent-subtle text-accent font-medium"
            : "text-muted hover:text-foreground hover:bg-interactive-hover",
          item.disabled && "pointer-events-none opacity-40",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="flex h-4 w-4 items-center justify-center">
          <SidebarIcon name={item.icon} />
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="bg-accent-subtle text-accent rounded-md px-1.5 py-0.5 text-[10px] font-medium">
            {item.badge}
          </span>
        )}
      </Link>
      {hasChildren && isActive && (
        <ul className="border-border mt-0.5 ml-4 space-y-0.5 border-l pl-2">
          {item.children!.map((child) => (
            <SidebarNavItem
              key={child.href}
              item={child}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarIcon({ name }: { name?: string }) {
  const icons: Record<string, React.ReactNode> = {
    LayoutDashboard: (
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
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
    FolderSearch: (
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
        <path d="M2 8V6a2 2 0 012-2h5l2 3h5a2 2 0 012 2v2" />
      </svg>
    ),
    Search: (
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
      </svg>
    ),
    Package: (
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
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    Eye: (
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
    Clock: (
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
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    GitGraph: (
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
        <circle cx="5" cy="6" r="3" />
        <circle cx="5" cy="18" r="3" />
        <circle cx="19" cy="6" r="3" />
        <circle cx="19" cy="18" r="3" />
        <line x1="5" y1="9" x2="5" y2="15" />
        <line x1="19" y1="9" x2="19" y2="15" />
        <polyline points="5 15 12 18 19 15" />
      </svg>
    ),
    Trophy: (
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
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
      </svg>
    ),
    User: (
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
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Settings: (
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
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    FileText: (
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
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  };

  if (!name || !icons[name]) {
    return (
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
        <circle cx="12" cy="12" r="1" />
      </svg>
    );
  }

  return icons[name] ?? null;
}
