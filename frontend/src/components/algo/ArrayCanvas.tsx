import { motion } from "motion/react";
import type { AlgoStep, Pointer } from "@/lib/algo-types";

const pointerColor: Record<NonNullable<Pointer["color"]>, string> = {
  cyan: "var(--neon-cyan)",
  green: "var(--neon-green)",
  amber: "var(--neon-amber)",
  pink: "var(--neon-pink)",
};

const defaultColors: Pointer["color"][] = ["cyan", "green", "amber", "pink"];

interface Props {
  step: AlgoStep;
  showWindow?: boolean;
  showStack?: boolean;
}

export function ArrayCanvas({ step, showWindow, showStack }: Props) {
  const array = step.array ?? [];
  const highlights = new Set(step.highlights ?? []);
  const pointers = step.pointers ?? [];
  const window = step.window;

  const boxSize =
    array.length > 7
      ? "h-10 w-10 text-sm"
      : array.length > 5
        ? "h-12 w-12 text-base"
        : "h-16 w-16 text-lg";

  const gapSize = array.length > 7 ? "gap-1" : array.length > 5 ? "gap-2" : "gap-3";

  const cellWidth = array.length > 7 ? 44 : array.length > 5 ? 52 : 76;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-12 p-6">
      {array.length > 0 && (
        <div className="relative flex flex-col items-center">
          {/* Window overlay */}
          {showWindow && window && (
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="absolute -inset-y-3 rounded-xl border border-[var(--neon-amber)] bg-[color-mix(in_oklab,var(--neon-amber)_8%,transparent)]"
              style={{
                left: `calc(${window.start} * ${cellWidth}px)`,
                width: `calc(${window.end - window.start + 1} * ${cellWidth}px - ${cellWidth / 4}px)`,
                boxShadow: "0 0 28px color-mix(in oklab, var(--neon-amber) 50%, transparent)",
              }}
            />
          )}

          <div className={`flex items-end ${gapSize}`}>
            {array.map((v, i) => {
              const isHi = highlights.has(i);
              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isHi ? 1.08 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`relative flex items-center justify-center rounded-lg font-mono font-semibold ${boxSize}`}
                  style={{
                    background: isHi
                      ? "color-mix(in oklab, var(--neon-cyan) 22%, var(--panel))"
                      : "var(--panel)",
                    border: `1px solid ${isHi ? "var(--neon-cyan)" : "var(--border)"}`,
                    color: isHi ? "var(--neon-cyan)" : "var(--foreground)",
                    boxShadow: isHi
                      ? "0 0 22px color-mix(in oklab, var(--neon-cyan) 60%, transparent)"
                      : "none",
                  }}
                >
                  {String(v)}
                </motion.div>
              );
            })}
          </div>

          {/* Index labels */}
          <div className={`mt-2 flex ${gapSize}`}>
            {array.map((_, i) => {
              const indexBoxWidth = array.length > 7 ? 28 : array.length > 5 ? 36 : 52;
              return (
                <div
                  key={i}
                  className="text-center font-mono text-[10px] text-muted-foreground"
                  style={{ width: indexBoxWidth }}
                >
                  {i}
                </div>
              );
            })}
          </div>

          {/* Pointers */}
          {pointers.length > 0 && (
            <div className="relative mt-4 h-16 w-full">
              {pointers.map((p, idx) => {
                const color = pointerColor[p.color ?? defaultColors[idx % 4]!];
                const offset = idx * 18;
                return (
                  <motion.div
                    key={p.name}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `calc(${p.index} * ${cellWidth}px + ${cellWidth / 2}px)`,
                      top: offset,
                      transform: "translateX(-50%)",
                      color,
                    }}
                  >
                    <svg width="14" height="10" viewBox="0 0 14 10">
                      <polygon points="7,0 14,10 0,10" fill={color} />
                    </svg>
                    <span
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider"
                      style={{
                        textShadow: `0 0 10px ${color}`,
                      }}
                    >
                      {p.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showStack && step.stack && (
        <div className="flex flex-col-reverse items-center gap-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            stack base
          </div>
          {step.stack.map((v, i) => (
            <motion.div
              key={`${i}-${v}`}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="flex h-12 w-28 items-center justify-center rounded-md font-mono text-base"
              style={{
                background:
                  i === step.stack!.length - 1
                    ? "color-mix(in oklab, var(--neon-green) 22%, var(--panel))"
                    : "var(--panel)",
                border: `1px solid ${i === step.stack!.length - 1 ? "var(--neon-green)" : "var(--border)"}`,
                boxShadow:
                  i === step.stack!.length - 1
                    ? "0 0 22px color-mix(in oklab, var(--neon-green) 50%, transparent)"
                    : "none",
              }}
            >
              {String(v)}
            </motion.div>
          ))}
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--neon-green)]">
            top ↑
          </div>
        </div>
      )}

      {step.result !== undefined && step.result !== null && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl border border-[var(--neon-green)] bg-[color-mix(in_oklab,var(--neon-green)_12%,transparent)] px-6 py-2 font-mono text-sm text-[var(--neon-green)]"
          style={{ boxShadow: "0 0 24px color-mix(in oklab, var(--neon-green) 50%, transparent)" }}
        >
          result = {JSON.stringify(step.result)}
        </motion.div>
      )}
    </div>
  );
}
