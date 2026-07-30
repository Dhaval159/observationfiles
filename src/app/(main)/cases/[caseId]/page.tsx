"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigationStore } from "@/stores/navigation-store";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Divider } from "@/components/ui/divider";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  const isPoisonedPinot = caseId === "case-poisoned-pinot";

  useEffect(() => {
    setBreadcrumbs([
      { label: "Cases", href: "/cases" },
      { label: isPoisonedPinot ? "The Poisoned Pinot" : caseId },
    ]);
  }, [caseId, setBreadcrumbs, isPoisonedPinot]);

  const handleStart = () => {
    window.location.href = `/cases/${caseId}/workspace`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {isPoisonedPinot ? "The Poisoned Pinot" : "Case Overview"}
            </h1>
            <Badge variant="info">Case #{caseId}</Badge>
          </div>
          <p className="text-muted text-sm">
            {isPoisonedPinot
              ? "Sommelier Julien Croft is dead next to a Chateau Latour 1945 bottle. Expose the murderer."
              : "Review case details, objectives, and overall progress."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleStart}>
            Start Investigation
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
                  <p className="text-foreground font-medium">Available</p>
                </div>
                <div>
                  <span className="text-muted">Difficulty</span>
                  <p className="text-foreground font-medium">Intermediate</p>
                </div>
                <div>
                  <span className="text-muted">Location</span>
                  <p className="text-foreground font-medium">Grand Cru Estate Winery</p>
                </div>
                <div>
                  <span className="text-muted">Time Period</span>
                  <p className="text-foreground font-medium">Modern Noir</p>
                </div>
              </div>
              <Divider />
              <div>
                <span className="text-muted text-sm">Description</span>
                <p className="text-foreground mt-1 text-sm leading-relaxed">
                  {isPoisonedPinot
                    ? "Head Sommelier Julien Croft is found dead on the cold subterranean cellar floor next to a broken wine glass and an opened bottle of 1945 Chateau Latour. Dr. Marcus Vance is guest-diagnosing cyanic asphyxiation. Suspicion falls upon winery proprietor Arthur Sterling, who has locked his office, and assistant sommelier Elena Rostova."
                    : "Case description and background information will appear here."}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Primary Objectives</h3>
            </CardHeader>
            <CardBody className="space-y-3 text-xs">
              <div className="text-foreground bg-surface border-border flex items-center gap-2 rounded border p-2 font-medium">
                <div className="bg-accent h-1.5 w-1.5 rounded-full"></div>
                Investigate the Wine Cellar crime scene
              </div>
              <div className="text-foreground bg-surface border-border flex items-center gap-2 rounded border p-2 font-medium">
                <div className="bg-accent h-1.5 w-1.5 rounded-full"></div>
                Interrogate suspects Arthur Sterling and Elena Rostova
              </div>
              <div className="text-foreground bg-surface border-border flex items-center gap-2 rounded border p-2 font-medium">
                <div className="bg-accent h-1.5 w-1.5 rounded-full"></div>
                Identify the potassium cyanide source and delivery method
              </div>
              <div className="text-foreground bg-surface border-border flex items-center gap-2 rounded border p-2 font-medium">
                <div className="bg-accent h-1.5 w-1.5 rounded-full"></div>
                Expose the murderer&apos;s counterfeiting motive
              </div>
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
                  <span className="text-muted">Evidence Items</span>
                  <span>7 Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Hotspot Clues</span>
                  <span>9 Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Suspects & Witnesses</span>
                  <span>3 Total</span>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleStart}
              >
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
                Launch Workspace
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
