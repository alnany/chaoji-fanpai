"use client";
import { useGame } from "@/lib/store";
import { DieFace } from "./DiceControls";
import { useState } from "react";
import clsx from "clsx";

export function EndGameScreen() {
  const { dicePool, finalRolls, rollFinal, reroll, rerollsLeft, resetGame } =
    useGame();
  const [keep, setKeep] = useState<boolean[]>([]);
  const [rolling, setRolling] = useState(false);

  const hasRolled = finalRolls.length > 0;
  const total = finalRolls.reduce((a, b) => a + b, 0);

  const doRoll = () => {
    setRolling(true);
    setTimeout(() => {
      rollFinal();
      setKeep(new Array(dicePool).fill(false));
      setRolling(false);
    }, 600);
  };

  const doReroll = () => {
    setRolling(true);
    setTimeout(() => {
      reroll(keep);
      setRolling(false);
    }, 600);
  };

  const toggleKeep = (i: number) => {
    setKeep((k) => {
      const n = [...k];
      n[i] = !n[i];
      return n;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="font-brush text-5xl text-[var(--color-cinnabar)] drop-shadow-lg">
            终局
          </div>
          <div className="font-display italic text-sm opacity-70 mt-1">
            The Fourth Ace Has Fallen
          </div>
        </div>

        <div className="kraft rounded-2xl gold-edge p-5 space-y-4">
          <div className="text-[var(--color-ink)] text-sm">
            抽到第 4 张 A 的人，摇 <b>{dicePool}</b> 颗骰子
          </div>

          {!hasRolled ? (
            <button
              onClick={doRoll}
              disabled={rolling}
              className="w-full py-4 rounded-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-2xl gold-edge disabled:opacity-60"
            >
              {rolling ? "摇..." : "开摇"}
            </button>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 justify-center py-2">
                {finalRolls.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => toggleKeep(i)}
                    className={clsx(
                      "rounded-xl p-2 border-2 transition",
                      keep[i]
                        ? "border-[var(--color-jade)] bg-[var(--color-jade)]/30 scale-95"
                        : "border-[var(--color-red-gold)]/50 hover:border-[var(--color-red-gold)]"
                    )}
                    title={keep[i] ? "保留" : "重摇"}
                  >
                    <DieFace n={v} rolling={rolling} tone="ink" />
                    <div className="text-[10px] mt-1">
                      {keep[i] ? "保留" : "可重摇"}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-[var(--color-ink)] font-brush text-3xl">
                合计 {total} 杯 🍺
              </div>

              <div className="flex gap-2">
                <button
                  onClick={doReroll}
                  disabled={rerollsLeft <= 0 || rolling}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--color-ink)] text-[var(--color-ivory)] text-sm disabled:opacity-40"
                >
                  重摇 · 剩 {rerollsLeft} 次 · 代价：亲一口 💋
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={resetGame}
          className="text-sm opacity-70 hover:opacity-100 underline underline-offset-4"
        >
          再来一局
        </button>
      </div>
    </div>
  );
}
