"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
  placeholder?: string;
}

export function CommandPalette({
  commands,
  placeholder = "Search commands...",
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboardShortcut({
    key: "k",
    modifiers: ["meta"],
    handler: () => setOpen((prev) => !prev),
  });

  useKeyboardShortcut({
    key: "k",
    modifiers: ["ctrl"],
    handler: () => setOpen((prev) => !prev),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) {
        setQuery("");
        setSelectedIndex(0);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].onSelect();
        setOpen(false);
      }
    },
    [filtered, selectedIndex],
  );

  if (!open) return null;

  return (
    <div
      className="z-modal fixed inset-0 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          "animate-scale-in border-border bg-surface-elevated relative w-full max-w-lg rounded-xl border shadow-2xl",
          "overflow-hidden",
        )}
        onKeyDown={handleKeyDown}
      >
        <div className="border-border flex items-center border-b px-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={placeholder}
            className="text-foreground placeholder:text-muted flex-1 bg-transparent px-3 py-3.5 text-sm focus:outline-none"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-muted px-3 py-8 text-center text-sm">No results found.</p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                type="button"
                onClick={() => {
                  cmd.onSelect();
                  setOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  i === selectedIndex
                    ? "bg-accent-subtle text-accent"
                    : "text-foreground hover:bg-interactive-hover",
                )}
              >
                {cmd.icon && <span className="shrink-0">{cmd.icon}</span>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{cmd.label}</p>
                  {cmd.description && (
                    <p className="text-muted truncate text-xs">{cmd.description}</p>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="border-border bg-surface text-muted shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px]">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
        <div className="border-border border-t px-4 py-2">
          <p className="text-muted text-xs">
            <kbd className="border-border bg-surface rounded border px-1 font-mono text-[10px]">
              ↑↓
            </kbd>{" "}
            Navigate{" "}
            <kbd className="border-border bg-surface rounded border px-1 font-mono text-[10px]">
              ↵
            </kbd>{" "}
            Select{" "}
            <kbd className="border-border bg-surface rounded border px-1 font-mono text-[10px]">
              Esc
            </kbd>{" "}
            Close
          </p>
        </div>
      </div>
    </div>
  );
}
