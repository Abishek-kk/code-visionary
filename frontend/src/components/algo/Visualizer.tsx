import { AnimatePresence, motion } from "motion/react";
import { usePlayback } from "@/stores/playback";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrayCanvas } from "./ArrayCanvas";
import { StackVisualizer } from "./StackVisualizer";
import { BinarySearchVisualizer } from "./BinarySearchVisualizer";
import { GraphVisualizer } from "./GraphVisualizer";
import { RecursionVisualizer } from "./RecursionVisualizer";
import { DPVisualizer } from "./DPVisualizer";
import { LinkedListVisualizer } from "./LinkedListVisualizer";
import { HeapVisualizer } from "./HeapVisualizer";
import { BacktrackVisualizer } from "./BacktrackVisualizer";

export function Visualizer() {
  const analysis = usePlayback((s) => s.analysis);
  const isAnalyzing = usePlayback((s) => s.isAnalyzing);
  const stepIndex = usePlayback((s) => s.stepIndex);

  if (isAnalyzing) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col gap-4 w-full max-w-md">
          {/* Row 1 */}
          <div className="flex gap-3">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-24 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
          </div>
          {/* Row 2 */}
          <div className="flex gap-3">
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-24 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
          </div>
          {/* Row 3 */}
          <div className="flex gap-3">
            <Skeleton className="h-16 w-24 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
            <Skeleton className="h-16 w-20 rounded-lg" />
            <Skeleton className="h-16 w-24 rounded-lg" />
            <Skeleton className="h-16 w-16 rounded-lg" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-mono">Analyzing your code…</p>
      </div>
    );
  }

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

  const visualizerType = analysis.visualizerType;

  const renderVisualizer = () => {
    switch (visualizerType) {
      case "array":
      case "twoPointer":
      case "slidingWindow":
        return <ArrayCanvas step={step} showWindow={visualizerType === "slidingWindow"} />;
      case "stack":
        return <StackVisualizer step={step} />;
      case "binarySearch":
        return <BinarySearchVisualizer step={step} />;
      case "bfs":
      case "dfs":
        return <GraphVisualizer step={step} visualizerType={visualizerType} />;
      case "recursion":
        return <RecursionVisualizer step={step} />;
      case "dp":
        return <DPVisualizer step={step} />;
      case "linkedList":
        return <LinkedListVisualizer step={step} />;
      case "heap":
        return <HeapVisualizer step={step} />;
      case "backtrack":
        return <BacktrackVisualizer step={step} />;
      default:
        return <ArrayCanvas step={step} />;
    }
  };

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
          {renderVisualizer()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
