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
  // Dense ranks (7/9/10) squeeze pips into a narrow middle band so the top
  // and bottom rows never reach the supersized corner numbers. Sparse ranks
  // (3/4) keep a tall grid so their few pips spread across the card.
  const dense = rank === "9" || rank === "10" || rank === "7";
  const gridHeight = dense ? "34%" : "62%";
  const gridWidth = dense ? "50%" : "52%";
  const pipFont = dense
    ? "clamp(20px, 4.6vh, 38px)"
    : "clamp(40px, 9.5vh, 78px)";
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative"
        style={{ width: gridWidth, height: gridHeight }}
      >
        {cells.map(([r, c], i) => {
          const top = (r / maxRow) * 100;
          const left = c === 0 ? 0 : c === 1 ? 50 : 100;
          const flipped = r > maxRow / 2;
          return (
            <div
              key={i}
              className="absolute leading-none font-bold"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-50%, -50%) ${
                  flipped ? "rotate(180deg)" : ""
                }`,
                color,
                fontSize: pipFont,
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
  return (
    <div className="absolute inset-0 flex items-center justify-center px-[14%] py-[16%]">
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
          className="relative flex flex-col items-center gap-3 leading-none"
          style={{ color }}
        >
          <div style={{ fontSize: "clamp(72px, 22vh, 160px)" }}>{glyph}</div>
          <div style={{ fontSize: "clamp(40px, 9vh, 70px)" }}>{symbol}</div>
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
        style={{ fontSize: "clamp(90px, 28vh, 200px)" }}
      >
        {symbol}
      </div>
    </div>
  );
}

/** Ornate joker face — decorative gold filigree, split-color backdrop,
 *  sparkles, crown, bells. No text labels. */
function JokerArt() {
  const gold = "var(--color-red-gold)";
  const red = "var(--color-cinnabar)";
  const ink = "var(--color-ink)";
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* dramatic split backdrop (red top-left / ink bottom-right) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${red}22 0%, ${red}11 48%, ${ink}11 52%, ${ink}22 100%)`,
        }}
      />
      {/* radial glow around center */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${gold}22 0%, transparent 60%)`,
        }}
      />
      {/* inner filigree frame */}
      <div
        className="absolute inset-[6%] rounded-lg pointer-events-none"
        style={{
          border: `1.5px solid ${gold}`,
          boxShadow: `inset 0 0 0 3px transparent, inset 0 0 0 4px ${gold}55`,
        }}
      />
      <div
        className="absolute inset-[8%] rounded-md pointer-events-none"
        style={{ border: `0.5px solid ${gold}99` }}
      />

      {/* corner filigree ornaments */}
      {[
        "top-[6%] left-[6%]",
        "top-[6%] right-[6%] rotate-90",
        "bottom-[6%] right-[6%] rotate-180",
        "bottom-[6%] left-[6%] -rotate-90",
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} font-display`}
          style={{ color: gold, fontSize: "clamp(18px, 4vh, 32px)" }}
        >
          ❧
        </div>
      ))}

      {/* sparkles around the face */}
      <div
        className="absolute top-[20%] left-[18%] rotate-[-15deg]"
        style={{ color: gold, fontSize: "clamp(14px, 3vh, 24px)" }}
      >
        ✦
      </div>
      <div
        className="absolute top-[20%] right-[18%] rotate-[15deg]"
        style={{ color: gold, fontSize: "clamp(14px, 3vh, 24px)" }}
      >
        ✦
      </div>
      <div
        className="absolute bottom-[22%] left-[16%]"
        style={{ color: gold, fontSize: "clamp(12px, 2.4vh, 18px)" }}
      >
        ✧
      </div>
      <div
        className="absolute bottom-[22%] right-[16%]"
        style={{ color: gold, fontSize: "clamp(12px, 2.4vh, 18px)" }}
      >
        ✧
      </div>

      {/* crown on top of joker face */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "14%",
          color: gold,
          fontSize: "clamp(36px, 10vh, 76px)",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
        }}
      >
        ♛
      </div>

      {/* main joker glyph */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          fontSize: "clamp(110px, 34vh, 240px)",
          filter:
            "drop-shadow(0 4px 10px rgba(0,0,0,0.25)) drop-shadow(0 0 2px rgba(0,0,0,0.2))",
        }}
      >
        🃏
      </div>

      {/* bells flanking the feet */}
      <div
        className="absolute left-[22%]"
        style={{
          bottom: "12%",
          color: gold,
          fontSize: "clamp(22px, 5vh, 40px)",
          transform: "rotate(-20deg)",
        }}
      >
        🔔
      </div>
      <div
        className="absolute right-[22%]"
        style={{
          bottom: "12%",
          color: gold,
          fontSize: "clamp(22px, 5vh, 40px)",
          transform: "rotate(20deg)",
        }}
      >
        🔔
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
        <JokerArt />
      ) : (
        <>
          {/* Corner rank + suit — BIG */}
          <div
            className="absolute top-2 left-2.5 text-left leading-[0.9] font-display font-bold"
            style={{ color }}
          >
            <div style={{ fontSize: "clamp(72px, 18vh, 140px)" }}>{label}</div>
            <div
              style={{ fontSize: "clamp(32px, 8vh, 60px)", marginTop: 2 }}
            >
              {symbol}
            </div>
          </div>
          <div
            className="absolute bottom-2 right-2.5 text-right leading-[0.9] font-display font-bold rotate-180"
            style={{ color }}
          >
            <div style={{ fontSize: "clamp(72px, 18vh, 140px)" }}>{label}</div>
            <div
              style={{ fontSize: "clamp(32px, 8vh, 60px)", marginTop: 2 }}
            >
              {symbol}
            </div>
          </div>

          {/* Center art — A, 7, 9, 10 use a single huge middle symbol for
              maximum legibility from across the table. 3 and 4 keep their
              classic sparse pip layout since a few pips read cleanly. */}
          {["A", "3", "4", "7", "9", "10"].includes(card.rank) && (
            <AceCenter symbol={symbol} color={color} />
          )}
          {(card.rank === "J" || card.rank === "K") && (
            <FaceArt
              rank={card.rank as "J" | "K"}
              symbol={symbol}
              color={color}
              red={red}
            />
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
