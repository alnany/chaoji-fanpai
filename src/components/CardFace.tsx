"use client";
import { type Card, RANK_LABEL, SUIT_SYMBOL, isRed } from "@/lib/deck";
import { RULES } from "@/lib/rules";
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
        <div
          className="font-brush leading-[0.95] text-center"
          style={{
            color: "var(--color-cinnabar)",
            fontSize: "clamp(72px, 20vh, 160px)",
            textShadow: "0 2px 0 rgba(0,0,0,0.08)",
          }}
        >
          <div>翻</div>
          <div>牌</div>
        </div>
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

/** Ornate Joker card — real SVG jester illustration (not an emoji).
 *  Classic tri-point cap with gold bells, half-painted harlequin face with
 *  diamond eye mask, and a fanned ruff collar. Corner labels spell the full
 *  word "Joker" so it is never confused with the J (knight) card. */
function JokerArt() {
  const gold = "var(--color-red-gold)";
  const red = "var(--color-cinnabar)";
  const ink = "var(--color-ink)";
  const ivory = "#f4e9d4";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* dramatic diagonal split backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${red}33 0%, ${red}1a 42%, ${ink}1a 58%, ${ink}33 100%)`,
        }}
      />
      {/* warm radial glow behind the jester */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 46%, ${gold}33 0%, transparent 62%)`,
        }}
      />

      {/* double filigree frame */}
      <div
        className="absolute inset-[5%] rounded-lg pointer-events-none"
        style={{
          border: `1.5px solid ${gold}`,
          boxShadow: `inset 0 0 0 4px ${gold}44`,
        }}
      />
      <div
        className="absolute inset-[7.5%] rounded-md pointer-events-none"
        style={{ border: `0.75px solid ${gold}aa` }}
      />

      {/* corner "Joker" nameplate labels — spell the full word so the card
          can never be confused with the J knight card */}
      {/* corner flourishes */}
      {[
        "top-[5%] right-[8%]",
        "bottom-[5%] left-[8%] rotate-180",
      ].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} font-display leading-none`}
          style={{ color: gold, fontSize: "clamp(18px, 3.6vh, 30px)" }}
        >
          ❧
        </div>
      ))}

      {/* ================ MAIN JESTER ILLUSTRATION ================ */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
        style={{
          top: "11%",
          width: "82%",
          height: "74%",
          filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.32))",
        }}
      >
        <svg
          viewBox="-12 -22 224 312"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="hatSplit" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0.5" stopColor={red} />
              <stop offset="0.5" stopColor={ink} />
            </linearGradient>
            <linearGradient id="faceSplit" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0.5" stopColor={ivory} />
              <stop offset="0.5" stopColor="#e6d7b8" />
            </linearGradient>
            <radialGradient id="bellShine" cx="0.35" cy="0.35" r="0.6">
              <stop offset="0" stopColor="#fff3c9" />
              <stop offset="0.55" stopColor={gold} />
              <stop offset="1" stopColor="#8b6a20" />
            </radialGradient>
            <pattern
              id="harlequin"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="16" height="16" fill={red} />
              <rect width="8" height="8" fill={ink} />
              <rect x="8" y="8" width="8" height="8" fill={ink} />
            </pattern>
          </defs>

          {/* ---------------- HAT (three-horn jester cap) ---------------- */}
          <path
            d="M18 86 L44 14 L72 86 L100 6 L128 86 L156 14 L182 86 Z"
            fill="url(#hatSplit)"
            stroke={gold}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* subtle harlequin sheen across the hat */}
          <path
            d="M18 86 L44 14 L72 86 L100 6 L128 86 L156 14 L182 86 Z"
            fill="url(#harlequin)"
            opacity="0.18"
          />
          {/* hat band */}
          <rect x="16" y="84" width="168" height="12" fill={gold} />
          <rect
            x="16"
            y="84"
            width="168"
            height="12"
            fill={ink}
            opacity="0.25"
          />
          {/* hat band studs */}
          {[30, 60, 100, 140, 170].map((x) => (
            <circle key={x} cx={x} cy={90} r={1.8} fill="#fff3c9" />
          ))}

          {/* ---------------- BELLS at each horn tip ---------------- */}
          {[
            { x: 44, y: 14 },
            { x: 100, y: 6 },
            { x: 156, y: 14 },
          ].map(({ x, y }, i) => (
            <g key={i}>
              {/* bell body */}
              <circle cx={x} cy={y} r={9.5} fill="url(#bellShine)" stroke={ink} strokeWidth="0.8" />
              {/* bell clapper slot */}
              <rect x={x - 1} y={y + 7} width={2} height={5} fill={ink} />
              {/* highlight */}
              <circle cx={x - 2.5} cy={y - 2.5} r={2.2} fill="#fff7dd" opacity="0.9" />
            </g>
          ))}

          {/* ---------------- FACE ---------------- */}
          {/* outer rim */}
          <ellipse
            cx="100"
            cy="148"
            rx="44"
            ry="50"
            fill="url(#faceSplit)"
            stroke={ink}
            strokeWidth="1.5"
          />
          {/* left side blush (red-painted half of the face) */}
          <path
            d="M100 98 Q56 106 56 148 Q56 192 100 198 Z"
            fill={red}
            opacity="0.18"
          />
          {/* right side shadow */}
          <path
            d="M100 98 Q144 106 144 148 Q144 192 100 198 Z"
            fill={ink}
            opacity="0.12"
          />

          {/* ---------------- EYE MASK (diamond harlequin band) ---------------- */}
          <path
            d="M100 114 L62 132 L100 150 L138 132 Z"
            fill={ink}
            stroke={gold}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* eye holes */}
          <ellipse cx="82" cy="132" rx="5.5" ry="4.2" fill={ivory} />
          <ellipse cx="118" cy="132" rx="5.5" ry="4.2" fill={ivory} />
          {/* pupils */}
          <circle cx="83" cy="132" r="2.4" fill={ink} />
          <circle cx="119" cy="132" r="2.4" fill={ink} />
          {/* eye shine */}
          <circle cx="84.2" cy="130.8" r="0.8" fill="#ffffff" />
          <circle cx="120.2" cy="130.8" r="0.8" fill="#ffffff" />

          {/* gold tear drop under left eye — classic sad-jester motif */}
          <path
            d="M80 148 Q78 154 80 158 Q82 154 80 148 Z"
            fill={gold}
            stroke="#8b6a20"
            strokeWidth="0.4"
          />

          {/* ---------------- NOSE & MOUTH ---------------- */}
          <circle cx="100" cy="164" r="5.5" fill={red} stroke={ink} strokeWidth="0.6" />
          <circle cx="98.5" cy="162.5" r="1.6" fill="#ffb8b0" opacity="0.8" />

          {/* sly smirk */}
          <path
            d="M83 180 Q100 190 117 180"
            stroke={ink}
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          {/* tongue peek */}
          <path
            d="M98 184 Q100 188 102 184"
            stroke={red}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* ---------------- RUFF COLLAR ---------------- */}
          {/* central neck band */}
          <rect x="92" y="196" width="16" height="6" fill={gold} />
          {/* fanned harlequin lappets */}
          {[-64, -32, 0, 32, 64].map((dx, i) => {
            const cx = 100 + dx;
            const tip = 252;
            const fill = i % 2 === 0 ? red : ink;
            return (
              <g key={i}>
                <path
                  d={`M${cx} 202 L${cx - 18} 226 L${cx} ${tip} L${cx + 18} 226 Z`}
                  fill={fill}
                  stroke={gold}
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                {/* gold bell at each lappet tip */}
                <circle cx={cx} cy={tip + 5} r={4} fill="url(#bellShine)" stroke={ink} strokeWidth="0.6" />
                <circle cx={cx - 1} cy={tip + 4} r={1} fill="#fff7dd" opacity="0.9" />
              </g>
            );
          })}

          {/* ---------------- SPARKLES around the head ---------------- */}
          {[
            { x: 28, y: 120, s: 6 },
            { x: 172, y: 120, s: 6 },
            { x: 22, y: 170, s: 4 },
            { x: 178, y: 170, s: 4 },
          ].map(({ x, y, s }, i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path
                d={`M0 -${s} L${s * 0.25} -${s * 0.25} L${s} 0 L${s * 0.25} ${s * 0.25} L0 ${s} L-${s * 0.25} ${s * 0.25} L-${s} 0 L-${s * 0.25} -${s * 0.25} Z`}
                fill={gold}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* JOKER nameplate banner near the bottom */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3"
        style={{
          bottom: "6.5%",
          color: gold,
        }}
      >
        <span
          className="font-display"
          style={{ fontSize: "clamp(14px, 3.2vh, 24px)", opacity: 0.85 }}
        >
          ❦
        </span>
        <span
          className="font-display italic font-bold leading-none"
          style={{
            fontSize: "clamp(18px, 4.6vh, 34px)",
            letterSpacing: "0.22em",
            paddingLeft: "0.22em", /* compensate trailing letter-spacing for optical centering */
            textShadow: `0 1px 0 rgba(0,0,0,0.18), 0 0 8px ${gold}66`,
          }}
        >
          JOKER
        </span>
        <span
          className="font-display"
          style={{ fontSize: "clamp(14px, 3.2vh, 24px)", opacity: 0.85 }}
        >
          ❦
        </span>
      </div>
      {/* thin gold underline beneath the nameplate */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "4.5%",
          width: "46%",
          height: 1,
          background: `linear-gradient(to right, transparent, ${gold}, transparent)`,
        }}
      />
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

      {/* Rule-name banner across the top of the card */}
      <div
        className="absolute left-1/2 -translate-x-1/2 font-brush leading-none pointer-events-none z-10 whitespace-nowrap"
        style={{
          top: "2.5%",
          color: "var(--color-red-gold)",
          fontSize: "clamp(20px, 4.6vh, 36px)",
          letterSpacing: "0.06em",
          textShadow: "0 1px 0 rgba(0,0,0,0.18)",
        }}
      >
        {RULES[card.rank].title}
      </div>

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
