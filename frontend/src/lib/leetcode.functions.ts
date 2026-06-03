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
    const apiBase = process.env.VITE_API_BASE_URL || "http://localhost:5000";

    const res = await fetch(`${apiBase}/api/leetcode/problem/${data.slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to load problem (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    return json.data as LeetCodeProblem;
  });
