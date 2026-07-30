"use client";

import { Panel } from "./panel";
import { useWorkspaceStore } from "@/features/workspace/store/workspace-store";
import { useConversation } from "@/features/dialogue/hooks/use-dialogue-engine";

export function WitnessesPanel() {
  const caseId = "case-poisoned-pinot";
  const playerId = "player_1";
  const setActivePanel = useWorkspaceStore((s) => s.setActivePanel);

  const vanceDialogue = useConversation({ caseId, npcId: "npc-vance", playerId });

  const witnesses = [
    {
      id: "npc-vance",
      name: "Dr. Marcus Vance",
      role: "Medical Examiner / Guest",
      statement:
        "Confirmed cyanide poisoning. Estimates death occurred between 9:00 PM and 9:15 PM.",
      credibility: "High (Independent expert guest)",
      dialogue: vanceDialogue,
      color: "border-teal-500/30",
    },
  ];

  const handleStartDialogue = async (npcId: string, dialogueHook: typeof vanceDialogue) => {
    await dialogueHook.start();
    setActivePanel("dialogue");
  };

  return (
    <Panel panelId="witnesses" header="Witnesses" variant="ghost">
      <div className="space-y-4 p-4">
        <p className="text-muted text-xs">
          Examine witness statements and ask them technical questions to build your case timeline.
        </p>

        <div className="grid gap-4">
          {witnesses.map((wit) => (
            <div
              key={wit.id}
              className={`bg-surface border-border flex flex-col justify-between rounded-lg border p-4 ${wit.color}`}
            >
              <div>
                <h3 className="text-foreground flex items-center justify-between text-sm font-semibold">
                  <span>{wit.name}</span>
                  <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    {wit.role}
                  </span>
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-muted font-medium">Testimony Summary:</span>
                    <p className="text-foreground mt-0.5">{wit.statement}</p>
                  </div>
                  <div>
                    <span className="text-muted font-medium">Credibility Rating:</span>
                    <span className="text-foreground ml-1.5">{wit.credibility}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleStartDialogue(wit.id, wit.dialogue)}
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
                  Consult Witness
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
