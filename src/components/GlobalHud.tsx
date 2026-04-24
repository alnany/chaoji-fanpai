"use client";
import { useGame } from "@/lib/store";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

export function GlobalHud() {
  const { dicePool, aceCount, initialRollDone } = useGame();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(sfx.isMuted());
  }, []);

  if (!initialRollDone) return null;

  const toggleMute = () => {
    const next = !muted;
    sfx.setMuted(next);
    setMuted(next);
    if (!next) sfx.softTap();
  };

  return (
    <div className="fixed top-[max(env(safe-area-inset-top),0.5rem)] right-3 z-50 flex gap-2">
      <button
        onClick={toggleMute}
        className="px-2.5 py-1.5 rounded-full bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-ivory)]/30 text-[var(--color-ivory)] text-xs shadow-lg"
        aria-label={muted ? "打开音效" : "关闭音效"}
        title={muted ? "打开音效" : "关闭音效"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
      <div className="px-3 py-1.5 rounded-full bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-red-gold)]/70 text-[var(--color-ivory)] text-xs flex items-center gap-1.5 shadow-lg">
        <span className="opacity-70">🎲 骰池</span>
        <span className="font-display text-sm">{dicePool}</span>
      </div>
      <div className="px-3 py-1.5 rounded-full bg-[var(--color-ink)]/80 backdrop-blur border border-[var(--color-cinnabar)]/70 text-[var(--color-ivory)] text-xs flex items-center gap-1.5 shadow-lg">
        <span className="opacity-70">A</span>
        <span className="font-display text-sm">{aceCount}/4</span>
      </div>
    </div>
  );
}
