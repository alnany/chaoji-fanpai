"use client";
import { useLang } from "@/lib/i18n";
import { sfx } from "@/lib/sfx";

/**
 * Language toggle pill. Shows the OTHER language as the action label
 * (what clicking will switch to), so it reads as a verb on any screen.
 */
export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLang();
  const next = lang === "zh" ? "EN" : "中";
  const aria = lang === "zh" ? "Switch to English" : "切换到中文";
  return (
    <button
      onClick={() => {
        sfx.softTap();
        toggle();
      }}
      aria-label={aria}
      title={aria}
      className={
        "px-2.5 py-1.5 rounded-full bg-[var(--color-ink)]/80 backdrop-blur " +
        "border border-[var(--color-red-gold)]/60 text-[var(--color-ivory)] " +
        "text-xs font-display shadow-lg min-w-[34px] " +
        className
      }
    >
      {next}
    </button>
  );
}
