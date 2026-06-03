import { motion, AnimatePresence } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
  visualizerType: "bfs" | "dfs";
}

export function GraphVisualizer({ step, visualizerType }: Props) {
  const graph = step.graph;
  if (!graph) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No graph data</p>
      </div>
    );
  }

  const visited = new Set(graph.visited ?? []);
  const currentNode = graph.current;
  const queue = graph.queue ?? [];
  const stack = (step.graph as any)?.stack ?? graph.queue ?? [];

  // Layout nodes in a circle
  const nodeCount = graph.nodes.length;
  const radius = Math.min(150, Math.max(100, nodeCount * 30));
  const nodePositions: Record<string, { x: number; y: number }> = {};

  graph.nodes.forEach((node, idx) => {
    const angle = (idx / nodeCount) * Math.PI * 2;
    nodePositions[node.id] = {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
      {/* Graph visualization */}
      <div className="relative h-96 w-full max-w-md">
        <svg
          viewBox="-200 -200 400 400"
          className="h-full w-full"
          style={{ background: "transparent" }}
        >
          {/* Edges */}
          {graph.edges.map((edge, idx) => {
            const from = nodePositions[edge.from];
            const to = nodePositions[edge.to];
            if (!from || !to) return null;

            return (
              <line
                key={`edge-${idx}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--border)"
                strokeWidth="2"
              />
            );
          })}

          {/* Nodes */}
          <AnimatePresence>
            {graph.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isVisited = visited.has(node.id);
              const isCurrent = currentNode === node.id;

              let fillColor = "var(--panel)";
              let strokeColor = "var(--border)";
              let textColor = "var(--foreground)";
              let glowColor = "";

              if (isCurrent) {
                fillColor = "color-mix(in oklab, var(--neon-cyan) 25%, var(--panel))";
                strokeColor = "var(--neon-cyan)";
                textColor = "var(--neon-cyan)";
                glowColor = "0 0 24px color-mix(in oklab, var(--neon-cyan) 70%, transparent)";
              } else if (isVisited) {
                fillColor = "color-mix(in oklab, var(--neon-green) 20%, var(--panel))";
                strokeColor = "var(--neon-green)";
                textColor = "var(--neon-green)";
                glowColor = "0 0 16px color-mix(in oklab, var(--neon-green) 50%, transparent)";
              }

              return (
                <g key={`node-${node.id}`}>
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r="28"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    style={{
                      filter: glowColor ? `drop-shadow(${glowColor})` : "none",
                    }}
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-bold"
                    style={{
                      fontSize: "14px",
                      fill: textColor,
                    }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>

      {/* Queue/Stack display */}
      {(visualizerType === "bfs" ? queue : stack).length > 0 && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {visualizerType === "bfs" ? "Queue" : "Stack"}
          </p>
          <div className="flex gap-2">
            {(visualizerType === "bfs" ? queue : stack).map((nodeId, idx) => (
              <motion.div
                key={`${idx}-${nodeId}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex h-10 w-10 items-center justify-center rounded-md border font-mono text-xs font-semibold ${
                  visualizerType === "bfs"
                    ? "border-[var(--neon-amber)] bg-[color-mix(in_oklab,var(--neon-amber)_10%,var(--panel))] text-[var(--neon-amber)]"
                    : "border-[var(--neon-cyan)] bg-[color-mix(in_oklab,var(--neon-cyan)_10%,var(--panel))] text-[var(--neon-cyan)]"
                }`}
              >
                {nodeId}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Step info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-center"
      >
        <p className="font-mono text-sm text-muted-foreground">{step.action}</p>
        <p className="mt-2 text-xs text-muted-foreground">{step.explanation}</p>
      </motion.div>
    </div>
  );
}
