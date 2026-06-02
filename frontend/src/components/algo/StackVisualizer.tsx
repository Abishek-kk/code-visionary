import { AnimatePresence, motion } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function StackVisualizer({ step }: Props) {
  const stack = step.stack ?? [];
  const topIndex = stack.length - 1;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col-reverse items-center gap-2">
        {/* Top label */}
        <div
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2"
          style={{ color: "var(--neon-cyan)" }}
        >
          top ↑
        </div>

        {/* Stack boxes */}
        <AnimatePresence mode="popLayout">
          {stack.map((v, i) => {
            const isTop = i === topIndex;
            return (
              <motion.div
                key={`${i}-${v}`}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="flex h-14 w-32 items-center justify-center rounded-lg font-mono text-base font-semibold"
                style={{
                  background: isTop
                    ? "color-mix(in oklab, var(--neon-green) 22%, var(--panel))"
                    : "var(--panel)",
                  border: `2px solid ${isTop ? "var(--neon-green)" : "var(--border)"}`,
                  color: isTop ? "var(--neon-green)" : "var(--foreground)",
                  boxShadow: isTop
                    ? "0 0 28px color-mix(in oklab, var(--neon-green) 60%, transparent), inset 0 0 12px color-mix(in oklab, var(--neon-green) 30%, transparent)"
                    : "none",
                }}
              >
                {String(v)}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Base label */}
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
          stack base
        </div>
      </div>

      {/* Step info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-center"
      >
        <p className="font-mono text-sm text-muted-foreground">{step.action}</p>
        <p className="mt-2 text-xs text-muted-foreground">{step.explanation}</p>
      </motion.div>
    </div>
  );
}
