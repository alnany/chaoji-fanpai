"use client";
import { useGame } from "@/lib/store";
import { RULES } from "@/lib/rules";
import { CardFront } from "./CardFace";
import { JDicePrompt } from "./DiceControls";
import { KRecorder } from "./KRecorder";
import { useEffect, useState } from "react";

export function RuleModal() {
  const { showRule, lastFlipped, nineCount, aceCount, closeRule, phase } =
    useGame();
  const [subpanel, setSubpanel] = useState<null | "j" | "k">(null);
  const [showBody, setShowBody] = useState(false);

  // J / K cards are blocking: must complete their action before proceeding.
  useEffect(() => {
    if (!showRule) return;
    setShowBody(false);
    if (lastFlipped?.rank === "J") setSubpanel("j");
    else if (lastFlipped?.rank === "K") setSubpanel("k");
    else setSubpanel(null);
  }, [showRule, lastFlipped]);

  if (!showRule || !lastFlipped) return null;
  const rule = RULES[lastFlipped.rank];
  const isJBlocking = lastFlipped.rank === "J";
  const isKBlocking = lastFlipped.rank === "K";
  const hasActionPanel = isJBlocking || isKBlocking;

  const close = () => {
    setSubpanel(null);
    setShowBody(false);
    closeRule();
  };

  // Contextual hints
  let context: string | null = null;
  if (lastFlipped.rank === "9") {
    context = `第 ${nineCount} 张 9 · 指定一人喝 ${nineCount} 杯`;
  } else if (lastFlipped.rank === "A") {
    if (aceCount < 4) {
      context = `第 ${aceCount} 张 A · 无事发生，继续翻`;
    } else {
      context = "第 4 张 A · 游戏结束 💀";
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-[var(--color-ink)]/95 backdrop-blur-sm flex flex-col">
      {/* Top contextual badge */}
      <div className="shrink-0 pt-[max(env(safe-area-inset-top),1rem)] px-4 flex justify-center">
        {context && (
          <div className="px-3 py-1.5 rounded-full bg-[var(--color-cinnabar)] text-[var(--color-ivory)] text-xs font-display shadow-lg">
            {context}
          </div>
        )}
      </div>

      {/* Big card — takes most of the screen */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-3">
        <div className="h-full w-full max-w-[min(100%,calc((100vh-18rem)*0.72))] flex items-center justify-center">
          <CardFront card={lastFlipped} className="w-full h-full" />
        </div>
      </div>

      {/* Card title (compact, under card) */}
      <div className="shrink-0 text-center px-6 pb-2">
        <div className={`font-brush text-2xl ${rule.color} leading-tight`}>
          {rule.title}
        </div>
        <div className="text-xs opacity-60 italic mt-0.5">{rule.subtitle}</div>
      </div>

      {/* Action panel (J dice / K recorder) */}
      {hasActionPanel && (
        <div className="shrink-0 px-4 pb-2">
          <div className="max-w-md mx-auto kraft rounded-xl gold-edge p-3">
            {isJBlocking && <JDicePrompt onClose={close} />}
            {isKBlocking && <KRecorder onClose={close} />}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="shrink-0 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-2">
        <div className="max-w-md mx-auto flex gap-2 items-stretch">
          <button
            onClick={() => setShowBody(true)}
            className="shrink-0 px-4 py-3 rounded-lg border border-[var(--color-red-gold)]/60 text-[var(--color-red-gold)] text-sm font-display"
            aria-label="查看规则"
          >
            📖 规则
          </button>
          {hasActionPanel ? (
            <div className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg border border-[var(--color-cinnabar)]/40 text-[var(--color-cinnabar)] text-xs text-center">
              {isJBlocking
                ? "⚠️ 必须加骰子才能继续"
                : "⚠️ 必须完成录音才能继续"}
            </div>
          ) : (
            <button
              onClick={close}
              className="flex-1 py-3 rounded-lg bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-lg gold-edge"
            >
              {phase === "ended" ? "进入终局" : "完成 · 下一位"}
            </button>
          )}
        </div>
      </div>

      {/* Rule body bottom sheet (opt-in) */}
      {showBody && (
        <div
          className="absolute inset-0 z-10 bg-[var(--color-ink)]/70 backdrop-blur-md flex items-end"
          onClick={() => setShowBody(false)}
        >
          <div
            className="w-full kraft rounded-t-2xl gold-edge p-5 space-y-3 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className={`font-brush text-2xl ${rule.color}`}>
                {rule.title} · 规则
              </div>
              <button
                onClick={() => setShowBody(false)}
                className="w-8 h-8 rounded-full border border-[var(--color-ink)]/30 text-[var(--color-ink)]"
                aria-label="关闭规则"
              >
                ✕
              </button>
            </div>
            <ul className="space-y-1.5 text-sm text-[var(--color-ink)]/90">
              {rule.body.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--color-cinnabar)] shrink-0">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
