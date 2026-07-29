"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Divider } from "@/components/ui/divider";

export default function AchievementsPage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Achievements" }]);
  }, [setBreadcrumbs]);

  return (
    <PageShell
      title="Achievements"
      description="Track your detective milestones and accomplishments."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="text-center">
            <p className="text-foreground text-3xl font-bold">0</p>
            <p className="text-muted text-sm">Total Achievements</p>
            <Progress value={0} size="sm" className="mt-3" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-foreground text-3xl font-bold">0</p>
            <p className="text-muted text-sm">Unlocked</p>
            <Progress value={0} size="sm" className="mt-3" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-foreground text-3xl font-bold">0%</p>
            <p className="text-muted text-sm">Completion</p>
            <Progress value={0} size="sm" className="mt-3" />
          </CardBody>
        </Card>
      </div>

      <Divider />

      <div className="space-y-1">
        <h3 className="text-foreground text-sm font-semibold">All Achievements</h3>
        <p className="text-muted text-sm">
          Complete cases and investigations to unlock achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AchievementCard key={i} index={i} />
        ))}
      </div>
    </PageShell>
  );
}

function AchievementCard({ index }: { index: number }) {
  const categories = [
    "Deduction",
    "Investigation",
    "Observation",
    "Evidence",
    "Timeline",
    "Dialogue",
  ];
  const locked = index > 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${locked ? "bg-surface text-muted" : "bg-accent-subtle text-accent"}`}
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
              {locked ? (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </>
              ) : (
                <>
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                </>
              )}
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-medium ${locked ? "text-muted" : "text-foreground"}`}
            >
              {locked ? "???" : `${categories[index % categories.length]} Master`}
            </p>
            <p className="text-muted truncate text-xs">
              {locked ? "Achievement locked" : `${categories[index % categories.length]} category`}
            </p>
          </div>
          <Badge variant={locked ? "default" : "accent"}>{locked ? "Locked" : "Available"}</Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
