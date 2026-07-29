"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Divider } from "@/components/ui/divider";

export default function TimelinePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Timeline" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Timeline</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted mt-1 text-sm">
            Piece together the sequence of events for this case.
          </p>
        </div>
      </div>

      <div className="relative pl-8">
        <div className="bg-border absolute top-2 bottom-2 left-[11px] w-0.5" aria-hidden="true" />

        <div className="relative pb-8">
          <span className="border-border bg-background absolute -left-[17px] flex h-6 w-6 items-center justify-center rounded-full border-2">
            <span className="bg-muted h-2 w-2 rounded-full" />
          </span>
          <div>
            <p className="text-foreground text-sm font-medium">Case Opened</p>
            <p className="text-muted text-xs">Pending</p>
          </div>
        </div>

        <div className="relative pb-8">
          <span className="border-border bg-background absolute -left-[17px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed">
            <span className="bg-muted h-2 w-2 rounded-full" />
          </span>
          <div>
            <p className="text-muted text-sm">Awaiting events...</p>
          </div>
        </div>
      </div>

      <Divider />

      <Card>
        <CardBody>
          <EmptyState
            icon={
              <svg
                width="28"
                height="28"
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
            }
            title="No Timeline Events"
            description="Events will be recorded here as you progress through the investigation."
          />
        </CardBody>
      </Card>
    </div>
  );
}
