"use client";

import { Panel } from "./panel";
import { useDialogue, useDialogueEngine } from "@/features/dialogue/hooks/use-dialogue-engine";
import { useEngineDialogueStore } from "@/stores/engine-dialogue-store";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
export function DialoguePanel() {
  const caseId = "case-poisoned-pinot";
  const playerId = "player_1";
  const store = useEngineDialogueStore();
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);

  const { selectChoice, availableChoices } = useDialogue();
  const engine = useDialogueEngine();

  const isActive = store.isActive;
  const history = store.conversationHistory;
  const npcId = store.currentNpcId;

  // Retrieve NPC stats
  const npcState = npcId ? engine.getNPCState(npcId) : null;

  const handleEndConversation = async () => {
    if (!npcId) return;
    const result = await engine.endDialogue(caseId, npcId, playerId, "completed");
    if (result.success) {
      store.setActive(false);
      store.setCurrentNode(null);
    }
  };

  const handleSelectChoice = async (choiceId: string) => {
    await selectChoice(choiceId);
  };

  if (!isActive || !npcId) {
    return (
      <Panel panelId="dialogue" header="Interrogation Chamber" variant="ghost">
        <div className="text-muted flex h-full flex-col items-center justify-center p-8 text-center text-xs">
          <svg
            className="text-muted-foreground mb-3 h-12 w-12 animate-pulse opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-foreground mb-1 text-sm font-medium">No Active Interrogation</span>
          <p className="max-w-xs leading-relaxed">
            Go to the{" "}
            <button
              onClick={() => setActivePanel("suspects")}
              className="text-accent font-semibold underline"
            >
              Suspects
            </button>{" "}
            or{" "}
            <button
              onClick={() => setActivePanel("witnesses")}
              className="text-accent font-semibold underline"
            >
              Witnesses
            </button>{" "}
            tab to start questioning people at this location.
          </p>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      panelId="dialogue"
      header={`Questioning: ${npcState?.name || "NPC"}`}
      badge={availableChoices.length}
      variant="ghost"
    >
      <div className="flex h-[480px] flex-col">
        {/* NPC Profile Bar */}
        <div className="bg-surface-alt border-border flex items-center justify-between border-b p-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-ping rounded-full bg-green-500"></div>
            <span className="text-foreground font-semibold">{npcState?.name}</span>
            <span className="text-muted-foreground text-[10px]">({npcState?.role})</span>
          </div>
          <div className="flex gap-4">
            <span className="text-muted text-[11px]">
              Mood:{" "}
              <strong className="text-foreground capitalize">{npcState?.mood || "Neutral"}</strong>
            </span>
            <span className="text-muted text-[11px]">
              Suspicion: <strong className="text-orange-400">{npcState?.suspicion || 0}%</strong>
            </span>
            <span className="text-muted text-[11px]">
              Trust: <strong className="text-teal-400">{npcState?.trust || 50}%</strong>
            </span>
          </div>
        </div>

        {/* Conversation Log */}
        <div className="scrollable bg-background-alt flex-1 space-y-4 overflow-y-auto p-4">
          {history.map((log, index) => {
            const isPlayer = log.speaker === "player";
            return (
              <div
                key={`${log.nodeId}-${index}`}
                className={`flex max-w-[85%] flex-col ${isPlayer ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <span className="text-muted-foreground mb-1 text-[10px]">
                  {isPlayer ? "Detective" : npcState?.name} •{" "}
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <div
                  className={`rounded-lg p-3 text-xs leading-relaxed ${
                    isPlayer
                      ? "bg-accent text-accent-foreground rounded-tr-none"
                      : "bg-surface text-foreground border-border rounded-tl-none border font-serif"
                  }`}
                >
                  {log.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Choices & Present List */}
        <div className="border-border bg-surface space-y-3 border-t p-4">
          {availableChoices.length === 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-muted text-xs">Conversation finished.</span>
              <button
                type="button"
                onClick={handleEndConversation}
                className="bg-accent hover:bg-accent-hover text-accent-foreground rounded-md px-4 py-2 text-xs font-semibold shadow"
              >
                End Questioning
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-muted mb-1 block text-[10px] font-semibold tracking-wider uppercase">
                Choose Question:
              </span>
              <div className="grid gap-2">
                {availableChoices.map((choice) => {
                  const isEvidenceType = choice.text.includes("[Present");
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleSelectChoice(choice.id)}
                      className={`flex w-full items-center justify-between rounded border p-2.5 text-left text-xs transition-colors ${
                        isEvidenceType
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                          : "bg-surface border-border hover:bg-interactive-hover text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isEvidenceType ? (
                          <svg
                            className="h-3.5 w-3.5 flex-shrink-0 text-amber-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ) : (
                          <svg
                            className="text-accent h-3.5 w-3.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {choice.text}
                      </span>
                      <svg
                        className="text-muted h-3.5 w-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleEndConversation}
                  className="bg-surface-alt hover:bg-interactive-hover border-border text-foreground rounded-md border px-4 py-1.5 text-xs font-semibold transition-colors"
                >
                  End Questioning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
