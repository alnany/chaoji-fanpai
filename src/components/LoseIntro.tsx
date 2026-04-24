"use client";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

/**
 * 终局降临 —— 全屏「你输了」仪式感揭晓。
 * 挂载时播一声低沉的锣，把 "你输了" 大字砸出来，
 * 然后 2.3s 后优雅淡出，让后面的摇骰界面接上。
 */
export function LoseIntro({
  dicePool,
  onDone,
}: {
  dicePool: number;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"slam" | "hold" | "fade">("slam");

  useEffect(() => {
    sfx.gong();
    const t1 = setTimeout(() => setPhase("hold"), 650);
    const t2 = setTimeout(() => setPhase("fade"), 2100);
    const t3 = setTimeout(onDone, 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(30,15,15,0.98) 0%, rgba(10,5,5,1) 100%)",
        transition: "opacity 480ms ease",
        opacity: phase === "fade" ? 0 : 1,
      }}
    >
      {/* 溅血四角纹 */}
      <div className="absolute inset-0 pointer-events-none lose-vignette" />

      <div className="relative z-10 space-y-6">
        <div
          className="font-brush text-[var(--color-cinnabar)] leading-none whitespace-nowrap lose-slam"
          style={{
            fontSize: "clamp(120px, 32vw, 260px)",
            textShadow:
              "0 0 30px rgba(198,42,42,0.65), 0 4px 0 rgba(0,0,0,0.5)",
          }}
        >
          你输了
        </div>
        <div
          className="kraft gold-edge rounded-xl px-5 py-3 mx-auto max-w-xs lose-instruction"
          style={{ opacity: phase === "slam" ? 0 : 1, transition: "opacity 500ms ease 500ms" }}
        >
          <div className="font-brush text-2xl text-[var(--color-cinnabar)] leading-tight">
            摇 {dicePool} 颗骰子
          </div>
          <div className="mt-1 text-xs text-[var(--color-ink)]/75">
            点数之和 = 你要喝的杯数
          </div>
        </div>
      </div>
    </div>
  );
}
