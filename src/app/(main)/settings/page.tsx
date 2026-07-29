"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@/stores/navigation-store";
import { PageShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";

export default function SettingsPage() {
  const setBreadcrumbs = useNavigationStore((s) => s.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs([{ label: "Settings" }]);
  }, [setBreadcrumbs]);

  const tabs = [
    {
      id: "general",
      label: "General",
      content: <GeneralTab />,
    },
    {
      id: "audio",
      label: "Audio",
      content: <AudioTab />,
    },
    {
      id: "gameplay",
      label: "Gameplay",
      content: <GameplayTab />,
    },
    {
      id: "accessibility",
      label: "Accessibility",
      content: <AccessibilityTab />,
    },
  ];

  return (
    <PageShell title="Settings" description="Configure your application preferences.">
      <Tabs tabs={tabs} defaultTab="general" />
    </PageShell>
  );
}

function GeneralTab() {
  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Display</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="Theme"
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" },
            ]}
            placeholder="Select theme"
          />
          <Select
            label="Language"
            options={[{ value: "en", label: "English" }]}
            placeholder="Select language"
          />
          <Select
            label="Font Size"
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
            placeholder="Select font size"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Privacy</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Switch label="Share analytics" />
          <Switch label="Share progress" />
          <Switch label="Show online status" />
        </CardBody>
      </Card>
    </div>
  );
}

function AudioTab() {
  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Volume</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-foreground text-sm font-medium">Master Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={80}
              className="accent-foreground w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-foreground text-sm font-medium">Music Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={70}
              className="accent-foreground w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-foreground text-sm font-medium">SFX Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={80}
              className="accent-foreground w-full"
            />
          </div>
          <Switch label="Ambient sounds enabled" defaultChecked />
        </CardBody>
      </Card>
    </div>
  );
}

function GameplayTab() {
  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Preferences</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Switch label="Auto-save progress" defaultChecked />
          <Switch label="Show tutorials" defaultChecked />
          <Switch label="Confirm actions" defaultChecked />
          <Switch label="Show timestamps" defaultChecked />
          <Switch label="Auto-play dialogue" />
        </CardBody>
      </Card>
    </div>
  );
}

function AccessibilityTab() {
  return (
    <div className="max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold">Accessibility</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Switch label="Screen reader support" />
          <Select
            label="Subtitle Size"
            options={[
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
            placeholder="Select size"
          />
          <Switch label="High contrast text" />
          <Select
            label="Color Blind Mode"
            options={[
              { value: "none", label: "None" },
              { value: "deuteranopia", label: "Deuteranopia" },
              { value: "protanopia", label: "Protanopia" },
              { value: "tritanopia", label: "Tritanopia" },
            ]}
            placeholder="Select mode"
          />
          <Switch label="Focus indicator" defaultChecked />
        </CardBody>
      </Card>
    </div>
  );
}
