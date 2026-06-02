import { AnimatePresence, motion } from "motion/react";
import { usePlayback } from "@/stores/playback";
import { ArrayCanvas } from "./ArrayCanvas";

export function Visualizer() {
  const analysis = usePlayback((s) => s.analysis);
  const stepIndex = usePlayback((s) => s.stepIndex);

  if (!analysis) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="bg-grid absolute inset-0 opacity-30" aria-hidden />
        <div className="relative">
          <div className="font-display text-2xl tracking-tight">Ready to visualize</div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Paste your LeetCode solution on the left and hit <span className="font-mono text-[var(--neon-cyan)]">Analyze</span> to watch the algorithm come alive.
          </p>
        </div>
      </div>
    );
  }

  const step = analysis.steps[stepIndex];
  if (!step) return null;

  const t = analysis.visualizerType;
  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="relative flex h-full w-full"
        >
          <ArrayCanvas
            step={step}
            showWindow={t === "slidingWindow"}
            showStack={t === "stack"}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
