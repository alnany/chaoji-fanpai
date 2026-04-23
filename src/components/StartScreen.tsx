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
          <div className="font-display italic text-sm opacity-60 tracking-widest">
            CHAOJI · FANPAI
          </div>
          <h1 className="font-brush text-7xl text-[var(--color-cinnabar)] drop-shadow-lg leading-none mt-2">
            超级翻牌
          </h1>
          <div className="mt-3 font-display italic text-[var(--color-red-gold)] text-lg">
            A Retro Hong Kong Drinking Game
          </div>
        </div>

        <div className="kraft rounded-xl gold-edge p-4 text-[var(--color-ink)] text-left text-sm space-y-2">
          <div className="font-brush text-xl text-[var(--color-cinnabar)]">
            玩法
          </div>
          <div>·  4–8 人围桌，一副精简牌共 34 张</div>
          <div>·  开局摇一颗骰子定初始骰池</div>
          <div>·  轮流翻牌，照牌面规则执行</div>
          <div>·  第 4 张 A 抽出，游戏结束摇总骰</div>
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
