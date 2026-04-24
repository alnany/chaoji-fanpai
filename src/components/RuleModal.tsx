"use client";
import { useGame } from "@/lib/store";
import { RULES } from "@/lib/rules";
import { CardFront } from "./CardFace";
import { JDicePrompt } from "./DiceControls";
import { useEffect, useRef, useState } from "react";

export function RuleModal() {
  const { showRule, lastFlipped, discard, closeRule, phase } = useGame();
  const [showBody, setShowBody] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [viewIndex, setViewIndex] = useState(0); // index into discard; last = current

  // history: all flipped cards, oldest → newest. Current is discard.at(-1) = lastFlipped.
  const history = discard;
  const currentIndex = history.length - 1;
  const viewingCard = history[viewIndex] ?? lastFlipped;
  const isCurrent = viewIndex === currentIndex;

  // When modal opens, reset state and scroll to latest card
  useEffect(() => {
    if (!showRule) return;
    setShowBody(false);
    // jump to current
    setViewIndex(currentIndex);
    requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: "auto" });
    });
  }, [showRule, lastFlipped, currentIndex]);

  // Track swipe position → which card is visible
  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const idx = Math.round(el.scrollLeft / w);
    if (idx !== viewIndex) setViewIndex(idx);
  };

  if (!showRule || !lastFlipped || history.length === 0) return null;

  const rule = RULES[viewingCard.rank];
  const isJBlocking = isCurrent && lastFlipped.rank === "J";
  const hasActionPanel = isJBlocking;

  const close = () => {
    setShowBody(false);
    closeRule();
  };

  const jumpToCurrent = () => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-40 bg-[var(--color-ink)]/95 backdrop-blur-sm flex flex-col pt-[max(env(safe-area-inset-top),3.25rem)]">
      {/* Swipeable card strip */}
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex snap-x snap-mandatory no-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {history.map((c, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-full h-full flex items-center justify-center px-3 py-2 relative"
          >
            <div
              className="w-full h-full"
              style={{
                maxWidth: "min(100%, calc((100vh - 9rem) * 0.72))",
                aspectRatio: "0.72 / 1",
              }}
            >
              <CardFront card={c} className="w-full h-full" />
              {/* Historical marker */}
              {i !== currentIndex && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[var(--color-ink)]/70 border border-[var(--color-red-gold)]/60 text-[10px] font-display text-[var(--color-red-gold)] tracking-wider">
                  历史 · 第 {i + 1} 张
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress dots + history indicator */}
      {history.length > 1 && (
        <div className="shrink-0 flex items-center justify-center gap-1.5 pb-1">
          <span className="text-[10px] opacity-60 mr-1">
            ← 右滑看历史
          </span>
          {history.slice(-7).map((_, i) => {
            const realIdx = history.length - Math.min(7, history.length) + i;
            const active = realIdx === viewIndex;
            return (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  active
                    ? "bg-[var(--color-red-gold)] w-4"
                    : "bg-[var(--color-ivory)]/30"
                }`}
              />
            );
          })}
          <span className="text-[10px] opacity-60 ml-1">
            {viewIndex + 1}/{history.length}
          </span>
        </div>
      )}

      {/* Action panel (only on current card) */}
      {hasActionPanel && (
        <div className="shrink-0 px-3 pb-2">
          <div className="max-w-md mx-auto kraft rounded-xl gold-edge p-3">
            {isJBlocking && <JDicePrompt onClose={close} />}
          </div>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="shrink-0 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1">
        <div className="max-w-md mx-auto flex gap-2 items-stretch">
          <button
            onClick={() => setShowBody(true)}
            className="shrink-0 px-4 py-3 rounded-lg border border-[var(--color-red-gold)]/60 text-[var(--color-red-gold)] text-sm font-display"
            aria-label="查看规则"
          >
            📖 规则
          </button>
          {!isCurrent ? (
            <button
              onClick={jumpToCurrent}
              className="flex-1 py-3 rounded-lg bg-[var(--color-jade)]/20 border border-[var(--color-jade)]/50 text-[var(--color-jade)] font-brush text-lg"
            >
              ← 回到当前牌
            </button>
          ) : hasActionPanel ? (
            <div className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg border border-[var(--color-cinnabar)]/40 text-[var(--color-cinnabar)] text-xs text-center">
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

      {/* Rule body — shows the rule for the currently-viewed card */}
      {showBody && (
        <div
          className="absolute inset-0 z-10 bg-[var(--color-ink)]/70 backdrop-blur-md flex items-end cursor-pointer"
          onClick={() => setShowBody(false)}
        >
          <div className="w-full kraft rounded-t-2xl gold-edge p-5 space-y-3 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className={`font-brush text-2xl ${rule.color}`}>
                {rule.title} · 规则
              </div>
              <span className="text-xs opacity-60 italic">
                点任意位置关闭
              </span>
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
