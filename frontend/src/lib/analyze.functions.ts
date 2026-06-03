import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnalysisResult } from "./algo-types";

const InputSchema = z.object({
  code: z.string().min(5).max(8000),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go"]),
  testCase: z.string().max(500).optional(),
});

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiBase = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || "http://localhost:5000";

    const res = await fetch(`${apiBase}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: data.code,
        language: data.language,
        ...(data.testCase ? { testCase: data.testCase } : {}),
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
