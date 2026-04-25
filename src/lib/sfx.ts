"use client";

/**
 * Sound effects for the game.
 *
 * Uses real recorded samples for the main effects:
 *   - `/sfx/dice-shake.mp3`  — dice rattle (loop + landing tail)
 *   - `/sfx/card-flip.mp3`   — card flip / fwip
 *   - `/sfx/tap-click.mp3`   — every button / tap / click / soft-tap
 *
 * The end-game gong is still synthesized so we don't ship a separate file for
 * a one-off cue.
 *
 * Usage: `import { sfx } from "@/lib/sfx"` then call `sfx.click()`, etc.
 * The first call lazily creates an AudioContext — call any sfx method from
 * a user gesture (click / touch) for browsers to allow playback.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let diceLoop: { stop: () => void } | null = null;
let muted = false;

/* ---------- Sample loader ---------- */

type SampleSlot = {
  url: string;
  buf: AudioBuffer | null;
  promise: Promise<AudioBuffer | null> | null;
};

const samples: Record<"dice" | "flip" | "tap", SampleSlot> = {
  dice: { url: "/sfx/dice-shake.mp3", buf: null, promise: null },
  flip: { url: "/sfx/card-flip.mp3", buf: null, promise: null },
  tap: { url: "/sfx/tap-click.mp3", buf: null, promise: null },
};

function loadSample(key: keyof typeof samples): Promise<AudioBuffer | null> {
  const c = ensureCtx();
  const slot = samples[key];
  if (!c) return Promise.resolve(null);
  if (slot.buf) return Promise.resolve(slot.buf);
  if (slot.promise) return slot.promise;
  slot.promise = fetch(slot.url)
    .then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.arrayBuffer();
    })
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      slot.buf = buf;
      return buf;
    })
    .catch(() => null);
  return slot.promise;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }
  const AC = (window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext) as typeof AudioContext | undefined;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = muted ? 0 : 0.75;
  masterGain.connect(ctx.destination);

  // Kick off sample loads early (non-blocking).
  void loadSample("dice");
  void loadSample("flip");
  void loadSample("tap");

  return ctx;
}

function out(): AudioNode | null {
  const c = ensureCtx();
  if (!c || !masterGain) return null;
  return masterGain;
}

/* ---------- Generic one-shot sample player ---------- */

function playSample(
  key: keyof typeof samples,
  opts: {
    offset?: number;
    duration?: number;
    loop?: boolean;
    volume?: number;
    fadeOut?: number;
    playbackRate?: number;
  } = {},
): { source: AudioBufferSourceNode; gain: GainNode } | null {
  const c = ensureCtx();
  const dst = out();
  const buf = samples[key].buf;
  if (!c || !dst) return null;
  if (!buf) {
    void loadSample(key);
    return null;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = !!opts.loop;
  src.playbackRate.value = opts.playbackRate ?? 1;
  if (src.loop) {
    const dur = buf.duration;
    src.loopStart = Math.min(0.15, dur * 0.1);
    src.loopEnd = Math.max(dur - 0.2, dur * 0.9);
  }
  const g = c.createGain();
  const now = c.currentTime;
  const vol = opts.volume ?? 0.9;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.008);
  src.connect(g).connect(dst);
  const offset = opts.offset ?? 0;
  if (opts.duration != null) {
    src.start(now, offset, opts.duration);
    if (opts.fadeOut) {
      const endAt = now + opts.duration;
      g.gain.setValueAtTime(vol, endAt - opts.fadeOut);
      g.gain.exponentialRampToValueAtTime(0.0001, endAt);
    }
  } else {
    src.start(now, offset);
  }
  return { source: src, gain: g };
}

/* ---------- Click / tap (real flashlight-button sample) ---------- */

function click() {
  playSample("tap", { volume: 0.9 });
}

function softTap() {
  playSample("tap", { volume: 0.55, playbackRate: 0.92 });
}

/* ---------- Card flip (real sample) ---------- */

function flip() {
  const rate = 0.97 + Math.random() * 0.08;
  playSample("flip", { volume: 0.95, playbackRate: rate });
}

/* ---------- Dice (real sample, loop + tail) ---------- */

function diceRollStart() {
  if (diceLoop) return;
  let stopped = false;
  let local: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

  const begin = () => {
    if (stopped) return;
    const offset = Math.random() * 0.15;
    const rate = 0.96 + Math.random() * 0.12;
    local = playSample("dice", { loop: true, offset, volume: 0.9, playbackRate: rate });
  };

  if (samples.dice.buf) {
    begin();
  } else {
    void loadSample("dice").then(() => {
      if (!stopped) begin();
    });
  }

  diceLoop = {
    stop: () => {
      stopped = true;
      diceLoop = null;
      if (local && ctx) {
        const now = ctx.currentTime;
        try {
          local.gain.gain.cancelScheduledValues(now);
          local.gain.gain.setValueAtTime(local.gain.gain.value, now);
          local.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          local.source.stop(now + 0.08);
        } catch {}
      }
    },
  };
}

function diceRollStop() {
  diceLoop?.stop();
  diceLoop = null;
}

function diceLand() {
  diceRollStop();
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;

  const buf = samples.dice.buf;
  if (buf) {
    const dur = buf.duration;
    const tailLen = Math.min(0.55, dur);
    const offset = Math.max(0, dur - tailLen);
    playSample("dice", { offset, duration: tailLen, volume: 1.0, fadeOut: 0.08 });
  }

  const now = c.currentTime + 0.02;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.25, now + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(g).connect(dst);
  osc.start(now);
  osc.stop(now + 0.32);
}

/* ---------- End-game gong (still synthesized) ---------- */

function gong() {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  const now = c.currentTime;

  const osc1 = c.createOscillator();
  const g1 = c.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(72, now);
  osc1.frequency.exponentialRampToValueAtTime(42, now + 1.6);
  g1.gain.setValueAtTime(0.0001, now);
  g1.gain.exponentialRampToValueAtTime(0.9, now + 0.02);
  g1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  osc1.connect(g1).connect(dst);
  osc1.start(now);
  osc1.stop(now + 2.0);

  const osc2 = c.createOscillator();
  const g2 = c.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(220, now);
  osc2.frequency.exponentialRampToValueAtTime(130, now + 1.2);
  g2.gain.setValueAtTime(0.0001, now);
  g2.gain.exponentialRampToValueAtTime(0.35, now + 0.03);
  g2.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
  osc2.connect(g2).connect(dst);
  osc2.start(now);
  osc2.stop(now + 1.5);

  const buf = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.04));
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const ng = c.createGain();
  ng.gain.value = 0.45;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 800;
  noise.connect(bp).connect(ng).connect(dst);
  noise.start(now);
}

function setMuted(next: boolean) {
  muted = next;
  if (masterGain) masterGain.gain.value = next ? 0 : 0.75;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("cf_muted", next ? "1" : "0");
    } catch {}
  }
}

function isMuted() {
  return muted;
}

if (typeof window !== "undefined") {
  try {
    muted = localStorage.getItem("cf_muted") === "1";
  } catch {}
}

export const sfx = {
  click,
  softTap,
  flip,
  diceRollStart,
  diceRollStop,
  diceLand,
  gong,
  setMuted,
  isMuted,
};
