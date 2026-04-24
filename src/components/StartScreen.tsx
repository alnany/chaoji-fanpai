"use client";
import { useGame } from "@/lib/store";

export function StartScreen() {
  const { startGame } = useGame();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Big ornamental background char */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{
          color: "var(--color-cinnabar)",
          opacity: 0.08,
          fontSize: "80vmin",
          lineHeight: 1,
        }}
      >
        <span className="font-brush">酒</span>
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-8">
        <div>
          <h1
            className="font-brush text-[var(--color-cinnabar)] drop-shadow-lg leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(56px, 18vw, 128px)" }}
          >
            超级翻牌
          </h1>
          <div className="mt-3 font-display italic text-[var(--color-red-gold)] text-lg">
            A Drinking Game
          </div>
        </div>

        <div className="kraft rounded-xl gold-edge p-4 text-[var(--color-ink)] text-left text-sm space-y-2">
          <div className="font-brush text-xl text-[var(--color-cinnabar)]">
            玩法
          </div>
          <div>·  34 张牌，围桌轮流翻</div>
          <div>·  开局摇一颗骰子 = 初始骰池</div>
          <div>·  翻到哪张，照牌面规则执行</div>
          <div>·  翻到第 4 张 A，摇骰子罚酒</div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-3xl gold-edge hover:scale-[1.02] transition"
        >
          开局
        </button>

        <div className="text-[10px] opacity-50">
          仅供成年人朋友助兴 · 请适量饮酒
        </div>
      </div>
    </div>
  );
}
