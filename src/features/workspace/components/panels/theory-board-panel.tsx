"use client";

import { Panel } from "./panel";
import { useTheoryBoard, useTheoryBoardEngine } from "@/features/theory-board/hooks";
import { useState } from "react";
import type { TheoryNodeType, TheoryConnectionType } from "@/features/theory-board/types";

export function TheoryBoardPanel() {
  const caseId = "case-poisoned-pinot";
  const userId = "dev_detective";

  const { nodes, connections } = useTheoryBoard(caseId);
  const engine = useTheoryBoardEngine();

  // Local form state
  const [nodeType, setNodeType] = useState<TheoryNodeType>("suspect");
  const [nodeLabel, setNodeLabel] = useState<string>("");
  const [nodeDesc, setNodeDesc] = useState<string>("");

  const [sourceNodeId, setSourceNodeId] = useState<string>("");
  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [connLabel, setConnLabel] = useState<string>("");
  const [connType, setConnType] = useState<TheoryConnectionType>("supports");

  const [validationReport, setValidationReport] = useState<string[]>([]);
  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Initialize board if null
  if (!engine.getBoard()) {
    try {
      engine.createBoard(caseId, userId);
    } catch (e) {
      console.error(e);
    }
  }

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeLabel) return;

    try {
      engine.addNode({
        type: nodeType,
        label: nodeLabel,
        description: nodeDesc,
        x: Math.random() * 500,
        y: Math.random() * 500,
      });

      setNodeLabel("");
      setNodeDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceNodeId || !targetNodeId) return;

    try {
      engine.addConnection({
        sourceNodeId,
        targetNodeId,
        label: connLabel || connType,
        type: connType,
        isBidirectional: false,
      });

      setConnLabel("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveNode = (id: string) => {
    engine.removeNode(id);
  };

  const handleRemoveConnection = (id: string) => {
    engine.removeConnection(id);
  };

  const handleValidateTheory = () => {
    const results = engine.validate();
    setIsValidated(true);
    if (results.length === 0) {
      setValidationReport([
        "Theory board is logically sound! Connections match valid case theories.",
      ]);
    } else {
      setValidationReport(results.map((r) => r.message));
    }
  };

  const handleClearBoard = () => {
    engine.clearBoard();
    setIsValidated(false);
    setValidationReport([]);
  };

  return (
    <Panel
      panelId="theory-board"
      header="Theory Graph Builder"
      badge={nodes.length}
      variant="ghost"
    >
      <div className="border-border flex h-full min-h-[500px] border-t">
        {/* Left canvas controls */}
        <div className="border-border scrollable w-7/12 space-y-4 overflow-y-auto border-r p-4">
          <div className="flex items-center justify-between">
            <p className="text-muted text-[11px]">
              Pin nodes and link them together to construct your case theory.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleValidateTheory}
                className="bg-accent hover:bg-accent-hover text-accent-foreground rounded px-3 py-1.5 text-xs font-semibold shadow transition-colors"
              >
                Validate Board
              </button>
              <button
                type="button"
                onClick={handleClearBoard}
                className="bg-surface-alt hover:bg-interactive-hover border-border text-foreground rounded border px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Render Validation Report */}
          {isValidated && (
            <div
              className={`space-y-1 rounded-lg border p-3 text-xs ${
                validationReport[0]?.includes("sound")
                  ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
                  : "border-destructive/20 bg-destructive-subtle text-destructive"
              }`}
            >
              <span className="block font-semibold">Deductive Integrity Check:</span>
              <ul className="list-disc space-y-0.5 pl-4 text-[11px]">
                {validationReport.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Node Grid */}
          <div className="space-y-3">
            <span className="text-muted text-[10px] font-semibold tracking-wider uppercase">
              Theory Nodes ({nodes.length})
            </span>
            {nodes.length === 0 ? (
              <div className="text-muted bg-surface border-border rounded-lg border py-12 text-center text-xs">
                No cards pinned. Use the sidebar panels to add elements to your board.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="border-border bg-surface relative flex flex-col justify-between rounded-lg border p-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveNode(node.id)}
                      className="text-muted hover:text-destructive absolute top-2 right-2 text-xs"
                      aria-label="Remove node"
                    >
                      ×
                    </button>
                    <div>
                      <span className="bg-surface-alt border-border text-muted py-0.2 rounded border px-1.5 text-[9px] font-semibold capitalize uppercase">
                        {node.type}
                      </span>
                      <h4 className="text-foreground mt-1.5 text-xs leading-snug font-semibold">
                        {node.label}
                      </h4>
                      <p className="text-muted mt-0.5 truncate text-[10px] leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connections List */}
          <div className="space-y-3">
            <span className="text-muted text-[10px] font-semibold tracking-wider uppercase">
              Relationship Connections ({connections.length})
            </span>
            {connections.length === 0 ? (
              <div className="text-muted bg-surface border-border rounded-lg border py-6 text-center text-xs">
                No connection links defined yet.
              </div>
            ) : (
              <div className="space-y-2">
                {connections.map((c) => {
                  const source = nodes.find((n) => n.id === c.sourceNodeId)?.label || "Unknown";
                  const target = nodes.find((n) => n.id === c.targetNodeId)?.label || "Unknown";
                  return (
                    <div
                      key={c.id}
                      className="border-border bg-surface flex items-center justify-between rounded border p-2.5 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="text-foreground">{source}</strong>
                        <span className="bg-accent-subtle text-accent py-0.2 rounded px-1.5 font-mono text-[10px] font-semibold capitalize">
                          {c.type}
                        </span>
                        <strong className="text-foreground">{target}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveConnection(c.id)}
                        className="text-muted hover:text-destructive px-1.5 text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Form Sidebar */}
        <div className="scrollable bg-surface-alt w-5/12 space-y-5 overflow-y-auto p-4">
          {/* Card Form */}
          <form onSubmit={handleAddNode} className="space-y-3">
            <span className="text-foreground border-border block border-b pb-1 text-xs font-semibold">
              Pin Concept Card
            </span>

            <div className="space-y-1">
              <label htmlFor="nodeType" className="text-muted block text-[10px] uppercase">
                Card Type
              </label>
              <select
                id="nodeType"
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value as TheoryNodeType)}
                className="bg-surface border-border text-foreground w-full rounded border p-2 text-xs"
              >
                <option value="suspect">Suspect</option>
                <option value="evidence">Evidence</option>
                <option value="observation">Observation</option>
                <option value="location">Location</option>
                <option value="motive">Motive</option>
                <option value="theory">Hypothesis</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="nodeLabel" className="text-muted block text-[10px] uppercase">
                Card Label / Name
              </label>
              <input
                id="nodeLabel"
                type="text"
                value={nodeLabel}
                onChange={(e) => setNodeLabel(e.target.value)}
                placeholder="e.g. Arthur Sterling"
                className="bg-surface border-border text-foreground w-full rounded border p-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="nodeDesc" className="text-muted block text-[10px] uppercase">
                Description / Notes
              </label>
              <textarea
                id="nodeDesc"
                value={nodeDesc}
                onChange={(e) => setNodeDesc(e.target.value)}
                placeholder="Brief explanatory detail..."
                className="bg-surface border-border text-foreground h-16 w-full resize-none rounded border p-2 text-xs"
              />
            </div>

            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-accent-foreground w-full rounded p-2 text-xs font-semibold shadow transition-colors"
            >
              Pin Card
            </button>
          </form>

          {/* Connection Form */}
          <form onSubmit={handleAddConnection} className="border-border space-y-3 border-t pt-3">
            <span className="text-foreground border-border block border-b pb-1 text-xs font-semibold">
              Link Connections
            </span>

            <div className="space-y-1">
              <label htmlFor="sourceNode" className="text-muted block text-[10px] uppercase">
                Source Node
              </label>
              <select
                id="sourceNode"
                value={sourceNodeId}
                onChange={(e) => setSourceNodeId(e.target.value)}
                className="bg-surface border-border text-foreground w-full rounded border p-2 text-xs"
              >
                <option value="">-- Select Source --</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="connType" className="text-muted block text-[10px] uppercase">
                Relationship
              </label>
              <select
                id="connType"
                value={connType}
                onChange={(e) => setConnType(e.target.value as TheoryConnectionType)}
                className="bg-surface border-border text-foreground w-full rounded border p-2 text-xs"
              >
                <option value="supports">Supports</option>
                <option value="contradicts">Contradicts</option>
                <option value="relates_to">Relates to</option>
                <option value="leads_to">Leads to</option>
                <option value="implies">Implies</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="targetNode" className="text-muted block text-[10px] uppercase">
                Target Node
              </label>
              <select
                id="targetNode"
                value={targetNodeId}
                onChange={(e) => setTargetNodeId(e.target.value)}
                className="bg-surface border-border text-foreground w-full rounded border p-2 text-xs"
              >
                <option value="">-- Select Target --</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-accent-foreground w-full rounded p-2 text-xs font-semibold shadow transition-colors"
            >
              Establish Link
            </button>
          </form>
        </div>
      </div>
    </Panel>
  );
}
