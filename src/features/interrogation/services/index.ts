import type { EventEmitter } from "@/types/engine";
import type {
  InterrogationDefinition,
  DialogueNode,
  NPCInterrogationState,
  InterrogationSession,
} from "@/types/interrogation";
import type { ChoiceEvaluation, NodeEvaluation, InterrogationEngineState } from "../types";
import { evaluateConditions, getAvailableChoices, createInterrogationSession } from "../utils";

export class InterrogationEngine {
  private emitter: EventEmitter;
  private evidenceInventory: Set<string>;
  private state: InterrogationEngineState;

  constructor(emitter: EventEmitter, evidenceInventory?: Set<string>) {
    this.emitter = emitter;
    this.evidenceInventory = evidenceInventory ?? new Set();
    this.state = {
      sessions: new Map(),
      currentSession: null,
      definitions: new Map(),
    };
  }

  loadDefinition(definition: InterrogationDefinition): void {
    this.state.definitions.set(definition.id, definition);
  }

  startInterrogation(interrogationId: string, npcId: string, caseId: string): InterrogationSession {
    const definition = this.state.definitions.get(interrogationId);
    if (!definition) {
      throw new Error(`Interrogation definition "${interrogationId}" not found`);
    }

    const session = createInterrogationSession(
      interrogationId,
      npcId,
      caseId,
      definition.startingDialogueNodeId,
    );

    this.state.sessions.set(session.id, session);
    this.state.currentSession = session;
    this.emitter.emit("interrogation_started", { sessionId: session.id, npcId, interrogationId });
    return session;
  }

  getCurrentNode(): DialogueNode | null {
    const session = this.state.currentSession;
    if (!session) return null;

    const def = this.state.definitions.get(session.interrogationId);
    if (!def) return null;

    return def.dialogueNodes.find((n) => n.id === session.state.currentNodeId) ?? null;
  }

  getCurrentChoices(context: Record<string, unknown>): ChoiceEvaluation[] {
    const node = this.getCurrentNode();
    if (!node) return [];
    return getAvailableChoices(node, context);
  }

  selectChoice(choiceId: string): NodeEvaluation | null {
    const session = this.state.currentSession;
    if (!session) return null;

    const def = this.state.definitions.get(session.interrogationId);
    if (!def) return null;

    const currentNode = def.dialogueNodes.find((n) => n.id === session.state.currentNodeId);
    if (!currentNode) return null;

    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice) return null;

    if (choice.isLocked) return null;

    session.state.choiceHistory.push({
      nodeId: currentNode.id,
      choiceId,
      timestamp: new Date().toISOString(),
    });

    for (const action of currentNode.onExitActions) {
      this.executeActionOnSession(action, session);
    }

    if (choice.type === "present_evidence") {
      this.emitter.emit("evidence_presented", {
        sessionId: session.id,
        nodeId: currentNode.id,
        choiceId,
      });
    }

    const nextNodeId = choice.nextNodeId;
    const nextNode = def.dialogueNodes.find((n) => n.id === nextNodeId);
    if (!nextNode) return null;

    session.state.currentNodeId = nextNodeId;
    if (!session.state.visitedNodeIds.includes(nextNodeId)) {
      session.state.visitedNodeIds.push(nextNodeId);
    }

    for (const action of nextNode.onEnterActions) {
      this.executeActionOnSession(action, session);
    }

    this.emitter.emit("choice_selected", {
      sessionId: session.id,
      nodeId: currentNode.id,
      choiceId,
      nextNodeId,
    });
    this.emitter.emit("node_changed", {
      sessionId: session.id,
      nodeId: nextNodeId,
      previousNodeId: currentNode.id,
    });

    const choices = getAvailableChoices(nextNode, {});

