"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Divider } from "@/components/ui/divider";

export default function CasesPage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Cases" }]);
  }, [setBreadcrumbs]);

  return (
    <PageShell
      title="Cases"
      description="Browse and manage your detective cases."
      actions={
        <Button variant="primary" size="sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Case
        </Button>
      }
    >
      <div className="mb-6 max-w-sm">
        <SearchInput placeholder="Search cases..." />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCaseCard index={1} />
        <PlaceholderCaseCard index={2} />
        <PlaceholderCaseCard index={3} />
      </div>

      <Divider className="my-8" />

      <Card>
        <CardBody>
          <EmptyState
            icon={
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
                <path d="M2 8V6a2 2 0 012-2h5l2 3h5a2 2 0 012 2v2" />
              </svg>
            }
            title="Archived Cases"
            description="Completed and archived investigations will appear here."
          />
        </CardBody>
      </Card>
    </PageShell>
  );
}

function PlaceholderCaseCard({ index }: { index: number }) {
  const statuses = ["Active", "Pending", "Cold"] as const;
  const status = statuses[index % statuses.length];
  const badgeVariant =
    status === "Active" ? "success" : status === "Pending" ? "warning" : "default";

  return (
    <Card hover className="cursor-pointer">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="bg-accent-subtle text-accent flex h-8 w-8 items-center justify-center rounded-lg">
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
            </svg>
          </span>
          <h3 className="flex-1 truncate text-sm font-semibold">Case #{index + 1001}</h3>
          <Badge variant={badgeVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-muted line-clamp-2 text-sm">
          Placeholder case description. This area will display case details, objectives, and key
          information.
        </p>
        <div className="text-muted mt-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <svg
              width="12"
              height="12"
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
            Updated 2d ago
          </span>
          <span className="flex items-center gap-1">
            <svg
              width="12"
              height="12"
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
            0 evidence
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
