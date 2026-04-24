"use client";
import { useGame } from "@/lib/store";
import { Die } from "./Die";
import { sfx } from "@/lib/sfx";
import { useEffect, useState } from "react";
import clsx from "clsx";

const ROLL_MS = 1300;

/**
 * 游戏结束屏 —— 「你输了」仪式感 + 摇骰判罚 合并为同一个界面。
 * 挂载即播锣 + 砸「你输了」，无需二次切换，直接在下方吊出骰池。
 */
export function EndGameScreen() {
  const { dicePool, finalRolls, rollFinal, reroll, rerollsLeft, resetGame } =
    useGame();
  const [keep, setKeep] = useState<boolean[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollMask, setRollMask] = useState<boolean[]>([]);
  const [reveal, setReveal] = useState(false);

  const hasRolled = finalRolls.length > 0;
  const total = finalRolls.reduce((a, b) => a + b, 0);

  // 挂载：锣响 + 砸字，短暂延迟后让下方摇骰区淡入，不切屏。
  useEffect(() => {
    sfx.gong();
    const t = setTimeout(() => setReveal(true), 650);
    return () => clearTimeout(t);
  }, []);

  const doRoll = () => {
    sfx.diceRollStart();
    setRolling(true);
    setRollMask(new Array(dicePool).fill(true));
    setTimeout(() => {
      rollFinal();
      setKeep(new Array(dicePool).fill(false));
      setRolling(false);
      setRollMask(new Array(dicePool).fill(false));
      sfx.diceLand();
    }, ROLL_MS);
  };

  const doReroll = () => {
    sfx.diceRollStart();
    setRolling(true);
    setRollMask(keep.map((k) => !k));
    setTimeout(() => {
      reroll(keep);
      setRolling(false);
      setRollMask(new Array(finalRolls.length).fill(false));
      sfx.diceLand();
    }, ROLL_MS);
  };

  const toggleKeep = (i: number) => {
    if (rolling) return;
    sfx.softTap();
    setKeep((k) => {
      const n = [...k];
      n[i] = !n[i];
      return n;
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto text-center"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(30,15,15,0.98) 0%, rgba(10,5,5,1) 100%)",
      }}
    >
      {/* 红晕脉动始终在位，延续压迫感 */}
      <div className="absolute inset-0 pointer-events-none lose-vignette" />

      <div className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md space-y-7">
          {/* 砸屏「你输了」 */}
          <div
            className="font-brush text-[var(--color-cinnabar)] leading-none whitespace-nowrap lose-slam"
            style={{
              fontSize: "clamp(96px, 26vw, 200px)",
              textShadow:
                "0 0 30px rgba(198,42,42,0.65), 0 4px 0 rgba(0,0,0,0.5)",
            }}
          >
            你输了
          </div>

          {/* 摇骰区：砸字落定后淡入，同屏衔接 */}
          <div
            style={{
              opacity: reveal ? 1 : 0,
              transform: reveal ? "translateY(0)" : "translateY(12px)",
              transition:
                "opacity 600ms ease 120ms, transform 600ms ease 120ms",
            }}
            className="space-y-5"
          >
            <div className="kraft rounded-2xl gold-edge p-5 space-y-4">
              <div className="text-[var(--color-ink)] text-sm leading-relaxed">
                摇{" "}
                <b className="font-brush text-xl text-[var(--color-cinnabar)]">
                  {dicePool}
                </b>{" "}
                颗骰子
                <div className="text-xs opacity-75 mt-0.5">
                  点数之和 = 你要喝的杯数
                </div>
              </div>

              {!hasRolled ? (
                <>
                  {rolling && (
                    <div
                      className="flex flex-wrap gap-3 justify-center py-3"
                      style={{ perspective: 900 }}
                    >
                      {Array.from({ length: dicePool }).map((_, i) => (
                        <Die key={i} value={1} rolling size={72} />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={doRoll}
                    disabled={rolling}
                    className="w-full py-4 rounded-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-2xl gold-edge disabled:opacity-60"
                  >
                    {rolling ? "摇中..." : "开摇"}
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="flex flex-wrap gap-3 justify-center py-2"
                    style={{ perspective: 900 }}
                  >
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
                        disabled={rolling}
                      >
                        <Die value={v} rolling={rollMask[i] ?? false} size={64} />
                        <div className="text-[10px] mt-1 text-[var(--color-ink)]">
                          {keep[i] ? "保留" : "可重摇"}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-[var(--color-ink)] font-brush text-3xl">
                    合计 {total} 杯 🍺
                  </div>

                  <button
                    onClick={doReroll}
                    disabled={rerollsLeft <= 0 || rolling}
                    className="w-full py-2.5 rounded-lg bg-[var(--color-ink)] text-[var(--color-ivory)] text-sm disabled:opacity-40"
                  >
                    {rolling
                      ? "摇中..."
                      : `重摇 · 剩 ${rerollsLeft} 次 · 代价：亲一口 💋`}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => {
                sfx.click();
                resetGame();
              }}
              className="text-sm text-[var(--color-ivory)]/60 hover:text-[var(--color-ivory)] underline underline-offset-4"
            >
              再来一局
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
