"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Profile" }]);
  }, [setBreadcrumbs]);

  return (
    <PageShell title="Profile" description="Manage your detective profile and personal settings.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardBody className="flex flex-col items-center py-8 text-center">
              <Avatar size="xl" name="Detective" className="mb-4" />
              <h3 className="text-foreground text-lg font-semibold">Detective</h3>
              <p className="text-muted text-sm">detective@observation.files</p>
              <Badge variant="accent" className="mt-2">
                Active Detective
              </Badge>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Edit Profile
              </Button>
            </CardBody>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <h3 className="text-sm font-semibold">Statistics</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Cases Solved</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Cases Started</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Evidence Collected</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Observations Made</span>
                  <span className="font-medium">0</span>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <span className="text-muted">Playtime</span>
                  <span className="font-medium">0h</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Activity History</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Skeleton variant="text" className="h-10" />
                <Skeleton variant="text" className="h-10" />
                <Skeleton variant="text" className="h-10 w-3/4" />
                <Skeleton variant="text" className="h-10" />
              </div>
              <p className="text-muted mt-3 text-xs">
                Activity log will appear here as you investigate cases.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Current Streak</h3>
            </CardHeader>
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="bg-surface-alt flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-muted text-2xl font-bold">0</span>
                </div>
                <div>
                  <p className="text-muted text-sm">Days active</p>
                  <p className="text-muted text-xs">Start investigating to build your streak.</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold">Recent Cases</h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center py-6 text-center">
                <span className="text-muted mb-2">
                  <svg
                    width="20"
                    height="20"
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
                </span>
                <p className="text-muted text-sm">No cases yet</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
