import type { EventEmitter } from "@/types/engine";
import type { DialogueTree, DialogueState } from "@/types/dialogue";
import type { DialogueNode } from "@/types/interrogation";
import type { ChoiceEvaluation, NodeEvaluation } from "@/features/interrogation/types";
import { findNode } from "../utils";
import {
  evaluateConditions,
  getAvailableChoices,
  executeDialogueAction,
} from "@/features/interrogation/utils";

export class DialogueEngine {
  private emitter: EventEmitter;
  private trees: Map<string, DialogueTree>;
  private state: DialogueState | null;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.trees = new Map();
    this.state = null;
  }

  loadTree(tree: DialogueTree): void {
    this.trees.set(tree.id, tree);
  }

  startDialogue(treeId: string): DialogueState {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Dialogue tree "${treeId}" not found`);
    }

    this.state = {
      treeId,
      currentNodeId: tree.rootNodeId,
      visitedNodes: new Set([tree.rootNodeId]),
      availableChoices: [],
      choiceHistory: [],
      isActive: true,
    };

    this.emitter.emit("dialogue_started", { treeId, nodeId: tree.rootNodeId });
    return this.state;
  }

  getCurrentNode(): DialogueNode | null {
    if (!this.state) return null;

    const tree = this.trees.get(this.state.treeId);
    if (!tree) return null;

    return findNode(tree, this.state.currentNodeId);
  }

  getChoices(context: Record<string, unknown>): ChoiceEvaluation[] {
    const node = this.getCurrentNode();
    if (!node) return [];
    return getAvailableChoices(node, context);
  }

  selectChoice(choiceId: string, context: Record<string, unknown>): NodeEvaluation | null {
    if (!this.state) return null;

    const tree = this.trees.get(this.state.treeId);
    if (!tree) return null;

    const currentNode = findNode(tree, this.state.currentNodeId);
    if (!currentNode) return null;

    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice || choice.isLocked) return null;

    const conditionsMet = evaluateConditions(choice.conditions, context);
    if (!conditionsMet) return null;

    this.state.choiceHistory.push({
      nodeId: currentNode.id,
      choiceId,
    });

    for (const action of currentNode.onExitActions) {
      context = executeDialogueAction(action, context);
    }

    const nextNode = findNode(tree, choice.nextNodeId);
    if (!nextNode) return null;

    this.state.currentNodeId = nextNode.id;
    if (!this.state.visitedNodes.has(nextNode.id)) {
      this.state.visitedNodes.add(nextNode.id);
    }

    for (const action of nextNode.onEnterActions) {
      context = executeDialogueAction(action, context);
    }

    const choices = getAvailableChoices(nextNode, context);

    this.emitter.emit("dialogue_node_changed", {
      treeId: tree.id,
      nodeId: nextNode.id,
      previousNodeId: currentNode.id,
    });
    this.emitter.emit("dialogue_choice_selected", {
      treeId: tree.id,
      nodeId: currentNode.id,
      choiceId,
      nextNodeId: nextNode.id,
    });

    return {
      node: nextNode,
      choices,
      npcEmotion: nextNode.emotion,
      playerActions: nextNode.onEnterActions,
    };
  }

  canAdvance(): boolean {
    if (!this.state) return false;

    const node = this.getCurrentNode();
    if (!node) return false;

    return node.choices.length > 0 || node.nextNodeId !== null;
  }

  isAtEnd(): boolean {
    if (!this.state) return true;

    const node = this.getCurrentNode();
    if (!node) return true;

    return !node.nextNodeId && node.choices.length === 0;
  }

  getDialoguePath(): { nodeId: string; choiceId: string }[] {
    return this.state?.choiceHistory ?? [];
  }

  serialize(): string {
    const data = {
      treeIds: Array.from(this.trees.keys()),
      state: this.state
        ? {
            ...this.state,
            visitedNodes: Array.from(this.state.visitedNodes),
          }
        : null,
    };
    return JSON.stringify(data);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    if (parsed.state) {
      this.state = {
        ...parsed.state,
        visitedNodes: new Set(parsed.state.visitedNodes),
      };
    }
  }

  reset(): void {
    this.state = null;
  }
}
