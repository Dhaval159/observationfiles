"use client";

import { useEffect } from "react";

type KeyModifier = "ctrl" | "meta" | "shift" | "alt";

interface ShortcutConfig {
  key: string;
  modifiers?: KeyModifier[];
  handler: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

export function useKeyboardShortcut(config: ShortcutConfig) {
  const { key, modifiers = [], handler, enabled = true } = config;
  const modifiersKey = modifiers.sort().join(",");

  useEffect(() => {
    if (!enabled) return;

    const listener = (e: KeyboardEvent) => {
      const ctrlOrMeta = modifiers.includes("ctrl") || modifiers.includes("meta");
      const shift = modifiers.includes("shift");
      const alt = modifiers.includes("alt");

      const ctrlMetaMatch = ctrlOrMeta ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
      const altMatch = alt ? e.altKey : !e.altKey;

      if (e.key.toLowerCase() === key.toLowerCase() && ctrlMetaMatch && shiftMatch && altMatch) {
        e.preventDefault();
        e.stopPropagation();
        handler(e);
      }
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [key, modifiersKey, handler, enabled, modifiers]);
}
