"use client";
import { useEffect, useState } from "react";
import { sfx } from "@/lib/sfx";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * PWA install banner + service worker registration.
 * - Registers /sw.js on mount.
 * - Captures `beforeinstallprompt` on Android/Chrome and shows an install button.
 * - On iOS Safari (no prompt API), shows a "Add to Home Screen" hint.
 * - Hides automatically when already running standalone.
 * - User can dismiss; dismissal persisted in localStorage for 7 days.
 */
export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }

    // Already installed?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS specific
      window.navigator.standalone === true;
    if (standalone) {
      setDismissed(true);
      return;
    }

    // Dismissal cooldown
    try {
      const t = localStorage.getItem("cf_pwa_dismissed_at");
      if (t && Date.now() - Number(t) < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    } catch {}

    // Android / Chrome install prompt
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari detection (no prompt API there)
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !/(Edg|EdgiOS)/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isSafari) {
      setShowIOSHint(true);
    }

    const onInstalled = () => {
      setDeferredPrompt(null);
      setShowIOSHint(false);
      setDismissed(true);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed) return null;
  if (!deferredPrompt && !showIOSHint) return null;

  const handleInstall = async () => {
    sfx.click();
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setDismissed(true);
  };

  const handleDismiss = () => {
    sfx.softTap();
    try {
      localStorage.setItem("cf_pwa_dismissed_at", String(Date.now()));
    } catch {}
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto">
      <div className="kraft gold-edge rounded-xl p-3 flex items-center gap-3 text-[var(--color-ink)] shadow-lg">
        <div className="text-2xl">📲</div>
        <div className="flex-1 text-left">
          <div className="font-brush text-lg text-[var(--color-cinnabar)] leading-tight">
            装到手机桌面
          </div>
          <div className="text-[11px] opacity-80 leading-tight mt-0.5">
            {deferredPrompt
              ? "一键安装，像 App 一样打开。"
              : "点 Safari 底部「分享」→ 添加到主屏幕。"}
          </div>
        </div>
        {deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="px-3 py-2 rounded-lg bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-sm gold-edge"
          >
            安装
          </button>
        ) : null}
        <button
          onClick={handleDismiss}
          className="w-7 h-7 rounded-full opacity-60 hover:opacity-100 text-sm"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
