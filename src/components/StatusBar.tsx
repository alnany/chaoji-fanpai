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
      label: "A 已翻",
      value: `${s.aceCount}/4`,
      tone: "bg-[var(--color-cinnabar)]/20 border-[var(--color-cinnabar)]",
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
    </div>
  );
}
