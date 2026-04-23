"use client";
import { type Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@/lib/deck";
import clsx from "clsx";

export function CardBack({ className = "" }: { className?: string }) {
  return (
    <div
      className={clsx(
        "rounded-xl paper gold-edge relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-2 rounded-lg border border-[var(--color-red-gold)]/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className="font-brush text-5xl leading-none"
            style={{ color: "var(--color-cinnabar)" }}
          >
            翻
          </div>
          <div
            className="font-brush text-3xl leading-none mt-1"
            style={{ color: "var(--color-cinnabar)" }}
          >
            牌
          </div>
        </div>
      </div>
      {/* corner ornaments */}
      <div className="absolute top-2 left-2 text-xs text-[var(--color-red-gold)] font-display italic">
        Chaoji
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-[var(--color-red-gold)] font-display italic rotate-180">
        Fanpai
      </div>
    </div>
  );
}

export function CardFront({
  card,
  className = "",
}: {
  card: Card;
  className?: string;
}) {
  const red = isRed(card.suit);
  const isJoker = card.rank === "JOKER";
  const label = RANK_LABEL[card.rank];
  const symbol = SUIT_SYMBOL[card.suit];
  const accent = red ? "var(--color-cinnabar)" : "var(--color-ink)";

  return (
    <div
      className={clsx(
        "rounded-xl paper gold-edge relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-2 rounded-lg border border-[var(--color-red-gold)]/60" />

      {isJoker ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
          <div
            className="font-brush text-5xl leading-none"
            style={{ color: "var(--color-cinnabar)" }}
          >
            小丑
          </div>
          <div className="text-5xl">🃏</div>
          <div
            className="font-display italic text-sm opacity-70"
            style={{ color: accent }}
          >
            JOKER
          </div>
        </div>
      ) : (
        <>
          {/* top-left */}
          <div
            className="absolute top-2 left-3 text-left leading-none"
            style={{ color: accent }}
          >
            <div className="text-2xl font-bold">{label}</div>
            <div className="text-xl -mt-0.5">{symbol}</div>
          </div>
          {/* bottom-right mirror */}
          <div
            className="absolute bottom-2 right-3 text-right leading-none rotate-180"
            style={{ color: accent }}
          >
            <div className="text-2xl font-bold">{label}</div>
            <div className="text-xl -mt-0.5">{symbol}</div>
          </div>
          {/* center big */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: accent }}
          >
            <div className="text-7xl drop-shadow-sm">{symbol}</div>
          </div>
        </>
      )}
    </div>
  );
}

export function FlipCard({
  card,
  flipped,
  className = "",
  onClick,
}: {
  card: Card | null;
  flipped: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "perspective-1000 cursor-pointer select-none focus:outline-none",
        className
      )}
      aria-label="flip card"
    >
      <div
        className={clsx(
          "relative w-full h-full preserve-3d transition-transform duration-700 ease-out",
          flipped && "rotate-y-180"
        )}
      >
        <div className="absolute inset-0 backface-hidden">
          <CardBack className="w-full h-full" />
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          {card ? (
            <CardFront card={card} className="w-full h-full" />
          ) : (
            <CardBack className="w-full h-full" />
          )}
        </div>
      </div>
    </button>
  );
}
