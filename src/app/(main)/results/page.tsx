"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ResultsPage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Results" }]);
  }, [setBreadcrumbs]);

  return (
    <PageShell title="Results" description="View case outcomes, scores, and investigation reports.">
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
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            title="No Results Yet"
            description="Complete a case to view your investigation results, score, and detailed report here."
          />
        </CardBody>
      </Card>
    </PageShell>
  );
}
