import { motion } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function DPVisualizer({ step }: Props) {
  const dp = step.dp;
  if (!dp || !dp.table) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No DP table data</p>
      </div>
    );
  }

  const table = dp.table;
  const highlighted = new Set(
    (dp.highlighted ?? []).map((h) => `${h.row}-${h.col}`)
  );
  const rows = table.length;
  const cols = table[0]?.length ?? 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-6">
      {/* DP Table */}
      <div className="overflow-auto rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
        <table className="border-collapse">
          <tbody>
            {table.map((row, rIdx) => (
              <tr key={`row-${rIdx}`}>
                {/* Row label */}
                {rIdx === 0 && dp.rowLabels && (
                  <td className="border border-[var(--border)] px-3 py-2 text-center font-mono text-xs text-muted-foreground" />
                )}
                {rIdx > 0 && dp.rowLabels && (
                  <td className="border border-[var(--border)] px-3 py-2 text-center font-mono text-xs font-semibold text-muted-foreground">
                    {dp.rowLabels[rIdx - 1]}
                  </td>
                )}

                {/* Col headers on first row */}
                {rIdx === 0 && dp.colLabels && (
                  <>
                    {dp.colLabels.map((label, cIdx) => (
                      <td
                        key={`header-${cIdx}`}
                        className="border border-[var(--border)] px-3 py-2 text-center font-mono text-xs font-semibold text-muted-foreground"
                      >
                        {label}
                      </td>
                    ))}
                  </>
                )}

                {/* Cells */}
                {row.map((cell, cIdx) => {
                  const isHighlighted = highlighted.has(`${rIdx}-${cIdx}`);
                  const cellKey = rIdx === 0 && dp.colLabels ? cIdx + 1 : cIdx;

                  return (
                    <motion.td
                      key={`${rIdx}-${cIdx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: isHighlighted ? 1.1 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 22 }}
                      className="border border-[var(--border)] px-4 py-3 text-center font-mono font-semibold"
                      style={{
                        background: isHighlighted
                          ? "color-mix(in oklab, var(--neon-cyan) 25%, var(--panel))"
                          : "transparent",
                        color: isHighlighted
                          ? "var(--neon-cyan)"
                          : "var(--foreground)",
                        borderColor: isHighlighted
                          ? "var(--neon-cyan)"
                          : "var(--border)",
                        boxShadow: isHighlighted
                          ? "inset 0 0 12px color-mix(in oklab, var(--neon-cyan) 40%, transparent), 0 0 16px color-mix(in oklab, var(--neon-cyan) 50%, transparent)"
                          : "none",
                      }}
                    >
                      {String(cell)}
                    </motion.td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Step info */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 text-center"
      >
        <p className="font-mono text-sm text-muted-foreground">{step.action}</p>
        <p className="mt-2 text-xs text-muted-foreground">{step.explanation}</p>
      </motion.div>
    </div>
  );
}
