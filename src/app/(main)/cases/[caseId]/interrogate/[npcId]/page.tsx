"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";

export default function InterrogatePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const npcId = params.npcId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: caseId, href: `/cases/${caseId}` },
      { label: "Interrogation" },
    ]);
  }, [caseId, setBreadcrumbs]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">Interrogation</h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted mt-1 text-sm">
            Question witnesses and suspects to uncover the truth.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="flex flex-col items-center py-10 text-center">
              <Avatar size="xl" name="Witness" className="mb-4" />
              <h3 className="text-foreground text-lg font-semibold">Witness Profile</h3>
              <p className="text-muted text-sm">NPC ID: {npcId}</p>
              <Badge variant="default" className="mt-2">
                Unknown Status
              </Badge>
              <Divider className="my-4 w-24" />
              <p className="text-muted max-w-sm text-sm">
                Witness background, relationship to the case, and available interrogation options
                will appear here.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Dialogue Options</h3>
            </CardHeader>
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
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                }
                title="No Dialogue Available"
                description="Interrogation dialogue options will be displayed here."
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Interrogation Info</h3>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div>
                <span className="text-muted">NPC</span>
                <p className="text-foreground truncate font-medium">{npcId}</p>
              </div>
              <div>
                <span className="text-muted">Relationship</span>
                <p className="text-foreground font-medium">Unknown</p>
              </div>
              <div>
                <span className="text-muted">Statements</span>
                <p className="text-foreground font-medium">0</p>
              </div>
              <div>
                <span className="text-muted">Contradictions</span>
                <p className="text-foreground font-medium">0</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Available Evidence</h3>
            </CardHeader>
            <CardBody>
              <p className="text-muted text-xs">
                Evidence items that can be presented during interrogation will appear here.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
