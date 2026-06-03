import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnalysisResult } from "./algo-types";

const InputSchema = z.object({
  code: z.string().min(5).max(8000),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go"]),
});

const SYSTEM = `You are an expert algorithm visualizer. Given a piece of code, you:
1. Detect the DSA pattern (e.g. "Two Pointers", "Sliding Window", "Binary Search", "Stack", "Hash Map", "Simple Array Traversal").
2. Choose ONE visualizerType from this exact set: "array" | "twoPointer" | "slidingWindow" | "stack" |
"binarySearch" | "bfs" | "dfs" | "recursion" |
"dp" | "linkedList" | "heap" | "backtrack".
3. Produce a step-by-step dry-run as JSON, simulating execution on a SMALL representative input (size 5-9).
4. Each step shows the data structure state AFTER that step.

Rules for steps:
- Provide between 6 and 18 steps.
- ALWAYS include "array" (the current array of numbers/strings being processed) when visualizerType is array/twoPointer/slidingWindow.
- For twoPointer: include "pointers" array with names like "left","right" and their current index.
- For binarySearch: include "pointers" array with names "left","mid","right" and their current indices.
- For slidingWindow: include "window" {start,end} on each step.
- For stack: include "stack" (top of stack is the LAST element).
- For bfs: include "graph" {nodes, edges, visited, queue, current}.
- For dfs: include "graph" {nodes, edges, visited, stack, current}.
- For recursion: include "callStack" with frames of {fnName, args, returnVal}.
- For dp: include "dp" with table, highlighted, rowLabels, colLabels.
- For linkedList: include "linkedList" with nodes {id, value, next} and pointers.
- For heap: include "tree" with nodes {id, value, left, right}.
- For backtrack: include "tree" showing decision branches.
- "highlights" is an array of indices to glow on the current step.
- "explanation" is one short sentence (<= 120 chars) describing what happened.
- "action" is 2-5 words label like "Move left pointer".
- Optionally set "result" on the final step.

Return ONLY a JSON object matching this schema via the provided tool. No prose.`;

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiBase = process.env.VITE_API_BASE_URL || "http://localhost:5000";

    const res = await fetch(`${apiBase}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: data.code,
        language: data.language,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit exceeded. Please wait and try again.");
      throw new Error(`Analysis failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    return json as AnalysisResult;
  });
