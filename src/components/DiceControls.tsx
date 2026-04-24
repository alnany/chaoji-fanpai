"use client";
import { useGame } from "@/lib/store";
import { useState } from "react";
import { Die } from "./Die";

export function InitialRoll() {
  const { initialRollDone, setInitialDice, dicePool } = useGame();
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState<number | null>(null);

  if (initialRollDone) return null;

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    // Let the 3D tumble animation play for ~1.3s, then lock the final face.
    setTimeout(() => {
      const result = 1 + Math.floor(Math.random() * 6);
      setFace(result);
      setRolling(false);
      setTimeout(() => setInitialDice(result), 800);
    }, 1300);
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
        <div
          className="flex justify-center items-end"
          style={{ perspective: 800, height: 200 }}
        >
          <Die value={face ?? 6} rolling={rolling} size={160} />
        </div>
        <button
          onClick={roll}
          disabled={rolling}
          className="w-full py-3 rounded-xl font-brush text-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] gold-edge disabled:opacity-60"
        >
          {rolling ? "摇中..." : face ? `确认 ${face} 颗` : "摇"}
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

/* Legacy thin wrapper kept for any imports — renders the new realistic Die. */
export function DieFace({
  n,
  rolling = false,
  size = 64,
}: {
  n: number;
  rolling?: boolean;
  tone?: "gold" | "ink" | "cinnabar";
  size?: number;
}) {
  return <Die value={n} rolling={rolling} size={size} />;
}
