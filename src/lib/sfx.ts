"use client";

/**
 * Sound effects for the game.
 *
 * - Dice rattle uses a real recorded sample (`/sfx/dice-shake.mp3`) for the
 *   shake-in-cup loop and a snippet of the same sample for the landing hit.
 * - Card flip uses a real recorded sample (`/sfx/card-flip.mp3`).
 * - All tap/click sounds use a real recorded sample (`/sfx/tap-click.mp3`,
 *   flashlight button click).
 * - The end-game gong is still synthesized procedurally via the Web Audio API.
 *
 * Usage: `import { sfx } from "@/lib/sfx"` then call `sfx.click()`, etc.
 * The first call lazily creates an AudioContext — call any sfx method from
 * a user gesture (click / touch) for browsers to allow playback.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let diceLoop: { stop: () => void } | null = null;
let muted = false;

/* ---------- Sample loading (generic) ---------- */

type SampleEntry = {
  url: string;
  buf: AudioBuffer | null;
  promise: Promise<AudioBuffer | null> | null;
};

const samples: Record<string, SampleEntry> = {
  dice: { url: "/sfx/dice-shake.mp3", buf: null, promise: null },
  flip: { url: "/sfx/card-flip.mp3", buf: null, promise: null },
  tap: { url: "/sfx/tap-click.mp3", buf: null, promise: null },
};

function loadSample(name: keyof typeof samples): Promise<AudioBuffer | null> {
  const c = ensureCtx();
  if (!c) return Promise.resolve(null);
  const entry = samples[name];
  if (entry.buf) return Promise.resolve(entry.buf);
  if (entry.promise) return entry.promise;
  entry.promise = fetch(entry.url)
    .then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.arrayBuffer();
    })
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      entry.buf = buf;
      return buf;
    })
    .catch(() => null);
  return entry.promise;
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

function playOneShot(
  name: keyof typeof samples,
  opts: {
    volume?: number;
    playbackRate?: number;
    offset?: number;
    duration?: number;
    fadeOut?: number;
    loop?: boolean;
  } = {}
): { source: AudioBufferSourceNode; gain: GainNode } | null {
  const c = ensureCtx();
  const dst = out();
  const buf = samples[name].buf;
  if (!c || !dst) return null;
  if (!buf) {
    // Load lazily; caller gets nothing this call but future calls will work.
    void loadSample(name);
    return null;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = !!opts.loop;
  src.playbackRate.value = opts.playbackRate ?? 1;
  if (opts.loop) {
    const dur = buf.duration;
    src.loopStart = Math.min(0.15, dur * 0.1);
    src.loopEnd = Math.max(dur - 0.2, dur * 0.9);
  }
  const g = c.createGain();
  const now = c.currentTime;
  const vol = opts.volume ?? 0.9;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.01);
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

/* ---------- Tap / click (flashlight button sample) ---------- */

function click() {
  // Main button tap — flashlight click sample, full volume, slight pitch-up for snap.
  playOneShot("tap", { volume: 0.9, playbackRate: 1.0 });
}

function softTap() {
  // Secondary/softer taps — same sample, quieter and a touch slower for mellower timbre.
  playOneShot("tap", { volume: 0.55, playbackRate: 0.92 });
}

/* ---------- Card flip (real sample) ---------- */

function flip() {
  // Slight random pitch so repeated flips don't sound identical.
  const rate = 0.97 + Math.random() * 0.08; // 0.97–1.05
  playOneShot("flip", { volume: 0.95, playbackRate: rate });
}

/* ---------- Dice (real sample) ---------- */

function diceRollStart() {
  if (diceLoop) return;
  let stopped = false;
  let local: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

  const begin = () => {
    if (stopped) return;
    const offset = Math.random() * 0.15;
    const rate = 0.96 + Math.random() * 0.12; // 0.96–1.08
    local = playOneShot("dice", { loop: true, offset, volume: 0.9, playbackRate: rate });
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
      if (local) {
        const c = ctx!;
        const now = c.currentTime;
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
    // Use the last ~0.5s of the recording as the settle.
    const dur = buf.duration;
    const tailLen = Math.min(0.55, dur);
    const offset = Math.max(0, dur - tailLen);
    playOneShot("dice", { offset, duration: tailLen, volume: 1.0, fadeOut: 0.08 });
  }

  // Always layer a low thud so it feels like the die has real mass.
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
