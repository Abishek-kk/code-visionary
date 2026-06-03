import { motion, AnimatePresence } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function BacktrackVisualizer({ step }: Props) {
  if (!step.tree || !step.tree.nodes) {
    return (
      <div
        className="flex h-full items-center justify-center 
                      text-muted-foreground text-sm font-mono"
      >
        No backtrack data for this step
      </div>
    );
  }

  // Use the call stack to represent backtracking branches
  const callStack = step.callStack?.frames ?? [];
  const array = step.array ?? [];
  const highlights = new Set(step.highlights ?? []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex w-full max-w-2xl gap-8">
        {/* Current solution path */}
        <div className="flex-1">
          <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Call Stack / Path
          </p>
          <div className="relative flex max-h-64 flex-col-reverse gap-2 overflow-hidden">
            <div className="absolute left-2 top-0 h-full w-0.5 bg-gradient-to-b from-[var(--neon-pink)] via-[var(--neon-cyan)] to-transparent" />

            <AnimatePresence mode="popLayout">
              {callStack.map((frame, idx) => (
                <motion.div
                  key={`${idx}-${frame.fnName}`}
                  layout
                  initial={{ opacity: 0, x: 24, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                  }}
                  className="ml-4 rounded-lg border border-[var(--neon-pink)] bg-[color-mix(in_oklab,var(--neon-pink)_12%,var(--panel))] p-3"
                  style={{
                    boxShadow:
                      idx === callStack.length - 1
                        ? "0 0 16px color-mix(in oklab, var(--neon-pink) 50%, transparent)"
                        : "none",
                  }}
                >
                  <p className="font-mono text-xs font-bold text-[var(--neon-pink)]">
                    {frame.fnName}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{frame.args}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Current candidate solution */}
        {array.length > 0 && (
          <div className="flex-1">
            <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Candidate
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {array.map((v, i) => {
                  const isHi = highlights.has(i);
                  return (
                    <motion.div
                      key={`${i}-${v}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isHi ? 1.1 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                      }}
                      className="flex h-10 min-w-10 items-center justify-center rounded-md font-mono font-semibold"
                      style={{
                        background: isHi
                          ? "color-mix(in oklab, var(--neon-amber) 25%, var(--panel))"
                          : "var(--panel)",
                        border: `1px solid ${isHi ? "var(--neon-amber)" : "var(--border)"}`,
                        color: isHi ? "var(--neon-amber)" : "var(--foreground)",
                        boxShadow: isHi
                          ? "0 0 12px color-mix(in oklab, var(--neon-amber) 50%, transparent)"
                          : "none",
                      }}
                    >
                      {String(v)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
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
