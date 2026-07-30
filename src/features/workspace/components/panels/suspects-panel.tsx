"use client";

import { Panel } from "./panel";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useConversation } from "@/features/dialogue/hooks/use-dialogue-engine";

export function SuspectsPanel() {
  const caseId = "case-poisoned-pinot";
  const playerId = "player_1";
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);

  const arthurDialogue = useConversation({ caseId, npcId: "npc-arthur", playerId });
  const elenaDialogue = useConversation({ caseId, npcId: "npc-elena", playerId });

  const suspects = [
    {
      id: "npc-arthur",
      name: "Arthur Sterling",
      role: "Winery Owner / Proprietor",
      alibi: "In his Private Office reviewing sales ledgers. Claims he never left.",
      motive: "Threatened with guild exposure regarding counterfeit vintages.",
      dialogue: arthurDialogue,
      stress: "High (Hands trembling, twisting ring)",
      color: "border-destructive/30",
    },
    {
      id: "npc-elena",
      name: "Elena Rostova",
      role: "Assistant Sommelier",
      alibi: "Serving dinner in Tasting Room, found body when checking on Julien.",
      motive: "Resentment over Julien's management, or holds secrets about Arthur.",
      dialogue: elenaDialogue,
      stress: "Medium (Grieving, cooperative)",
      color: "border-orange-500/30",
    },
  ];

  const handleStartDialogue = async (npcId: string, dialogueHook: typeof arthurDialogue) => {
    await dialogueHook.start();
    setActivePanel("dialogue");
  };

  return (
    <Panel panelId="suspects" header="Suspects" variant="ghost">
      <div className="space-y-4 p-4">
        <p className="text-muted text-xs">
          Examine suspect backgrounds, cross-examine them, and present evidence to crack their
          alibis.
        </p>

        <div className="grid gap-4">
          {suspects.map((sus) => (
            <div
              key={sus.id}
              className={`bg-surface border-border flex flex-col justify-between rounded-lg border p-4 ${sus.color}`}
            >
              <div>
                <h3 className="text-foreground flex items-center justify-between text-sm font-semibold">
                  <span>{sus.name}</span>
                  <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    {sus.role}
                  </span>
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-muted font-medium">Stated Alibi:</span>
                    <p className="text-foreground mt-0.5">{sus.alibi}</p>
                  </div>
                  <div>
                    <span className="text-muted font-medium">Suspected Motive:</span>
                    <p className="text-foreground mt-0.5">{sus.motive}</p>
                  </div>
                  <div>
                    <span className="text-muted font-medium">Stress Level:</span>
                    <span className="text-foreground ml-1.5">{sus.stress}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleStartDialogue(sus.id, sus.dialogue)}
                  className="bg-accent hover:bg-accent-hover text-accent-foreground flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Interrogate Suspect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
