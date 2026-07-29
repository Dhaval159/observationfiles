"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  category: string;
  icon?: React.ReactNode;
}

const categories = ["Evidence", "NPCs", "Observations", "Timeline", "Locations", "Notes"];

export function QuickSearch() {
  const quickSearchOpen = useWorkspaceStore((s) => s.quickSearchOpen);
  const setQuickSearchOpen = useWorkspaceStore((s) => s.setQuickSearchOpen);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results] = useState<SearchResult[]>([]);

  useKeyboardShortcut({
    key: "f",
    modifiers: ["ctrl"],
    handler: () => {
      setQuery("");
      setQuickSearchOpen(true);
    },
  });

  const handleClose = useCallback(() => {
    setQuickSearchOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, [setQuickSearchOpen]);

  useEffect(() => {
    if (quickSearchOpen) {
      inputRef.current?.focus();
    }
  }, [quickSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!quickSearchOpen) return;
      if (e.key === "Escape") {
        handleClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [quickSearchOpen, results.length, handleClose]);

  if (!quickSearchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Quick search"
    >
      <div className="fixed inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />
      <div className="animate-fade-in relative w-full max-w-lg">
        <div className="border-border bg-surface overflow-hidden rounded-xl border shadow-xl">
          {/* Search input */}
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search evidence, NPCs, observations..."
              className="text-foreground placeholder:text-muted flex-1 bg-transparent text-sm focus:outline-none"
              aria-label="Search query"
            />
            <button
              type="button"
              onClick={handleClose}
              className="text-muted hover:bg-interactive-hover hover:text-foreground rounded px-1.5 py-0.5 text-[10px] transition-colors"
            >
              Esc
            </button>
          </div>

          {/* Categories */}
          <div className="border-border border-b px-4 py-2">
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="bg-surface-alt text-muted hover:bg-interactive-hover hover:text-foreground rounded-md px-2 py-0.5 text-[10px] transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="scrollable max-h-72">
            {results.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-8 text-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted mb-2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-muted text-xs">
                  {query
                    ? "No results found. Try a different search term."
                    : "Start typing to search across the investigation."}
                </p>
              </div>
            ) : (
              <ul role="listbox" aria-label="Search results">
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    role="option"
                    aria-selected={selectedIndex === index}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                      selectedIndex === index
                        ? "bg-accent-subtle text-accent"
                        : "text-foreground hover:bg-interactive-hover",
                    )}
                  >
                    {result.icon && <span className="shrink-0">{result.icon}</span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{result.label}</p>
                      {result.description && (
                        <p className="text-muted truncate text-xs">{result.description}</p>
                      )}
                    </div>
                    <span className="text-muted shrink-0 text-[10px]">{result.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-border text-muted flex items-center gap-3 border-t px-4 py-2 text-[10px]">
            <span className="flex items-center gap-1">
              <kbd className="border-border bg-background rounded border px-1 font-mono">↑↓</kbd>{" "}
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border-border bg-background rounded border px-1 font-mono">↵</kbd>{" "}
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="border-border bg-background rounded border px-1 font-mono">Esc</kbd>{" "}
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
