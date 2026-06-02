import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResult, LeetCodeProblem } from "@/lib/algo-types";

interface PlaybackState {
  analysis: AnalysisResult | null;
  problem: LeetCodeProblem | null;
  stepIndex: number;
  playing: boolean;
  speed: number; // multiplier
  isAnalyzing: boolean;
  language: string;
  code: string;
  setAnalysis: (a: AnalysisResult | null) => void;
  setProblem: (p: LeetCodeProblem | null) => void;
  setStep: (i: number) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  setPlaying: (b: boolean) => void;
  setSpeed: (s: number) => void;
  setIsAnalyzing: (b: boolean) => void;
  setLanguage: (l: string) => void;
  setCode: (c: string) => void;
  restart: () => void;
}

export const usePlayback = create<PlaybackState>()(
  persist(
    (set, get) => ({
      analysis: null,
      problem: null,
      stepIndex: 0,
      playing: false,
      speed: 1,
      isAnalyzing: false,
      language: "python",
      code: "",
      setAnalysis: (a) => set({ analysis: a, stepIndex: 0, playing: false, isAnalyzing: false }),
      setProblem: (p) => set({ problem: p }),
      setStep: (i) => {
        const total = get().analysis?.steps.length ?? 0;
        set({ stepIndex: Math.max(0, Math.min(total - 1, i)) });
      },
      next: () => {
        const { stepIndex, analysis } = get();
        const total = analysis?.steps.length ?? 0;
        if (stepIndex >= total - 1) set({ playing: false });
        else set({ stepIndex: stepIndex + 1 });
      },
      prev: () => set({ stepIndex: Math.max(0, get().stepIndex - 1) }),
      togglePlay: () => set({ playing: !get().playing }),
      setPlaying: (b) => set({ playing: b }),
      setSpeed: (s) => set({ speed: s }),
      setIsAnalyzing: (b) => set({ isAnalyzing: b }),
      setLanguage: (l) => set({ language: l }),
      setCode: (c) => set({ code: c }),
      restart: () => set({ stepIndex: 0, playing: false }),
    }),
    {
      name: "algovision-playback",
      partialize: (state) => ({
        language: state.language,
        code: state.code,
        speed: state.speed,
      }),
    }
  )
);
