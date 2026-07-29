"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Divider } from "@/components/ui/divider";

export default function DashboardPage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

  return (
    <PageShell
      title="Dashboard"
      description="Welcome back, Detective. Here is your investigation overview."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ContinueInvestigation />
        <RecentCases />
        <QuickActions />
        <InvestigationStats />
        <RecentActivity />
        <SystemStatus />
      </div>
    </PageShell>
  );
}

function ContinueInvestigation() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-accent-subtle text-accent flex h-8 w-8 items-center justify-center rounded-lg">
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
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">Continue Investigation</h3>
        </div>
        <Badge variant="info">No Active Case</Badge>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="bg-surface text-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </span>
          <p className="text-foreground mb-1 text-sm font-medium">No active investigation</p>
          <p className="text-muted mb-4 text-sm">Start a new case or resume a previous one.</p>
          <Button variant="primary" size="sm">
            Browse Cases
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function RecentCases() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">Recent Cases</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <Skeleton variant="text" className="h-12" />
          <Skeleton variant="text" className="h-12" />
          <Skeleton variant="text" className="h-12 w-3/4" />
        </div>
        <p className="text-muted mt-3 text-xs">3 recent cases loading...</p>
      </CardBody>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">Quick Actions</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" className="justify-start gap-2">
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Case
          </Button>
          <Button variant="secondary" size="sm" className="justify-start gap-2">
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
          </Button>
          <Button variant="secondary" size="sm" className="justify-start gap-2">
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
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            Report
          </Button>
          <Button variant="secondary" size="sm" className="justify-start gap-2">
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function InvestigationStats() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">Statistics</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-alt rounded-lg p-3 text-center">
            <p className="text-foreground text-2xl font-semibold">0</p>
            <p className="text-muted text-xs">Cases Solved</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3 text-center">
            <p className="text-foreground text-2xl font-semibold">0</p>
            <p className="text-muted text-xs">In Progress</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3 text-center">
            <p className="text-foreground text-2xl font-semibold">0</p>
            <p className="text-muted text-xs">Evidence Items</p>
          </div>
          <div className="bg-surface-alt rounded-lg p-3 text-center">
            <p className="text-foreground text-2xl font-semibold">0</p>
            <p className="text-muted text-xs">Observations</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function RecentActivity() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">Recent Activity</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-1">
          <div className="text-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
            <span className="bg-accent flex h-2 w-2 rounded-full" />
            <span>No recent activity</span>
          </div>
          <Divider />
          <div className="text-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
            <span className="bg-muted flex h-2 w-2 rounded-full" />
            <span>Activity log will appear here</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function SystemStatus() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </span>
          <h3 className="text-base font-semibold">System Status</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Database</span>
            <Badge variant="success">Online</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">AI Services</span>
            <Badge variant="default">Standby</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Sync Status</span>
            <Badge variant="info">Connected</Badge>
          </div>
          <Divider />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Last Backup</span>
            <span className="text-muted text-xs">Never</span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
