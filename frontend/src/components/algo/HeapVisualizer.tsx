import { motion } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

interface TreeNode {
  id: string;
  value: string;
  left?: string;
  right?: string;
  x?: number;
  y?: number;
}

export function HeapVisualizer({ step }: Props) {
  const tree = step.tree;
  if (!tree || !tree.nodes) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No heap data</p>
      </div>
    );
  }

  const nodes = tree.nodes;
  const visited = new Set(tree.visited ?? []);
  const currentNode = tree.current;

  // Build node map for quick lookup
  const nodeMap = new Map<string, TreeNode>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, { ...n });
  });

  // Calculate tree layout
  const calculateLayout = (
    nodeId: string | undefined,
    x: number,
    y: number,
    offset: number
  ): void => {
    if (!nodeId) return;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.left) {
      calculateLayout(node.left, x - offset, y + 60, offset / 2);
    }
    if (node.right) {
      calculateLayout(node.right, x + offset, y + 60, offset / 2);
    }
  };

  if (nodes.length > 0) {
    calculateLayout(nodes[0]?.id, 0, 20, 60);
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
      {/* Tree visualization */}
      <div className="relative w-full max-w-2xl">
        <svg
          viewBox="-200 0 400 500"
          preserveAspectRatio="xMidYMid meet"
          className="h-96 w-full"
          style={{ background: "transparent" }}
        >
          {/* Edges */}
          {nodes.map((node) => {
            const parent = nodeMap.get(node.id);
            if (!parent || parent.x === undefined || parent.y === undefined)
              return null;

            return (
              <g key={`edges-${node.id}`}>
                {node.left && (
                  <line
                    x1={parent.x}
                    y1={parent.y}
                    x2={nodeMap.get(node.left)?.x ?? 0}
                    y2={nodeMap.get(node.left)?.y ?? 0}
                    stroke="var(--border)"
                    strokeWidth="2"
                  />
                )}
                {node.right && (
                  <line
                    x1={parent.x}
                    y1={parent.y}
                    x2={nodeMap.get(node.right)?.x ?? 0}
                    y2={nodeMap.get(node.right)?.y ?? 0}
                    stroke="var(--border)"
                    strokeWidth="2"
                  />
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            if (node.x === undefined || node.y === undefined) return null;

            const isRoot = nodes[0]?.id === node.id;
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
              glowColor = "0 0 20px color-mix(in oklab, var(--neon-cyan) 60%, transparent)";
            } else if (isRoot) {
              fillColor = "color-mix(in oklab, var(--neon-amber) 20%, var(--panel))";
              strokeColor = "var(--neon-amber)";
              textColor = "var(--neon-amber)";
              glowColor = "0 0 16px color-mix(in oklab, var(--neon-amber) 50%, transparent)";
            } else if (isVisited) {
              fillColor = "color-mix(in oklab, var(--neon-green) 18%, var(--panel))";
              strokeColor = "var(--neon-green)";
              textColor = "var(--neon-green)";
              glowColor = "0 0 12px color-mix(in oklab, var(--neon-green) 40%, transparent)";
            }

            return (
              <g key={`node-${node.id}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2"
                  style={{
                    filter: glowColor ? `drop-shadow(${glowColor})` : "none",
                  }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="font-mono font-bold"
                  style={{
                    fontSize: "14px",
                    fill: textColor,
                  }}
                >
                  {node.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Array representation */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Heap Array
        </p>
        <div className="flex gap-2">
          {nodes.map((node, idx) => (
            <motion.div
              key={`arr-${node.id}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--panel)] font-mono text-xs font-semibold"
              style={{
                color:
                  currentNode === node.id
                    ? "var(--neon-cyan)"
                    : "var(--foreground)",
                borderColor:
                  currentNode === node.id
                    ? "var(--neon-cyan)"
                    : "var(--border)",
              }}
            >
              {node.value}
            </motion.div>
          ))}
        </div>
      </div>

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
