import { useEffect } from "react";
import { Pause, Play, SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { usePlayback } from "@/stores/playback";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const SPEEDS = [0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const {
    analysis,
    stepIndex,
    playing,
    speed,
    next,
    prev,
    togglePlay,
    setPlaying,
    setSpeed,
    restart,
    setStep,
  } = usePlayback();

  const total = analysis?.steps.length ?? 0;
  const isEnd = stepIndex >= total - 1;

  // playback timer
  useEffect(() => {
    if (!playing || total === 0) return;
    if (isEnd) {
      setPlaying(false);
      return;
    }
    const ms = 1000 / speed;
    const id = setTimeout(() => next(), ms);
    return () => clearTimeout(id);
  }, [playing, stepIndex, speed, total, isEnd, next, setPlaying]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable)
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, next, prev]);

  const disabled = total === 0;
  const progress = total ? ((stepIndex + 1) / total) * 100 : 0;

  return (
    <div className="glass flex flex-col gap-3 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" disabled={disabled} onClick={restart} aria-label="Restart">
          <RotateCcw className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled={disabled || stepIndex === 0} onClick={prev} aria-label="Previous">
          <SkipBack className="size-4" />
        </Button>
        <Button
          size="icon"
          disabled={disabled}
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          className="ring-glow-cyan size-10 rounded-full bg-[var(--neon-cyan)] text-[var(--primary-foreground)] hover:bg-[var(--neon-cyan)]/90"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" disabled={disabled || isEnd} onClick={next} aria-label="Next">
          <SkipForward className="size-4" />
        </Button>

        <div className="ml-2 font-mono text-xs text-muted-foreground">
          Step <span className="text-[var(--neon-cyan)]">{Math.min(stepIndex + 1, Math.max(total, 1))}</span> of {Math.max(total, 1)}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded-md px-2 py-1 font-mono text-[11px] transition-colors ${
                s === speed
                  ? "bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--accent)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-pink)] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Slider
          value={[stepIndex]}
          min={0}
          max={Math.max(total - 1, 0)}
          step={1}
          onValueChange={(v) => setStep(v[0] ?? 0)}
          disabled={disabled}
          className="w-40"
        />
      </div>
    </div>
  );
}
