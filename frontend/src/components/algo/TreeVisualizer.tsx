import { motion } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

interface LayoutNode {
  id: string;
  value: string;
  left?: string;
  right?: string;
  x: number;
  y: number;
}

export function TreeVisualizer({ step }: Props) {
  const tree = step.tree;

  if (!tree || !tree.nodes || tree.nodes.length === 0) {
    return (
      <div className="flex h-full w-full items-center 
        justify-center">
        <p className="text-muted-foreground">
          No tree data
        </p>
      </div>
    );
  }

  const nodes = tree.nodes;
  const currentNode = tree.current;
  const visited = new Set(tree.visited ?? []);

  // Build node map
  const nodeMap = new Map<string, LayoutNode>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, { ...n, x: 0, y: 0 });
  });

  // BFS layout calculation
  const LEVEL_HEIGHT = 80;
  const BASE_WIDTH = 280;

  function calculateLayout(
    nodeId: string | undefined,
    x: number,
    y: number,
    width: number
  ): void {
    if (!nodeId) return;
    const node = nodeMap.get(nodeId);
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.left) {
      calculateLayout(
        node.left,
        x - width / 2,
        y + LEVEL_HEIGHT,
        width / 2
      );
    }
    if (node.right) {
      calculateLayout(
        node.right,
        x + width / 2,
        y + LEVEL_HEIGHT,
        width / 2
      );
    }
  }

  // Find root node - use tree.root or first node
  const rootId = nodes[0]?.id;
  if (rootId) {
    calculateLayout(rootId, 0, 30, BASE_WIDTH);
  }

  // Calculate SVG viewBox based on layout
  const allX = [...nodeMap.values()].map((n) => n.x);
  const allY = [...nodeMap.values()].map((n) => n.y);
  const minX = Math.min(...allX) - 40;
  const maxX = Math.max(...allX) + 40;
  const minY = Math.min(...allY) - 40;
  const maxY = Math.max(...allY) + 40;
  const viewWidth = maxX - minX;
  const viewHeight = maxY - minY;

  return (
    <div className="flex h-full w-full flex-col 
      items-center justify-center gap-6 p-6">
      <div className="relative w-full max-w-2xl">
        <svg
          viewBox={`${minX} ${minY} 
            ${viewWidth} ${viewHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-80 w-full"
          style={{ background: "transparent" }}
        >
          {/* Draw edges first so nodes appear on top */}
          {[...nodeMap.values()].map((node) => (
            <g key={`edges-${node.id}`}>
              {node.left && nodeMap.has(node.left) && (
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={nodeMap.get(node.left)!.x}
                  y2={nodeMap.get(node.left)!.y}
                  stroke="var(--border)"
                  strokeWidth="2"
                />
              )}
              {node.right && nodeMap.has(node.right) && (
                <line
                  x1={node.x}
                  y1={node.y}
                  x2={nodeMap.get(node.right)!.x}
                  y2={nodeMap.get(node.right)!.y}
                  stroke="var(--border)"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}

          {/* Draw nodes */}
          {[...nodeMap.values()].map((node) => {
            const isCurrent = currentNode === node.id;
            const isVisited = visited.has(node.id);
            const isRoot = node.id === rootId;

            let fillColor = "var(--panel)";
            let strokeColor = "var(--border)";
            let textColor = "var(--foreground)";
            let glowFilter = "none";

            if (isCurrent) {
              fillColor =
                "color-mix(in oklab, var(--neon-cyan) 25%, var(--panel))";
              strokeColor = "var(--neon-cyan)";
              textColor = "var(--neon-cyan)";
              glowFilter =
                "drop-shadow(0 0 8px color-mix(in oklab, var(--neon-cyan) 70%, transparent))";
            } else if (isVisited) {
              fillColor =
                "color-mix(in oklab, var(--neon-green) 20%, var(--panel))";
              strokeColor = "var(--neon-green)";
              textColor = "var(--neon-green)";
              glowFilter =
                "drop-shadow(0 0 6px color-mix(in oklab, var(--neon-green) 50%, transparent))";
            } else if (isRoot) {
              fillColor =
                "color-mix(in oklab, var(--neon-amber) 20%, var(--panel))";
              strokeColor = "var(--neon-amber)";
              textColor = "var(--neon-amber)";
              glowFilter =
                "drop-shadow(0 0 6px color-mix(in oklab, var(--neon-amber) 50%, transparent))";
            }

            return (
              <g key={`node-${node.id}`}>
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={24}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  style={{ filter: glowFilter }}
                  animate={{ fill: fillColor }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: "13px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: "bold",
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

      {/* Step info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm rounded-lg border 
          border-[var(--border)] bg-[var(--panel)] 
          p-4 text-center"
      >
        <p className="font-mono text-sm 
          text-muted-foreground">
          {step.action}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {step.explanation}
        </p>
      </motion.div>
    </div>
  );
}
