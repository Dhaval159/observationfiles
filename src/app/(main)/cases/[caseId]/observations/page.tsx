"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";

export default function ObservationsPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Observations" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Observations</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted mt-1 text-sm">
            Review your observations and deductions for the case.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="primary" size="sm">
            New Observation
          </Button>
        </div>
      </div>

      <div className="max-w-sm">
        <SearchInput placeholder="Search observations..." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="bg-info-subtle text-info flex h-8 w-8 items-center justify-center rounded-lg">
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
              </span>
              <h3 className="text-sm font-semibold">Scene Observations</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-muted text-xs">
              Notes about the crime scene environment, physical layout, and notable details.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="bg-success-subtle text-success flex h-8 w-8 items-center justify-center rounded-lg">
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
              </span>
              <h3 className="text-sm font-semibold">Witness Observations</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-muted text-xs">
              Observations from witness interviews and suspect interactions.
            </p>
          </CardBody>
        </Card>
      </div>

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
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
            title="No Observations Recorded"
            description="Your observations will appear here as you investigate the case."
          />
        </CardBody>
      </Card>
    </div>
  );
}
