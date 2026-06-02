import { motion } from "motion/react";
import { Sparkles, Clock, Database, Lightbulb } from "lucide-react";
import { usePlayback } from "@/stores/playback";
import { Badge } from "@/components/ui/badge";

export function InfoPanel() {
  const analysis = usePlayback((s) => s.analysis);
  const stepIndex = usePlayback((s) => s.stepIndex);
  const problem = usePlayback((s) => s.problem);

  if (!analysis) {
    return (
      <div className="glass flex h-full flex-col items-center justify-center rounded-2xl p-6 text-center text-sm text-muted-foreground">
        <Sparkles className="mb-3 size-6 text-[var(--neon-cyan)]" />
        Analysis results will appear here.
      </div>
    );
  }

  const step = analysis.steps[stepIndex];

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-1">
      {problem && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[var(--neon-pink)] text-[var(--neon-pink)]">
              {problem.difficulty}
            </Badge>
            <h3 className="font-display text-base">{problem.title}</h3>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4">
            {problem.description}
          </p>
        </div>
      )}

      <div className="glass rounded-2xl p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Pattern</div>
        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[var(--neon-cyan)] bg-[color-mix(in_oklab,var(--neon-cyan)_10%,transparent)] px-3 py-1 font-display text-sm text-[var(--neon-cyan)] ring-glow-cyan">
          <Sparkles className="size-3" />
          {analysis.pattern}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Clock className="size-3" /> Time
          </div>
          <div className="mt-1 font-mono text-lg text-[var(--neon-green)] text-glow-green">
            {analysis.complexity.time}
          </div>
        </div>
        <div className="glass rounded-2xl p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Database className="size-3" /> Space
          </div>
          <div className="mt-1 font-mono text-lg text-[var(--neon-amber)]">
            {analysis.complexity.space}
          </div>
        </div>
      </div>

      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4"
      >
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Step {stepIndex + 1} — {step?.action}
        </div>
        <p className="mt-2 text-sm leading-relaxed">{step?.explanation}</p>
      </motion.div>

      <div className="glass gradient-border rounded-2xl p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--neon-pink)]">
          <Lightbulb className="size-3" /> Key Insight
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {analysis.insight}
        </p>
      </div>
    </div>
  );
}
