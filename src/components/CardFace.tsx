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
      <div className="absolute top-2 left-2 text-xs text-[var(--color-red-gold)] font-display italic">
        Chaoji
      </div>
      <div className="absolute bottom-2 right-2 text-xs text-[var(--color-red-gold)] font-display italic rotate-180">
        Fanpai
      </div>
    </div>
  );
}

/** Pip layouts for numbered ranks, using a 7-row grid (like real poker cards). */
const PIP_GRIDS: Record<string, [number, number][]> = {
  // rows (0=top, 6=bottom), cols (0=left, 1=center, 2=right)
  "3": [
    [0, 1],
    [3, 1],
    [6, 1],
  ],
  "4": [
    [0, 0],
    [0, 2],
    [6, 0],
    [6, 2],
  ],
  "7": [
    [0, 0],
    [0, 2],
    [1, 1],
    [3, 0],
    [3, 2],
    [6, 0],
    [6, 2],
  ],
  "9": [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
    [3, 1],
    [4, 0],
    [4, 2],
    [6, 0],
    [6, 2],
  ],
  "10": [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
    [4, 0],
    [4, 2],
    [5, 1],
    [6, 0],
    [6, 2],
  ],
};

function PipGrid({
  rank,
  symbol,
  color,
}: {
  rank: string;
  symbol: string;
  color: string;
}) {
  const cells = PIP_GRIDS[rank] || [];
  const maxRow = 6;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[58%] h-[78%]">
        {cells.map(([r, c], i) => {
          const top = (r / maxRow) * 100;
          const left = c === 0 ? 0 : c === 1 ? 50 : 100;
          // flip bottom half upside-down like real cards
          const flipped = r > maxRow / 2;
          return (
            <div
              key={i}
              className="absolute leading-none"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-50%, -50%) ${
                  flipped ? "rotate(180deg)" : ""
                }`,
                color,
                fontSize: "clamp(18px, 5.5vh, 36px)",
              }}
            >
              {symbol}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Stylized face illustration for J / K using CSS + emoji glyphs. */
function FaceArt({
  rank,
  symbol,
  color,
  red,
}: {
  rank: "J" | "K";
  symbol: string;
  color: string;
  red: boolean;
}) {
  const glyph = rank === "K" ? "♚" : "♞"; // king / knight as stand-in for J
  const cn = rank === "K" ? "国王" : "侍卫";
  return (
    <div className="absolute inset-0 flex items-center justify-center px-[18%] py-[12%]">
      <div
        className={clsx(
          "relative w-full h-full rounded-md overflow-hidden flex items-center justify-center",
          "border-2",
          red
            ? "border-[var(--color-cinnabar)]/50 bg-[var(--color-cinnabar)]/5"
            : "border-[var(--color-ink)]/40 bg-[var(--color-ink)]/5"
        )}
      >
        {/* diagonal mirror split like a real face card */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, transparent 49.5%, ${color} 49.5%, ${color} 50.5%, transparent 50.5%)`,
          }}
        />
        <div
          className="relative flex flex-col items-center gap-1 leading-none"
          style={{ color }}
        >
          <div style={{ fontSize: "clamp(44px, 16vh, 96px)" }}>{glyph}</div>
          <div className="font-brush text-xl opacity-80">{cn}</div>
          <div style={{ fontSize: "clamp(18px, 4vh, 28px)" }}>{symbol}</div>
        </div>
      </div>
    </div>
  );
}

/** Big centered suit for A. */
function AceCenter({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ color }}
    >
      <div
        className="drop-shadow"
        style={{ fontSize: "clamp(80px, 26vh, 180px)" }}
      >
        {symbol}
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
  const color = red ? "var(--color-cinnabar)" : "var(--color-ink)";

  return (
    <div
      className={clsx(
        "rounded-xl paper gold-edge relative overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-1.5 rounded-lg border border-[var(--color-red-gold)]/50 pointer-events-none" />

      {isJoker ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
          <div
            className="font-brush leading-none"
            style={{
              color: "var(--color-cinnabar)",
              fontSize: "clamp(40px, 12vh, 72px)",
            }}
          >
            小丑
          </div>
          <div style={{ fontSize: "clamp(48px, 16vh, 96px)" }}>🃏</div>
          <div
            className="font-display italic opacity-70"
            style={{ color, fontSize: "clamp(12px, 2vh, 16px)" }}
          >
            JOKER
          </div>
        </div>
      ) : (
        <>
          {/* Corner rank + suit — BIG */}
          <div
            className="absolute top-2 left-2.5 text-left leading-[0.9] font-display font-bold"
            style={{ color }}
          >
            <div style={{ fontSize: "clamp(24px, 6.5vh, 44px)" }}>{label}</div>
            <div
              style={{ fontSize: "clamp(18px, 5vh, 32px)", marginTop: 2 }}
            >
              {symbol}
            </div>
          </div>
          <div
            className="absolute bottom-2 right-2.5 text-right leading-[0.9] font-display font-bold rotate-180"
            style={{ color }}
          >
            <div style={{ fontSize: "clamp(24px, 6.5vh, 44px)" }}>{label}</div>
            <div
              style={{ fontSize: "clamp(18px, 5vh, 32px)", marginTop: 2 }}
            >
              {symbol}
            </div>
          </div>

          {/* Center art */}
          {card.rank === "A" && <AceCenter symbol={symbol} color={color} />}
          {(card.rank === "J" || card.rank === "K") && (
            <FaceArt
              rank={card.rank as "J" | "K"}
              symbol={symbol}
              color={color}
              red={red}
            />
          )}
          {["3", "4", "7", "9", "10"].includes(card.rank) && (
            <PipGrid rank={card.rank} symbol={symbol} color={color} />
          )}
        </>
      )}
    </div>
  );
}

export function FlipCard({
  card,
  flipped,
  instant = false,
  className = "",
  onClick,
}: {
  card: Card | null;
  flipped: boolean;
  instant?: boolean;
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
          "relative w-full h-full preserve-3d ease-out",
          instant ? "transition-none" : "transition-transform duration-700",
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
