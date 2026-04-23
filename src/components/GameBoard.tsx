"use client";
import { useGame } from "@/lib/store";
import { FlipCard } from "./CardFace";
import { StatusBar } from "./StatusBar";
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

  // When a card flips, show the front briefly; when modal closes we reset.
  useEffect(() => {
    if (showRule && lastFlipped) setFlipped(true);
    if (!showRule) {
      // reset after a beat so card returns to back
      const t = setTimeout(() => setFlipped(false), 300);
      return () => clearTimeout(t);
    }
  }, [showRule, lastFlipped]);

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

      {/* Status */}
      <div className="px-4 py-2">
        <StatusBar />
      </div>

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

      {/* Deck area */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {deck.length > 0 ? (
          <div className="relative" style={{ width: 220, height: 310 }}>
            {/* Stacked shadow cards */}
            {[...Array(Math.min(4, deck.length - 1))].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-xl paper gold-edge"
                style={{
                  transform: `translate(${(i + 1) * 3}px, ${(i + 1) * 3}px) rotate(${
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
              className="w-[220px] h-[310px] float-idle"
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
    </div>
  );
}
