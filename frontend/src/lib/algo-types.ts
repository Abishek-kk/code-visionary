export type VisualizerType =
  | "array"
  | "twoPointer"
  | "slidingWindow"
  | "stack";

export interface Pointer {
  name: string;
  index: number;
  color?: "cyan" | "green" | "amber" | "pink";
}

export interface AlgoStep {
  action: string;
  explanation: string;
  array?: (number | string)[];
  highlights?: number[];
  pointers?: Pointer[];
  window?: { start: number; end: number };
  stack?: (number | string)[];
  result?: number | string | null;
  lineNumber?: number;
}

export interface AnalysisResult {
  pattern: string;
  visualizerType: VisualizerType;
  complexity: { time: string; space: string };
  insight: string;
  steps: AlgoStep[];
}

export interface LeetCodeProblem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
}
