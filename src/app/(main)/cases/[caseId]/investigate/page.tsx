"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";

export default function InvestigatePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Investigate" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Investigation</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted mt-1 text-sm">
            Crime scene investigation and evidence collection.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="primary" size="sm">
            New Discovery
          </Button>
        </div>
      </div>

      <div className="max-w-sm">
        <SearchInput placeholder="Search locations and evidence..." />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <path d="M2 8V6a2 2 0 012-2h5l2 3h5a2 2 0 012 2v2" />
                </svg>
              }
              title="No Investigation Data"
              description="Begin investigating by exploring locations and collecting evidence."
              action={
                <Button variant="primary" size="sm">
                  Start Investigation
                </Button>
              }
            />
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Locations</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <div className="bg-surface-alt text-muted flex items-center gap-2 rounded-lg p-2.5 text-sm">
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                No locations discovered
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Discovered</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center py-4 text-center">
                <p className="text-foreground text-2xl font-bold">0</p>
                <p className="text-muted text-xs">Items Found</p>
              </div>
              <Divider />
              <div className="pt-3 text-center">
                <p className="text-muted text-xs">No discoveries yet</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
