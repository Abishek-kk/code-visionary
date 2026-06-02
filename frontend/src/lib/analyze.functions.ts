import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AnalysisResult } from "./algo-types";

const InputSchema = z.object({
  code: z.string().min(5).max(8000),
  language: z.enum(["python", "javascript", "typescript", "java", "cpp", "go"]),
});

const SYSTEM = `You are an expert algorithm visualizer. Given a piece of code, you:
1. Detect the DSA pattern (e.g. "Two Pointers", "Sliding Window", "Binary Search", "Stack", "Hash Map", "Simple Array Traversal").
2. Choose ONE visualizerType from this exact set: "array" | "twoPointer" | "slidingWindow" | "stack".
3. Produce a step-by-step dry-run as JSON, simulating execution on a SMALL representative input (size 5-9).
4. Each step shows the data structure state AFTER that step.

Rules for steps:
- Provide between 6 and 18 steps.
- ALWAYS include "array" (the current array of numbers/strings being processed) when visualizerType is array/twoPointer/slidingWindow.
- For twoPointer: include "pointers" array with names like "left","right" and their current index.
- For slidingWindow: include "window" {start,end} on each step.
- For stack: include "stack" (top of stack is the LAST element).
- "highlights" is an array of indices to glow on the current step.
- "explanation" is one short sentence (<= 120 chars) describing what happened.
- "action" is 2-5 words label like "Move left pointer".
- Optionally set "result" on the final step.

Return ONLY a JSON object matching this schema via the provided tool. No prose.`;

export const analyzeCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");

    const tool = {
      type: "function",
      function: {
        name: "emit_analysis",
        description: "Emit the analysis of the given code.",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            visualizerType: {
              type: "string",
              enum: ["array", "twoPointer", "slidingWindow", "stack"],
            },
            complexity: {
              type: "object",
              properties: {
                time: { type: "string" },
                space: { type: "string" },
              },
              required: ["time", "space"],
              additionalProperties: false,
            },
            insight: { type: "string" },
            steps: {
              type: "array",
              minItems: 4,
              maxItems: 20,
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  explanation: { type: "string" },
                  array: { type: "array", items: {} },
                  highlights: { type: "array", items: { type: "number" } },
                  pointers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        index: { type: "number" },
                        color: {
                          type: "string",
                          enum: ["cyan", "green", "amber", "pink"],
                        },
                      },
                      required: ["name", "index"],
                    },
                  },
                  window: {
                    type: "object",
                    properties: {
                      start: { type: "number" },
                      end: { type: "number" },
                    },
                    required: ["start", "end"],
                  },
                  stack: { type: "array", items: {} },
                  result: {},
                  lineNumber: { type: "number" },
                },
                required: ["action", "explanation"],
              },
            },
          },
          required: ["pattern", "visualizerType", "complexity", "insight", "steps"],
          additionalProperties: false,
        },
      },
    };

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Language: ${data.language}\n\nCode:\n\`\`\`${data.language}\n${data.code}\n\`\`\``,
          },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_analysis" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429)
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Add credits to continue.");
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No tool call returned from AI.");
    const args =
      typeof call.function.arguments === "string"
        ? JSON.parse(call.function.arguments)
        : call.function.arguments;
    return args as AnalysisResult;
  });
