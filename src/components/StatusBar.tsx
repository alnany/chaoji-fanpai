"use client";
import { useGame } from "@/lib/store";
import clsx from "clsx";

export function StatusBar() {
  const s = useGame();

  const pills: { label: string; value: string; tone: string }[] = [
    {
      label: "骰池",
      value: `${s.dicePool}`,
      tone: "bg-[var(--color-red-gold)]/20 border-[var(--color-red-gold)]",
    },
    {
      label: "9 已翻",
      value: `${s.nineCount}/4`,
      tone: "bg-[var(--color-cinnabar)]/20 border-[var(--color-cinnabar)]",
    },
    {
      label: "A 已翻",
      value: `${s.aceCount}/4`,
      tone: "bg-[var(--color-cinnabar)]/20 border-[var(--color-cinnabar)]",
    },
    {
      label: "J 已翻",
      value: `${s.jCount}/4`,
      tone: "bg-[var(--color-jade)]/20 border-[var(--color-jade)]",
    },
    {
      label: "方向",
      value: s.direction === "cw" ? "顺时针 ↻" : "逆时针 ↺",
      tone: "bg-[var(--color-ivory)]/10 border-[var(--color-ivory)]/40",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {pills.map((p) => (
        <div
          key={p.label}
          className={clsx(
            "px-3 py-1.5 rounded-full border text-xs flex items-center gap-2",
            p.tone
          )}
        >
          <span className="opacity-70">{p.label}</span>
          <span className="font-display text-sm">{p.value}</span>
        </div>
      ))}
      <button
        onClick={s.toggleNeuropath}
        className={clsx(
          "px-3 py-1.5 rounded-full border text-xs flex items-center gap-2 transition",
          s.neuropathActive
            ? "bg-[var(--color-jade)] border-[var(--color-jade)] text-[var(--color-ivory)] animate-pulse"
            : "bg-[var(--color-ivory)]/10 border-[var(--color-ivory)]/40 hover:bg-[var(--color-ivory)]/20"
        )}
      >
        <span>🧠</span>
        <span>{s.neuropathActive ? "神经病在场" : "无神经病"}</span>
      </button>
    </div>
  );
}
