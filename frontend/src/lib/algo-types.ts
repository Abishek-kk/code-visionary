export type VisualizerType =
  | "array"
  | "twoPointer"
  | "slidingWindow"
  | "stack"
  | "binarySearch"
  | "bfs"
  | "dfs"
  | "recursion"
  | "dp"
  | "linkedList"
  | "heap"
  | "backtrack"
  | "tree";

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
  graph?: {
    nodes: { id: string; label: string }[];
    edges: { from: string; to: string }[];
    visited?: string[];
    queue?: string[];
    stack?: string[];
    current?: string;
  };
  tree?: {
    nodes: { id: string; value: string; left?: string; right?: string }[];
    current?: string;
    visited?: string[];
  };
  dp?: {
    table: (number | string)[][];
    highlighted?: { row: number; col: number }[];
    rowLabels?: string[];
    colLabels?: string[];
  };
  linkedList?: {
    nodes: { id: string; value: string; next?: string }[];
    pointers?: { name: string; nodeId: string }[];
  };
  callStack?: {
    frames: { fnName: string; args: string; returnVal?: string }[];
  };
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
  isGuessed?: boolean;
}
