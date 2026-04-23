"use client";
import { useRef, useState, useEffect } from "react";
import { useGame } from "@/lib/store";

const MAX_SEC = 10;

export function KRecorder({ onClose }: { onClose: () => void }) {
  const { kRecording, setKRecording, kCount } = useGame();
  const [state, setState] = useState<"idle" | "recording" | "review">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [draft, setDraft] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: if previous K recording exists, auto-play
  useEffect(() => {
    if (kRecording && kCount > 1) {
      // auto-play handled inline in JSX via audio element autoplay
    }
  }, [kRecording, kCount]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          setDraft(reader.result as string);
          setState("review");
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start();
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((v) => {
          if (v + 1 >= MAX_SEC) {
            stop();
            return MAX_SEC;
          }
          return v + 1;
        });
      }, 1000);
    } catch (err) {
      alert("麦克风权限被拒，无法录音。" + (err as Error).message);
    }
  };

  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    recRef.current?.stop();
  };

  const confirm = () => {
    if (draft) setKRecording(draft);
    onClose();
  };

  const retake = () => {
    setDraft(null);
    setState("idle");
    setElapsed(0);
  };

  return (
    <div className="mt-4 space-y-3 rounded-xl p-4 bg-[var(--color-ink)]/60 border border-[var(--color-red-gold)]/40">
      {kRecording && kCount > 1 && (
        <div className="space-y-2 pb-3 border-b border-[var(--color-red-gold)]/30">
          <div className="text-xs opacity-70">🔊 上一张 K 留的录音：</div>
          <audio src={kRecording} controls autoPlay className="w-full" />
        </div>
      )}

      <div className="text-xs opacity-70">
        {kCount === 1 ? "你是第一张 K" : "现在录给下一张 K"} · 最多 10s
      </div>

      {state === "idle" && (
        <button
          onClick={start}
          className="w-full py-3 rounded-lg bg-[var(--color-cinnabar)] text-[var(--color-ivory)] font-brush text-lg gold-edge"
        >
          🎙 开始录音
        </button>
      )}

      {state === "recording" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-cinnabar)] animate-pulse" />
            <div className="font-display text-lg">{elapsed}s / {MAX_SEC}s</div>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-ivory)]/10 overflow-hidden">
            <div
              className="h-full bg-[var(--color-cinnabar)] transition-all"
              style={{ width: `${(elapsed / MAX_SEC) * 100}%` }}
            />
          </div>
          <button
            onClick={stop}
            className="w-full py-2.5 rounded-lg bg-[var(--color-ink)] border border-[var(--color-red-gold)] text-[var(--color-red-gold)]"
          >
            停止
          </button>
        </div>
      )}

      {state === "review" && draft && (
        <div className="space-y-2">
          <div className="text-xs opacity-70">回放确认：</div>
          <audio src={draft} controls className="w-full" />
          <div className="flex gap-2">
            <button
              onClick={retake}
              className="flex-1 py-2.5 rounded-lg border border-[var(--color-ivory)]/40"
            >
              重录
            </button>
            <button
              onClick={confirm}
              className="flex-1 py-2.5 rounded-lg bg-[var(--color-jade)] text-[var(--color-ivory)]"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {state === "idle" && kRecording && kCount === 1 && (
        <div className="text-xs opacity-60">（你是第一张 K，直接录一段留给下家）</div>
      )}
    </div>
  );
}
