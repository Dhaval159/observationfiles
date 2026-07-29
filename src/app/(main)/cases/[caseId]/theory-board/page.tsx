"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function TheoryBoardPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Theory Board" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Theory Board</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted mt-1 text-sm">
            Connect evidence, suspects, and build your theories.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm">
            Save Board
          </Button>
          <Button variant="primary" size="sm">
            New Theory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
                </svg>
              </span>
              <h3 className="text-sm font-semibold">Theories</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-foreground text-2xl font-bold">0</p>
            <p className="text-muted text-xs">Formulated theories</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
              </span>
              <h3 className="text-sm font-semibold">Connections</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-foreground text-2xl font-bold">0</p>
            <p className="text-muted text-xs">Evidence connections</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="bg-surface text-muted flex h-8 w-8 items-center justify-center rounded-lg">
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
                </svg>
              </span>
              <h3 className="text-sm font-semibold">Nodes</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-foreground text-2xl font-bold">0</p>
            <p className="text-muted text-xs">Board elements</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="py-12">
          <EmptyState
            icon={
              <svg
                width="32"
                height="32"
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
            }
            title="Empty Theory Board"
            description="Start building your theory by connecting evidence, suspects, and events."
            action={
              <Button variant="primary" size="sm">
                Create First Theory
              </Button>
            }
          />
        </CardBody>
      </Card>
    </div>
  );
}
