"use client";
import { useGame } from "@/lib/store";
import { RULES } from "@/lib/rules";
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
  const { showRule, lastFlipped, closeRule, phase, nineCount, aceCount } = useGame();
  const [showBody, setShowBody] = useState(false);

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
                p = { head: "大喊「我脑子有病！」", sub: "谁跟你说话 · 罚 1 杯" };
                break;
              case "4":
                p = { head: "咬住纸巾传下家", sub: "手碰 1 杯 · 掉地交杯酒" };
                break;
              case "7":
                p = { head: "真心话 or 大冒险", sub: "先举手的出题 · 拒绝罚 10 杯" };
                break;
              case "9":
                p = { head: `指定一个人喝 ${nineCount} 杯`, sub: "不能指自己 · 不能拆" };
                break;
              case "10":
                p = { head: "方向反转", sub: "下一个换上家" };
                break;
              case "K":
                p = { head: "喝 1 杯", sub: "口头定义下一张 K 的喝法" };
                break;
              case "A": {
                const left = 4 - aceCount;
                p = { head: `第 ${aceCount} 张 A · 还有 ${left} 张`, sub: "第 4 张 A 开终局" };
                break;
              }
              case "JOKER":
                p = { head: "找一个人猜拳，输的认主人", sub: "主人罚酒可找狗代喝" };
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
              onClick={() => { sfx.softTap(); setShowBody((v) => !v); }}
              className="shrink-0 px-4 py-3 rounded-lg bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-red-gold)]/60 text-[var(--color-red-gold)] text-sm font-display"
              aria-label="查看规则"
            >
              📖 规则
            </button>
            {isJBlocking ? (
              <div className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-cinnabar)]/40 text-[var(--color-cinnabar)] text-xs text-center">
                ⚠️ 必须加骰子才能继续
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
                {rule.title} · 规则
              </div>
              <button
                onClick={() => { sfx.softTap(); setShowBody(false); }}
                className="text-xs opacity-60 italic"
              >
                关闭
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
