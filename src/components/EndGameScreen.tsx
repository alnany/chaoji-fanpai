"use client";
import { useGame } from "@/lib/store";
import { Die } from "./Die";
import { sfx } from "@/lib/sfx";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useT, useLang } from "@/lib/i18n";

const ROLL_MS = 1300;

/**
 * End-game screen — "YOU LOSE" ceremony + final roll on the same surface.
 * Plays gong + slam headline on mount, then fades the roll area in below.
 */
export function EndGameScreen() {
  const { dicePool, finalRolls, rollFinal, reroll, rerollsLeft, resetGame } =
    useGame();
  const [keep, setKeep] = useState<boolean[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollMask, setRollMask] = useState<boolean[]>([]);
  const [reveal, setReveal] = useState(false);
  const t = useT();
  const lang = useLang((s) => s.lang);

  const hasRolled = finalRolls.length > 0;
  const total = finalRolls.reduce((a, b) => a + b, 0);

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

  // EN headline is longer ("YOU LOSE"), so scale the font down a notch
  // compared to the 3-char Chinese headline to keep it on one line.
  const headlineStyle =
    lang === "en"
      ? { fontSize: "clamp(72px, 18vw, 150px)", letterSpacing: "0.02em" }
      : { fontSize: "clamp(96px, 26vw, 200px)" };

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto text-center"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(30,15,15,0.98) 0%, rgba(10,5,5,1) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none lose-vignette" />

      <div className="relative z-10 min-h-full flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md space-y-7">
          <div
            className="font-brush text-[var(--color-cinnabar)] leading-none whitespace-nowrap lose-slam"
            style={{
              ...headlineStyle,
              textShadow:
                "0 0 30px rgba(198,42,42,0.65), 0 4px 0 rgba(0,0,0,0.5)",
            }}
          >
            {t("end.headline")}
          </div>

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
                {t("end.rollN.before")}
                <b className="font-brush text-xl text-[var(--color-cinnabar)]">
                  {dicePool}
                </b>
                {t("end.rollN.after")}
                <div className="text-xs opacity-75 mt-0.5">
                  {t("end.rollN.sub")}
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
                    {rolling ? t("dice.btn.rolling") : t("end.btn.roll")}
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
                        title={keep[i] ? t("end.die.keep") : t("end.die.reroll")}
                        disabled={rolling}
                      >
                        <Die value={v} rolling={rollMask[i] ?? false} size={64} />
                        <div className="text-[10px] mt-1 text-[var(--color-ink)]">
                          {keep[i] ? t("end.die.keep") : t("end.die.reroll")}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="text-[var(--color-ink)] font-brush text-3xl">
                    {t("end.total", { n: total })}
                  </div>

                  <button
                    onClick={doReroll}
                    disabled={rerollsLeft <= 0 || rolling}
                    className="w-full py-2.5 rounded-lg bg-[var(--color-ink)] text-[var(--color-ivory)] text-sm disabled:opacity-40"
                  >
                    {rolling
                      ? t("dice.btn.rolling")
                      : t("end.reroll.label", { n: rerollsLeft })}
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
              {t("end.again")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
