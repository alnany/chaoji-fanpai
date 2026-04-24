"use client";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   Realistic SVG die face — ivory body with subtle 3D bevel, dark pips,
   and drop shadow. Rendered as one square; rolling animation comes from
   tumbling the whole element while cycling the pip value rapidly.
------------------------------------------------------------------ */
function DieSVG({ value }: { value: number }) {
  // Pip grid positions (percent of 100 viewBox)
  const P = {
    TL: [28, 28],
    TR: [72, 28],
    ML: [28, 50],
    MR: [72, 50],
    BL: [28, 72],
    BR: [72, 72],
    C: [50, 50],
  } as const;
  const layouts: Record<number, (keyof typeof P)[]> = {
    1: ["C"],
    2: ["TL", "BR"],
    3: ["TL", "C", "BR"],
    4: ["TL", "TR", "BL", "BR"],
    5: ["TL", "TR", "C", "BL", "BR"],
    6: ["TL", "TR", "ML", "MR", "BL", "BR"],
  };
  const pips = layouts[value] || layouts[1];

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="die-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.55" stopColor="#f1e7cf" />
          <stop offset="1" stopColor="#c8bc9e" />
        </linearGradient>
        <radialGradient id="die-hi" cx="0.3" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pip-g" cx="0.38" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#4a3e34" />
          <stop offset="0.55" stopColor="#1a1614" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <filter id="die-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodOpacity="0.38" />
        </filter>
      </defs>

      {/* body */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="18"
        ry="18"
        fill="url(#die-body)"
        stroke="#a89878"
        strokeWidth="1"
        filter="url(#die-shadow)"
      />
      {/* top-left highlight sheen */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="18"
        ry="18"
        fill="url(#die-hi)"
      />
      {/* inner bevel ring */}
      <rect
        x="9"
        y="9"
        width="82"
        height="82"
        rx="14"
        ry="14"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {/* bottom shadow ring to fake depth */}
      <rect
        x="9"
        y="9"
        width="82"
        height="82"
        rx="14"
        ry="14"
        fill="none"
        stroke="#000"
        strokeOpacity="0.12"
        strokeWidth="1"
        transform="translate(0 1)"
      />

      {/* pips */}
      {pips.map((key, i) => {
        const [cx, cy] = P[key];
        return (
          <g key={i}>
            {/* pip well (dark) */}
            <circle cx={cx} cy={cy} r="8.6" fill="url(#pip-g)" />
            {/* tiny inner highlight for glossy pip */}
            <circle
              cx={cx - 2.2}
              cy={cy - 2.4}
              r="1.8"
              fill="#ffffff"
              opacity="0.35"
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------
   Die — public component.
   - Renders a realistic die at the given size.
   - When `rolling` is true, the die tumbles (3D rotation) and the face
     value cycles rapidly; when rolling stops, it settles on `value`.
------------------------------------------------------------------ */
export function Die({
  value,
  rolling = false,
  size = 88,
}: {
  value: number;
  rolling?: boolean;
  size?: number;
}) {
  // While rolling, flash through random faces so the cycling is visible.
  const [displayed, setDisplayed] = useState(value);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (rolling) {
      timerRef.current = setInterval(() => {
        setDisplayed(1 + Math.floor(Math.random() * 6));
      }, 70);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayed(value);
    }
  }, [rolling, value]);

  return (
    <div
      className={rolling ? "die-tumble" : "die-settle"}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <DieSVG value={displayed} />
    </div>
  );
}
