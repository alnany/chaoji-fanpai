"use client";
import { useGame } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

export function StartScreen() {
  const { startGame } = useGame();
  const t = useT();
  const lang = useLang((s) => s.lang);

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

      {/* Language toggle — top right */}
      <div className="fixed top-[max(env(safe-area-inset-top),0.75rem)] right-3 z-50">
        <LangToggle />
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-8">
        <div>
          <h1
            className="font-brush text-[var(--color-cinnabar)] drop-shadow-lg leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(56px, 18vw, 128px)" }}
          >
            超级翻牌
          </h1>
          {lang === "en" && (
            <div className="mt-1 font-display italic text-[var(--color-ivory)]/70 text-xs tracking-[0.3em]">
              CHAOJI FANPAI
            </div>
          )}
          <div className="mt-3 font-display italic text-[var(--color-red-gold)] text-lg">
            {t("start.tagline")}
          </div>
        </div>

        <div className="kraft rounded-xl gold-edge p-4 text-[var(--color-ink)] text-left text-sm space-y-2">
          <div className="font-brush text-xl text-[var(--color-cinnabar)]">
            {t("start.howTo")}
          </div>
          <div>{t("start.rule1")}</div>
          <div>{t("start.rule2")}</div>
          <div>{t("start.rule3")}</div>
          <div>{t("start.rule4")}</div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-3xl gold-edge hover:scale-[1.02] transition"
        >
          {t("start.startBtn")}
        </button>

        <div className="text-[10px] opacity-50">{t("start.disclaimer")}</div>
      </div>
    </div>
  );
}
