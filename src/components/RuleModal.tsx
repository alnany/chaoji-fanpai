"use client";
import { useGame } from "@/lib/store";
import { getRules } from "@/lib/i18n";
import { useT, useLang } from "@/lib/i18n";
import { JDicePrompt } from "./DiceControls";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

/**
 * RuleModal — inline action bar + optional rule body sheet.
 * The deck card itself flips in place (see GameBoard); this component does
 * NOT switch to a new screen. It only renders the bottom controls and an
 * optional rule body drawer.
 */
export function RuleModal() {
  const { showRule, lastFlipped, closeRule, phase, nineCount, aceCount } =
    useGame();
  const [showBody, setShowBody] = useState(false);
  const t = useT();
  const lang = useLang((s) => s.lang);
  const RULES = getRules(lang);

  useEffect(() => {
    if (!showRule) setShowBody(false);
  }, [showRule]);

  if (!showRule || !lastFlipped) return null;

  const rule = RULES[lastFlipped.rank];
  const isJBlocking = lastFlipped.rank === "J";

  const close = () => {
    sfx.click();
    setShowBody(false);
    closeRule();
  };

  return (
    <>
      {/* Bottom action bar — sits above the deck, does NOT cover the card */}
      <div className="fixed left-0 right-0 bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto space-y-2">
          {isJBlocking && (
            <div className="kraft rounded-xl gold-edge p-3">
              <JDicePrompt onClose={close} />
            </div>
          )}
          {(() => {
            // Direct action prompt shown above the bottom buttons.
            // J is skipped because its JDicePrompt already IS a direct action.
            const rank = lastFlipped.rank;
            type Prompt = { head: string; sub?: string };
            let p: Prompt | null = null;
            switch (rank) {
              case "3":
                p = { head: t("prompt.3.head"), sub: t("prompt.3.sub") };
                break;
              case "4":
                p = { head: t("prompt.4.head"), sub: t("prompt.4.sub") };
                break;
              case "7":
                p = { head: t("prompt.7.head"), sub: t("prompt.7.sub") };
                break;
              case "9":
                p = {
                  head: t("prompt.9.head", { n: nineCount }),
                  sub: t("prompt.9.sub"),
                };
                break;
              case "10":
                p = { head: t("prompt.10.head"), sub: t("prompt.10.sub") };
                break;
              case "K":
                p = { head: t("prompt.K.head"), sub: t("prompt.K.sub") };
                break;
              case "A": {
                const left = 4 - aceCount;
                p = {
                  head: t("prompt.A.head", { n: aceCount, left }),
                  sub: t("prompt.A.sub"),
                };
                break;
              }
              case "JOKER":
                p = {
                  head: t("prompt.JOKER.head"),
                  sub: t("prompt.JOKER.sub"),
                };
                break;
              default:
                p = null;
            }
            if (!p) return null;
            return (
              <div className="kraft rounded-xl gold-edge px-4 py-3 text-center">
                <div className="font-brush text-3xl text-[var(--color-cinnabar)] leading-tight">
                  {p.head}
                </div>
                {p.sub && (
                  <div className="mt-1 text-[11px] text-[var(--color-ink)]/70">
                    {p.sub}
                  </div>
                )}
              </div>
            );
          })()}
          <div className="flex gap-2 items-stretch">
            <button
              onClick={() => {
                sfx.softTap();
                setShowBody((v) => !v);
              }}
              className="shrink-0 px-4 py-3 rounded-lg bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-red-gold)]/60 text-[var(--color-red-gold)] text-sm font-display"
              aria-label={t("rule.btn.openBody.aria")}
            >
              {t("rule.btn.openBody")}
            </button>
            {isJBlocking ? (
              <div className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-cinnabar)]/40 text-[var(--color-cinnabar)] text-xs text-center">
                {t("rule.btn.jBlock")}
              </div>
            ) : (
              <button
                onClick={close}
                className="flex-1 py-3 rounded-lg bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-lg gold-edge"
              >
                {phase === "ended"
                  ? t("rule.btn.gameOver")
                  : t("rule.btn.next")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rule body — optional bottom sheet, click anywhere to dismiss */}
      {showBody && (
        <div
          className="fixed inset-0 z-40 bg-[var(--color-ink)]/60 backdrop-blur-sm flex items-end cursor-pointer"
          onClick={() => setShowBody(false)}
        >
          <div
            className="w-full kraft rounded-t-2xl gold-edge p-5 space-y-3 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className={`font-brush text-2xl ${rule.color}`}>
                {rule.title} {t("rule.body.titleSuffix")}
              </div>
              <button
                onClick={() => {
                  sfx.softTap();
                  setShowBody(false);
                }}
                className="text-xs opacity-60 italic"
              >
                {t("rule.body.close")}
              </button>
            </div>
            <ul className="space-y-1.5 text-sm text-[var(--color-ink)]/90">
              {rule.body.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--color-cinnabar)] shrink-0">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
