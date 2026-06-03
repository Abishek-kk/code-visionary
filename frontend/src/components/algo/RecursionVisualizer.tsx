import { motion, AnimatePresence } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function RecursionVisualizer({ step }: Props) {
  if (!step.callStack || step.callStack.frames.length === 0) {
    return (
      <div className="flex h-full items-center justify-center 
                      text-muted-foreground text-sm font-mono">
        No call stack data for this step
      </div>
    );
  }

  const callStack = step.callStack.frames;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
      {/* Call stack frames */}
      <div className="relative flex max-h-96 w-full max-w-sm flex-col-reverse overflow-hidden">
        <div className="absolute left-0 top-0 w-1 bg-gradient-to-b from-[var(--neon-cyan)] to-transparent" />

        <AnimatePresence mode="popLayout">
          {callStack.map((frame, idx) => (
            <motion.div
              key={`${idx}-${frame.fnName}`}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              className="mb-2 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4"
              style={{
                background:
                  idx === callStack.length - 1
                    ? "color-mix(in oklab, var(--neon-cyan) 12%, var(--panel))"
                    : "var(--panel)",
                borderColor:
                  idx === callStack.length - 1
                    ? "var(--neon-cyan)"
                    : "var(--border)",
                boxShadow:
                  idx === callStack.length - 1
                    ? "0 0 16px color-mix(in oklab, var(--neon-cyan) 40%, transparent)"
                    : "none",
              }}
            >
              <p className="font-mono font-bold text-[var(--neon-cyan)]">
                {frame.fnName}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                args: {frame.args}
              </p>
              {frame.returnVal !== undefined && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 font-mono text-xs"
                  style={{ color: "var(--neon-amber)" }}
                >
                  ↳ return: {frame.returnVal}
                </motion.p>
              )}
            </motion.div>
          ))}
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
