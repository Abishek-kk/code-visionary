import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Sparkles } from "lucide-react";
import { CodeWorkspace } from "@/components/algo/CodeWorkspace";
import { Visualizer } from "@/components/algo/Visualizer";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { InfoPanel } from "@/components/algo/InfoPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AlgoVision — AI Algorithm Visualizer for LeetCode" },
      {
        name: "description",
        content:
          "Paste any LeetCode solution and watch the algorithm animate step-by-step. AI-powered pattern detection, dry-run, and complexity insights.",
      },
      { property: "og:title", content: "AlgoVision — AI Algorithm Visualizer" },
      {
        property: "og:description",
        content:
          "Cinematic, step-by-step visualizations of DSA patterns from any LeetCode solution.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3">
        <div className="relative">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-pink)] text-[var(--primary-foreground)] ring-glow-cyan">
            <Cpu className="size-5" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-xl leading-none tracking-tight">
            Algo<span className="text-[var(--neon-cyan)] text-glow-cyan">Vision</span>
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            AI-powered LeetCode algorithm visualizer
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-[var(--panel)]/50 px-3 py-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-[var(--neon-cyan)]" />
          <span className="font-mono">space</span> play
          <span className="mx-1">·</span>
          <span className="font-mono">← →</span> step
        </div>
      </header>

      <main className="grid flex-1 gap-3 overflow-hidden p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]">
        {/* Left: editor */}
        <section className="flex h-full min-h-0 flex-col">
          <CodeWorkspace />
        </section>

        {/* Center: visualizer + controls */}
        <section className="flex h-full min-h-0 flex-col gap-3">
          <div className="glass relative flex-1 overflow-hidden rounded-2xl">
            <Visualizer />
          </div>
          <PlaybackControls />
        </section>

        {/* Right: info panel */}
        <aside className="h-full min-h-0">
          <InfoPanel />
        </aside>
      </main>
    </div>
  );
}