    return {
      node: nextNode,
      choices,
      npcEmotion: nextNode.emotion,
      playerActions: nextNode.onEnterActions,
    };
  }

  presentEvidence(evidenceId: string): boolean {
    const session = this.state.currentSession;
    if (!session) return false;

    if (!this.evidenceInventory.has(evidenceId)) return false;

    const node = this.getCurrentNode();
    if (!node) return false;

    const evidenceChoice = node.choices.find((c) => c.type === "present_evidence" && !c.isLocked);
    if (!evidenceChoice) return false;

    session.state.evidencePresented.push(evidenceId);
    this.selectChoice(evidenceChoice.id);
    return true;
  }

  getCurrentNPCState(): NPCInterrogationState | null {
    return this.state.currentSession?.state ?? null;
  }

  adjustTrust(delta: number): void {
    const session = this.state.currentSession;
    if (!session) return;
    session.state.trustLevel = Math.max(0, Math.min(100, session.state.trustLevel + delta));
    this.emitter.emit("trust_changed", {
      sessionId: session.id,
      npcId: session.npcId,
      trustLevel: session.state.trustLevel,
      delta,
    });
  }

  adjustPressure(delta: number): void {
    const session = this.state.currentSession;
    if (!session) return;
    session.state.pressureLevel = Math.max(0, Math.min(100, session.state.pressureLevel + delta));
    this.emitter.emit("pressure_changed", {
      sessionId: session.id,
      npcId: session.npcId,
      pressureLevel: session.state.pressureLevel,
      delta,
    });
  }

  setNPCEmotion(emotion: string): void {
    const session = this.state.currentSession;
    if (!session) return;
    session.state.emotionalState = emotion;
    this.emitter.emit("emotion_changed", {
      sessionId: session.id,
      npcId: session.npcId,
      emotion,
    });
  }

  unlockQuestion(questionId: string): void {
    const session = this.state.currentSession;
    if (!session) return;
    if (!session.state.questionsUnlocked.includes(questionId)) {
      session.state.questionsUnlocked.push(questionId);
    }
  }

  markQuestionAsked(questionId: string): void {
    const session = this.state.currentSession;
    if (!session) return;
    if (!session.state.questionsAsked.includes(questionId)) {
      session.state.questionsAsked.push(questionId);
    }
  }

  recordContradiction(contradictionId: string): void {
    const session = this.state.currentSession;
    if (!session) return;
    if (!session.state.contradictionsFound.includes(contradictionId)) {
      session.state.contradictionsFound.push(contradictionId);
    }
  }

  isQuestionUnlocked(questionId: string): boolean {
    return this.state.currentSession?.state.questionsUnlocked.includes(questionId) ?? false;
  }

  isQuestionAsked(questionId: string): boolean {
    return this.state.currentSession?.state.questionsAsked.includes(questionId) ?? false;
  }

  endInterrogation(): void {
    const session = this.state.currentSession;
    if (!session) return;
    session.state.isComplete = true;
    session.state.completedAt = new Date().toISOString();
    session.endedAt = session.state.completedAt;
    this.emitter.emit("interrogation_ended", {
      sessionId: session.id,
      npcId: session.npcId,
      interrogationId: session.interrogationId,
    });
  }

  isComplete(): boolean {
    return this.state.currentSession?.state.isComplete ?? true;
  }

  getSession(sessionId: string): InterrogationSession | null {
    return this.state.sessions.get(sessionId) ?? null;
  }

  getNPCSessions(npcId: string): InterrogationSession[] {
    const sessions: InterrogationSession[] = [];
    for (const session of this.state.sessions.values()) {
      if (session.npcId === npcId) {
        sessions.push(session);
      }
    }
    return sessions;
  }

  canStartInterrogation(interrogationId: string, context: Record<string, unknown>): boolean {
    const def = this.state.definitions.get(interrogationId);
    if (!def) return false;
    if (!def.unlockCondition) return true;

    const condType = def.unlockCondition.type;
    if (condType === "custom") return true;

    const value = context[condType];
    if (value === true) return true;
    if (value === "completed" || value === "found" || value === "made") return true;

    return false;
  }

  serialize(): string {
    const data = {
      sessions: Array.from(this.state.sessions.entries()).map(([id, session]) => [
        id,
        {
          ...session,
          state: { ...session.state },
        },
      ]),
      currentSessionId: this.state.currentSession?.id ?? null,
      definitionIds: Array.from(this.state.definitions.keys()),
    };
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state.sessions = new Map(
      parsed.sessions.map(([id, session]: [string, InterrogationSession]) => [id, session]),
    );
    if (parsed.currentSessionId) {
      this.state.currentSession = this.state.sessions.get(parsed.currentSessionId) ?? null;
    }
  }

  reset(): void {
    this.state = {
      sessions: new Map(),
      currentSession: null,
      definitions: this.state.definitions,
    };
  }

  private executeActionOnSession(
    action: { type: string; target: string; value: unknown },
    session: InterrogationSession,
  ): void {
    switch (action.type) {
      case "adjust_trust":
        session.state.trustLevel = Math.max(
          0,
          Math.min(100, session.state.trustLevel + (action.value as number)),
        );
        break;
      case "adjust_pressure":
        session.state.pressureLevel = Math.max(
          0,
          Math.min(100, session.state.pressureLevel + (action.value as number)),
        );
        break;
      case "set_emotional_state":
        session.state.emotionalState = action.value as string;
        break;
      case "unlock_question":
        if (!session.state.questionsUnlocked.includes(action.target)) {
          session.state.questionsUnlocked.push(action.target);
        }
        break;
      case "unlock_observation":
      case "reveal_evidence":
      case "complete_objective":
      case "add_score":
      case "trigger_event":
      case "unlock_interrogation":
      case "custom":
        break;
    }
  }
}
