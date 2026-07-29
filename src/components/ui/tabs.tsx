"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: TabConfig[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

interface TabConfig {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
  content: ReactNode;
}

function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="border-border flex border-b" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150",
              "focus-ring rounded-t-lg",
              "disabled:pointer-events-none disabled:opacity-50",
              activeTab === tab.id ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.badge && (
              <span className="bg-accent-subtle text-accent rounded-md px-1.5 py-0.5 text-[10px]">
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="bg-foreground absolute inset-x-0 -bottom-px h-0.5" />
            )}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={tab.id}
          hidden={activeTab !== tab.id}
          className="pt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

export { Tabs, type TabsProps, type TabConfig };
