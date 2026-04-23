"use client";
import { useGame } from "@/lib/store";
import { useState } from "react";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function InitialRoll() {
  const { initialRollDone, setInitialDice, dicePool } = useGame();
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState<number | null>(null);

  if (initialRollDone) return null;

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    const interval = setInterval(() => {
      setFace(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 6) + 1;
        setFace(result);
        setRolling(false);
        setTimeout(() => setInitialDice(result), 800);
      }
    }, 80);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div>
          <div className="font-brush text-3xl text-[var(--color-cinnabar)] mb-2">
            开局摇骰
          </div>
          <div className="text-sm opacity-70">
            一人摇一颗，点数即初始骰池数量
          </div>
        </div>
        <div className="flex justify-center">
          <div
            className={`text-9xl ${rolling ? "die-rolling" : ""}`}
            style={{ color: "var(--color-red-gold)" }}
          >
            {face ? DIE_FACES[face] : "⚅"}
          </div>
        </div>
        <button
          onClick={roll}
          disabled={rolling}
          className="w-full py-3 rounded-xl font-brush text-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] gold-edge disabled:opacity-60"
        >
          {rolling ? "摇..." : face ? `确认 ${face} 颗` : "摇"}
        </button>
        <div className="text-xs opacity-50">当前骰池：{dicePool}</div>
      </div>
    </div>
  );
}

export function JDicePrompt({ onClose }: { onClose: () => void }) {
  const { addDice } = useGame();
  const [picked, setPicked] = useState<number | null>(null);

  const confirm = () => {
    if (!picked) return;
    addDice(picked);
    onClose();
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="text-center opacity-70 text-sm">本次加多少颗？</div>
      <div className="flex gap-2 justify-center">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setPicked(n)}
            className={`w-14 h-14 rounded-xl border text-2xl font-display ${
              picked === n
                ? "bg-[var(--color-red-gold)] text-[var(--color-ink)] border-[var(--color-red-gold)]"
                : "border-[var(--color-red-gold)]/50 hover:bg-[var(--color-red-gold)]/10"
            }`}
          >
            +{n}
          </button>
        ))}
      </div>
      <button
        onClick={confirm}
        disabled={!picked}
        className="w-full py-2.5 rounded-lg bg-[var(--color-jade)] text-[var(--color-ivory)] disabled:opacity-50"
      >
        确认加入骰池
      </button>
    </div>
  );
}

export function DieFace({
  n,
  rolling = false,
  tone = "gold",
}: {
  n: number;
  rolling?: boolean;
  tone?: "gold" | "ink" | "cinnabar";
}) {
  const color =
    tone === "ink"
      ? "var(--color-ink)"
      : tone === "cinnabar"
      ? "var(--color-cinnabar)"
      : "var(--color-red-gold)";
  return (
    <span
      className={`text-6xl ${rolling ? "die-rolling" : ""}`}
      style={{ color, textShadow: tone === "ink" ? "0 1px 0 rgba(255,255,255,0.3)" : undefined }}
    >
      {DIE_FACES[n] || "⚀"}
    </span>
  );
}
