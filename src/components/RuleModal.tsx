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

  // J / K cards are blocking: must complete their action (add dice / record) before proceeding.
  useEffect(() => {
    if (showRule && lastFlipped?.rank === "J") setSubpanel("j");
    else if (showRule && lastFlipped?.rank === "K") setSubpanel("k");
  }, [showRule, lastFlipped]);

  if (!showRule || !lastFlipped) return null;
  const rule = RULES[lastFlipped.rank];
  const isJBlocking = lastFlipped.rank === "J";
  const isKBlocking = lastFlipped.rank === "K";

  const close = () => {
    setSubpanel(null);
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
    <div className="fixed inset-0 z-40 bg-[var(--color-ink)]/90 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="max-w-md w-full kraft rounded-2xl gold-edge p-5 space-y-4 my-auto">
          {/* Card preview */}
          <div className="flex items-start gap-4">
            <div className="w-24 h-32 shrink-0">
              <CardFront card={lastFlipped} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className={`font-brush text-3xl ${rule.color} leading-tight`}>
                {rule.title}
              </div>
              <div className="text-sm opacity-80 mt-1 italic">
                {rule.subtitle}
              </div>
              {context && (
                <div className="mt-2 inline-block px-2 py-1 rounded bg-[var(--color-cinnabar)] text-[var(--color-ivory)] text-xs">
                  {context}
                </div>
              )}
            </div>
          </div>

          {/* Rule body */}
          <ul className="space-y-1.5 text-sm text-[var(--color-ink)]/90">
            {rule.body.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-cinnabar)] shrink-0">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>

          {/* Per-card sub-panels */}
          {lastFlipped.rank === "J" && <JDicePrompt onClose={close} />}

          {lastFlipped.rank === "K" && <KRecorder onClose={close} />}

          {lastFlipped.rank === "3" && (
            <div className="rounded-lg p-3 bg-[var(--color-jade)]/20 border border-[var(--color-jade)]/40 text-[var(--color-ink)] text-xs">
              提示：右上角状态栏的「神经病」开关也已打开，切换下一个 3
              时再关掉或转移。
            </div>
          )}

          {/* Actions */}
          {isJBlocking || isKBlocking ? (
            <div className="text-center text-xs opacity-60 pt-1">
              {isJBlocking
                ? "⚠️ 必须加骰子才能继续"
                : "⚠️ 必须完成录音（回放并保存）才能继续"}
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <button
                onClick={close}
                className="flex-1 py-3 rounded-lg bg-[var(--color-ink)] text-[var(--color-ivory)] font-brush text-lg gold-edge"
              >
                {phase === "ended" ? "进入终局" : "完成 · 下一位"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
