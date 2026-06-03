import { motion, AnimatePresence } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function LinkedListVisualizer({ step }: Props) {
  const linkedList = step.linkedList;
  if (!linkedList || !linkedList.nodes) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No linked list data</p>
      </div>
    );
  }

  const nodes = linkedList.nodes;
  const pointerSet = new Set(linkedList.pointers?.map((p) => p.nodeId) ?? []);
  const pointerMap = new Map(linkedList.pointers?.map((p) => [p.nodeId, p.name]) ?? []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 p-6">
      {/* Linked list visualization */}
      <div className="relative flex items-center gap-4">
        <AnimatePresence mode="wait">
          {nodes.map((node, idx) => {
            const hasPointers = pointerSet.has(node.id);
            const pointerLabel = pointerMap.get(node.id);

            return (
              <div key={node.id} className="relative flex flex-col items-center">
                {/* Pointer labels above nodes */}
                {hasPointers && pointerLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 font-mono text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: "var(--neon-pink)",
                      textShadow: "0 0 8px var(--neon-pink)",
                    }}
                  >
                    {pointerLabel}
                  </motion.div>
                )}

                {/* Node box */}
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="relative flex h-12 w-16 items-center justify-center rounded-lg font-mono font-semibold"
                  style={{
                    background: hasPointers
                      ? "color-mix(in oklab, var(--neon-cyan) 22%, var(--panel))"
                      : "var(--panel)",
                    border: `2px solid ${hasPointers ? "var(--neon-cyan)" : "var(--border)"}`,
                    color: hasPointers ? "var(--neon-cyan)" : "var(--foreground)",
                    boxShadow: hasPointers
                      ? "0 0 16px color-mix(in oklab, var(--neon-cyan) 50%, transparent)"
                      : "none",
                  }}
                >
                  {String(node.value)}
                </motion.div>

                {/* Arrow to next node */}
                {idx < nodes.length - 1 && (
                  <motion.svg
                    width="32"
                    height="20"
                    viewBox="0 0 32 20"
                    className="absolute left-full top-4 -translate-x-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.line
                      x1="0"
                      y1="10"
                      x2="32"
                      y2="10"
                      stroke="var(--border)"
                      strokeWidth="2"
                      initial={{ strokeDasharray: "32", strokeDashoffset: "32" }}
                      animate={{ strokeDashoffset: "0" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.polygon
                      points="32,10 24,6 24,14"
                      fill="var(--border)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    />
                  </motion.svg>
                )}

                {/* Null/End indicator */}
                {!node.next && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-0 top-4 -translate-x-full font-mono text-xs text-muted-foreground"
                  >
                    null
                  </motion.div>
                )}
              </div>
            );
          })}
        </AnimatePresence>
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
