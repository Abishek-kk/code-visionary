import { motion } from "motion/react";
import type { AlgoStep } from "@/lib/algo-types";

interface Props {
  step: AlgoStep;
}

export function BinarySearchVisualizer({ step }: Props) {
  const array = step.array ?? [];
  const highlights = new Set(step.highlights ?? []);
  const pointers = step.pointers ?? [];

  // Extract left, mid, right from pointers
  const leftPtr = pointers.find((p) => p.name.toLowerCase() === "left");
  const midPtr = pointers.find((p) => p.name.toLowerCase() === "mid");
  const rightPtr = pointers.find((p) => p.name.toLowerCase() === "right");

  const leftIdx = leftPtr?.index ?? -1;
  const midIdx = midPtr?.index ?? -1;
  const rightIdx = rightPtr?.index ?? -1;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 p-6">
      {array.length > 0 && (
        <div className="relative flex flex-col items-center gap-6">
          {/* Search space indicator */}
          {leftIdx >= 0 && rightIdx >= 0 && (
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="rounded-lg border-2 border-[var(--neon-amber)] bg-[color-mix(in_oklab,var(--neon-amber)_8%,transparent)] px-4 py-2"
              style={{
                boxShadow: "0 0 20px color-mix(in oklab, var(--neon-amber) 40%, transparent)",
              }}
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--neon-amber)]">
                Search Space
              </p>
            </motion.div>
          )}

          {/* Array */}
          <div className="flex items-end gap-3">
            {array.map((v, i) => {
              const isLeft = i === leftIdx;
              const isMid = i === midIdx;
              const isRight = i === rightIdx;
              const isHi = highlights.has(i);

              let bgColor = "var(--panel)";
              let borderColor = "var(--border)";
              let textColor = "var(--foreground)";
              let glowColor = "";

              if (isMid) {
                bgColor = "color-mix(in oklab, var(--neon-cyan) 22%, var(--panel))";
                borderColor = "var(--neon-cyan)";
                textColor = "var(--neon-cyan)";
                glowColor = "0 0 24px color-mix(in oklab, var(--neon-cyan) 70%, transparent)";
              } else if (isHi) {
                bgColor = "color-mix(in oklab, var(--neon-green) 18%, var(--panel))";
                borderColor = "var(--neon-green)";
                textColor = "var(--neon-green)";
                glowColor = "0 0 18px color-mix(in oklab, var(--neon-green) 50%, transparent)";
              }

              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isMid ? 1.12 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-lg font-mono text-lg font-semibold"
                  style={{
                    background: bgColor,
                    border: `2px solid ${borderColor}`,
                    color: textColor,
                    boxShadow: glowColor,
                  }}
                >
                  {String(v)}
                </motion.div>
              );
            })}
          </div>

          {/* Index labels */}
          <div className="flex gap-3">
            {array.map((_, i) => (
              <div key={i} className="w-16 text-center font-mono text-xs text-muted-foreground">
                {i}
              </div>
            ))}
          </div>

          {/* Pointer labels */}
          <div className="relative mt-4 h-20 w-full">
            {leftIdx >= 0 && (
              <motion.div
                layout
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(${leftIdx} * (4rem + 0.75rem) + 2rem)`,
                  top: 0,
                  transform: "translateX(-50%)",
                  color: "var(--neon-pink)",
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10">
                  <polygon points="7,0 14,10 0,10" fill="var(--neon-pink)" />
                </svg>
                <span
                  className="font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ textShadow: "0 0 8px var(--neon-pink)" }}
                >
                  left
                </span>
              </motion.div>
            )}

            {rightIdx >= 0 && (
              <motion.div
                layout
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(${rightIdx} * (4rem + 0.75rem) + 2rem)`,
                  top: 0,
                  transform: "translateX(-50%)",
                  color: "var(--neon-pink)",
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10">
                  <polygon points="7,0 14,10 0,10" fill="var(--neon-pink)" />
                </svg>
                <span
                  className="font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ textShadow: "0 0 8px var(--neon-pink)" }}
                >
                  right
                </span>
              </motion.div>
            )}

            {midIdx >= 0 && (
              <motion.div
                layout
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(${midIdx} * (4rem + 0.75rem) + 2rem)`,
                  top: 32,
                  transform: "translateX(-50%)",
                  color: "var(--neon-cyan)",
                }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10">
                  <polygon points="7,10 0,0 14,0" fill="var(--neon-cyan)" />
                </svg>
                <span
                  className="font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ textShadow: "0 0 8px var(--neon-cyan)" }}
                >
                  mid
                </span>
              </motion.div>
            )}
          </div>
        </div>
      )}

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
