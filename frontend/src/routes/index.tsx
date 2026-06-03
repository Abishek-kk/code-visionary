import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Sparkles, Code2, Play, Info } from "lucide-react";
import { CodeWorkspace } from "@/components/algo/CodeWorkspace";
import { Visualizer } from "@/components/algo/Visualizer";
import { PlaybackControls } from "@/components/algo/PlaybackControls";
import { InfoPanel } from "@/components/algo/InfoPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePlayback } from "@/stores/playback";
import { useServerFn } from "@tanstack/react-start";
import { fetchLeetCodeProblem } from "@/lib/leetcode.functions";

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

type Tab = "editor" | "visualizer" | "info";

function Home() {
  const isMobile = useIsMobile();
  const analysis = usePlayback((s) => s.analysis);
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [prevAnalysis, setPrevAnalysis] = useState(analysis);

  const setLanguage = usePlayback((s) => s.setLanguage);
  const setProblem = usePlayback((s) => s.setProblem);
  const setIsFetchingProblem = usePlayback(
    (s) => s.setIsFetchingProblem
  );
  const fetchFn = useServerFn(fetchLeetCodeProblem);

  // Auto-switch to visualizer when analysis completes on mobile
  useEffect(() => {
    if (isMobile && !prevAnalysis && analysis) {
      setActiveTab("visualizer");
    }
    setPrevAnalysis(analysis);
  }, [analysis, prevAnalysis, isMobile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const problemSlug = params.get("problem");
    const lang = params.get("lang");

    if (lang) {
      setLanguage(lang);
    }

    if (problemSlug) {
      setIsFetchingProblem(true);
      fetchFn({ data: { slug: problemSlug } })
        .then((data) => {
          setProblem(data);
        })
        .catch((err) => {
          console.error("Failed to auto-load problem:", err);
        })
        .finally(() => {
          setIsFetchingProblem(false);
        });
    }
  }, []);

  const tabs: Array<{
    id: Tab;
    label: string;
    icon: typeof Code2;
  }> = [
    { id: "editor", label: "Editor", icon: Code2 },
    { id: "visualizer", label: "Visualizer", icon: Play },
    { id: "info", label: "Info", icon: Info },
  ];

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
        {/* Left: editor - hidden on mobile except when active tab */}
        {(!isMobile || activeTab === "editor") && (
          <section className="flex h-full min-h-0 flex-col">
            <CodeWorkspace />
          </section>
        )}

        {/* Center: visualizer + controls - hidden on mobile except when active tab */}
        {(!isMobile || activeTab === "visualizer") && (
          <section className="flex h-full min-h-0 flex-col gap-3">
            <div className="glass relative flex-1 overflow-hidden rounded-2xl">
              <Visualizer />
            </div>
            <PlaybackControls />
          </section>
        )}

        {/* Right: info panel - hidden on mobile except when active tab */}
        {(!isMobile || activeTab === "info") && (
          <aside className="h-full min-h-0">
            <InfoPanel />
          </aside>
        )}
      </main>

      {/* Mobile tab bar - only show on mobile */}
      {isMobile && (
        <div className="border-t border-border bg-[var(--panel)] px-2 py-2">
          <div className="flex justify-around gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 transition-all"
                  style={{
                    color: isActive ? "var(--neon-cyan)" : "var(--muted-foreground)",
                    background: isActive
                      ? "color-mix(in oklab, var(--neon-cyan) 12%, var(--panel))"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 0 16px color-mix(in oklab, var(--neon-cyan) 40%, transparent)"
                      : "none",
                  }}
                >
                  <Icon className="size-5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
