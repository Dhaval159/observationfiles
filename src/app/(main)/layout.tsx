"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useNavigationStore } from "@/stores/navigation-store";
import { mainNavigation, type NavItem } from "@/config/navigation";
import type { SidebarSection, SidebarItemConfig } from "@/components/navigation";

function navItemToSidebar(item: NavItem): SidebarItemConfig {
  return {
    label: item.label,
    href: item.href,
    icon: item.icon,
    badge: item.badge,
  };
}

function buildSidebarSections(): SidebarSection[] {
  const mainItems = mainNavigation.map(navItemToSidebar);

  const primarySection: SidebarSection = {
    items: mainItems,
  };

  return [primarySection];
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const breadcrumbs = useNavigationStore((s) => s.breadcrumbs);

  const isWorkspace = pathname.includes("/workspace");

  if (isWorkspace) {
    return <>{children}</>;
  }

  return (
    <AppShell
      sidebarSections={buildSidebarSections()}
      breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : undefined}
    >
      {children}
    </AppShell>
  );
}
