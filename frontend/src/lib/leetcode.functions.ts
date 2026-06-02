import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LeetCodeProblem } from "./algo-types";

const InputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Invalid slug"),
});

export const fetchLeetCodeProblem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<LeetCodeProblem> => {
    const apiKey = process.env.ALGOVISION_API_KEY;
    if (!apiKey) throw new Error("ALGOVISION_API_KEY not configured");

    const tool = {
      type: "function",
      function: {
        name: "emit_problem",
        description: "Emit the LeetCode problem details for a given slug.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
            description: { type: "string" },
            examples: {
              type: "array",
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  input: { type: "string" },
                  output: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["input", "output"],
              },
            },
            constraints: { type: "array", items: { type: "string" } },
          },
          required: ["title", "difficulty", "description", "examples", "constraints"],
          additionalProperties: false,
        },
      },
    };

    const res = await fetch("https://ai.gateway.algovision.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You return faithful summaries of LeetCode problems by slug. Keep description under 600 chars. If you don't know the problem, return your best guess clearly marked.",
          },
          { role: "user", content: `Slug: ${data.slug}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "emit_problem" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("No tool call returned.");
    const args =
      typeof call.function.arguments === "string"
        ? JSON.parse(call.function.arguments)
        : call.function.arguments;
    return args as LeetCodeProblem;
  });
