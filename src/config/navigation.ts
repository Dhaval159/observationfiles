import { routes } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  requiresAuth?: boolean;
  badge?: string;
}

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: "LayoutDashboard", requiresAuth: true },
  { label: "Cases", href: routes.cases.index, icon: "FolderSearch", requiresAuth: true },
  { label: "Achievements", href: routes.achievements, icon: "Trophy", requiresAuth: true },
  { label: "Profile", href: routes.profile, icon: "User", requiresAuth: true },
  { label: "Settings", href: routes.settings, icon: "Settings", requiresAuth: true },
] as const;

export const authNavigation: NavItem[] = [
  { label: "Log In", href: routes.login },
  { label: "Sign Up", href: routes.signup },
] as const;

export const caseSubNavigation = (caseId: string): NavItem[] => [
  { label: "Overview", href: routes.cases.detail(caseId), icon: "FileText" },
  { label: "Investigate", href: routes.cases.investigate(caseId), icon: "Search" },
  { label: "Evidence", href: routes.cases.evidence(caseId), icon: "Package" },
  { label: "Observations", href: routes.cases.observations(caseId), icon: "Eye" },
  { label: "Timeline", href: routes.cases.timeline(caseId), icon: "Clock" },
  { label: "Theory Board", href: routes.cases.theoryBoard(caseId), icon: "GitGraph" },
];
