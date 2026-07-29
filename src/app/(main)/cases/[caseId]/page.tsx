"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Cases", href: "/cases" }, { label: caseId }]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Case Overview</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted text-sm">
            Review case details, objectives, and overall progress.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" size="sm">
            Continue Investigation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Case Details</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Status</span>
                  <p className="text-foreground font-medium">In Progress</p>
                </div>
                <div>
                  <span className="text-muted">Difficulty</span>
                  <p className="text-foreground font-medium">Medium</p>
                </div>
                <div>
                  <span className="text-muted">Started</span>
                  <p className="text-foreground font-medium">Not started</p>
                </div>
                <div>
                  <span className="text-muted">Last Activity</span>
                  <p className="text-foreground font-medium">Never</p>
                </div>
              </div>
              <Divider />
              <div>
                <span className="text-muted text-sm">Description</span>
                <p className="text-foreground mt-1 text-sm">
                  Case description and background information will appear here. This area provides
                  context about the investigation.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Objectives</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Skeleton variant="text" className="h-10" />
              <Skeleton variant="text" className="h-10" />
              <Skeleton variant="text" className="h-10 w-3/4" />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Progress</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="text-center">
                <p className="text-foreground text-3xl font-bold">0%</p>
                <p className="text-muted text-xs">Overall Completion</p>
              </div>
              <Progress value={0} size="md" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Evidence</span>
                  <span>0/0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Observations</span>
                  <span>0/0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Witnesses</span>
                  <span>0/0</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Quick Links</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
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
                Investigate
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
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
                  <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Evidence
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Observations
              </Button>
              <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
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
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Timeline
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
