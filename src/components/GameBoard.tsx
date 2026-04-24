"use client";
import { useGame } from "@/lib/store";
import { FlipCard } from "./CardFace";
import { GlobalHud } from "./GlobalHud";
import { InitialRoll } from "./DiceControls";
import { RuleModal } from "./RuleModal";
import { useEffect, useState } from "react";

export function GameBoard() {
  const {
    deck,
    discard,
    lastFlipped,
    showRule,
    flipCard,
    initialRollDone,
    resetGame,
    phase,
  } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [instant, setInstant] = useState(false);

  // When a card flips, animate forward. When modal closes, snap back instantly
  // (no reverse animation) so the deck looks static until user taps again.
  useEffect(() => {
    if (showRule && lastFlipped) {
      setInstant(false);
      setFlipped(true);
      return;
    }
    if (!showRule && flipped) {
      setInstant(true);
      setFlipped(false);
      // Re-enable transitions on the next paint so future flips animate.
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setInstant(false));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    }
  }, [showRule, lastFlipped, flipped]);

  const handleFlip = () => {
    if (!initialRollDone) return;
    if (showRule) return;
    if (deck.length === 0) return;
    flipCard();
  };

  const progress = ((discard.length / 34) * 100).toFixed(0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <div className="font-brush text-2xl leading-none text-[var(--color-cinnabar)]">
            超级翻牌
          </div>
          <div className="font-display italic text-[10px] opacity-60 mt-0.5">
            Chaoji Fanpai · 港风酒局
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("重开一局？")) resetGame();
          }}
          className="text-xs px-3 py-1 rounded-full border border-[var(--color-ivory)]/30 opacity-70 hover:opacity-100"
        >
          重开
        </button>
      </header>

      {/* Progress */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between text-[10px] opacity-60 mb-1">
          <span>剩 {deck.length} 张</span>
          <span>{progress}% 已翻</span>
        </div>
        <div className="h-1 rounded-full bg-[var(--color-ivory)]/10 overflow-hidden">
          <div
            className="h-full bg-[var(--color-red-gold)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Deck area — card scales to fill most of the viewport, matching the flipped view */}
      <div
        className="flex-1 flex items-center justify-center px-3 relative min-h-0 transition-[padding] duration-300"
        style={{ paddingTop: "0.5rem", paddingBottom: showRule ? "6rem" : "0.5rem" }}
      >
        {deck.length > 0 ? (
          <div
            className="relative w-full"
            style={{
              maxWidth: `min(100%, calc((100vh - ${showRule ? "17rem" : "12rem"}) * 0.72))`,
              aspectRatio: "0.72 / 1",
            }}
          >
            {/* Stacked shadow cards */}
            {[...Array(Math.min(4, deck.length - 1))].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-xl paper gold-edge"
                style={{
                  transform: `translate(${(i + 1) * 4}px, ${(i + 1) * 4}px) rotate(${
                    (i + 1) * 0.6
                  }deg)`,
                  opacity: 0.6 - i * 0.1,
                  zIndex: -i - 1,
                }}
              />
            ))}
            <FlipCard
              card={lastFlipped}
              flipped={flipped}
              instant={instant}
              className="w-full h-full float-idle"
              onClick={handleFlip}
            />
          </div>
        ) : (
          <div className="text-center space-y-2 opacity-70">
            <div className="font-brush text-3xl">牌已翻完</div>
            <button
              onClick={resetGame}
              className="text-sm underline underline-offset-4"
            >
              重开一局
            </button>
          </div>
        )}
      </div>

      <div className="text-center pb-6 text-xs opacity-60">
        {deck.length > 0 && !showRule && initialRollDone && "点牌堆翻下一张"}
      </div>

      {!initialRollDone && phase === "playing" && <InitialRoll />}
      <RuleModal />
      <GlobalHud />
    </div>
  );
}
