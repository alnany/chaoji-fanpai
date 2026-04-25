"use client";

/**
 * Real-sample SFX engine.
 *
 * Loads three MP3 samples (provided by the user) into AudioBuffers on first
 * user gesture and plays them via AudioBufferSourceNode for overlap-safe,
 * low-latency playback. The end-game gong remains procedurally synthesized.
 *
 * Files (all in /public/sfx/):
 *   - dice.mp3 — dice shaken in a cup     -> diceRollStart (loop) / diceLand
 *   - flip.mp3 — playing card flipped     -> flip
 *   - tap.mp3  — button click             -> click / softTap
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

type SampleKey = "dice" | "flip" | "tap";
const SAMPLE_URLS: Record<SampleKey, string> = {
  dice: "/sounds/dice.mp3",
  flip: "/sounds/flip.mp3",
  tap: "/sounds/click.mp3",
};
const buffers: Partial<Record<SampleKey, AudioBuffer>> = {};
const loading: Partial<Record<SampleKey, Promise<void>>> = {};

let activeDice: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

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
  masterGain.gain.value = muted ? 0 : 0.85;
  masterGain.connect(ctx.destination);
  // Pre-warm all samples in the background.
  (Object.keys(SAMPLE_URLS) as SampleKey[]).forEach((k) => void load(k));
  return ctx;
}

async function load(key: SampleKey): Promise<void> {
  if (buffers[key]) return;
  if (loading[key]) return loading[key];
  const c = ensureCtx();
  if (!c) return;
  const p = (async () => {
    try {
      const res = await fetch(SAMPLE_URLS[key]);
      const ab = await res.arrayBuffer();
      const buf = await new Promise<AudioBuffer>((resolve, reject) =>
        c.decodeAudioData(ab.slice(0), resolve, reject)
      );
      buffers[key] = buf;
    } catch {
      // Silent failure — sfx are non-essential.
    }
  })();
  loading[key] = p;
  return p;
}

function play(
  key: SampleKey,
  opts: { volume?: number; rate?: number; loop?: boolean } = {}
): { src: AudioBufferSourceNode; gain: GainNode } | null {
  const c = ensureCtx();
  if (!c || !masterGain) return null;
  const buf = buffers[key];
  if (!buf) {
    // Kick off load and silently drop this play — next call will work.
    void load(key);
    return null;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = !!opts.loop;
  src.playbackRate.value = opts.rate ?? 1;
  const g = c.createGain();
  g.gain.value = opts.volume ?? 1;
  src.connect(g).connect(masterGain);
  src.start();
  return { src, gain: g };
}

/* ---------- Public effects ---------- */

function click() {
  // Slight pitch+volume variation so consecutive clicks don't sound identical.
  play("tap", {
    volume: 0.9,
    rate: 0.95 + Math.random() * 0.1,
  });
}

function softTap() {
  // Quieter, slightly lower-pitched version of the same tap sample.
  play("tap", {
    volume: 0.5,
    rate: 0.78 + Math.random() * 0.08,
  });
}

function flip() {
  play("flip", {
    volume: 0.9,
    rate: 0.95 + Math.random() * 0.1,
  });
}

function diceRollStart() {
  if (activeDice) return;
  const c = ensureCtx();
  if (!c) return;
  const handle = play("dice", {
    volume: 0.9,
    rate: 0.95 + Math.random() * 0.1,
    loop: true,
  });
  if (handle) activeDice = handle;
}

function diceRollStop() {
  const c = ensureCtx();
  const cur = activeDice;
  activeDice = null;
  if (!c || !cur) return;
  const now = c.currentTime;
  // 60ms fadeout to avoid clicks when looped sample is cut.
  cur.gain.gain.cancelScheduledValues(now);
  cur.gain.gain.setValueAtTime(cur.gain.gain.value, now);
  cur.gain.gain.linearRampToValueAtTime(0.0001, now + 0.06);
  try {
    cur.src.stop(now + 0.07);
  } catch {}
}

function diceLand() {
  // End the loop and play a single non-looped "settle" pass — gives the
  // natural decay of the cup shake.
  diceRollStop();
  play("dice", { volume: 0.85, rate: 1 });
}

/* ---------- End-game gong (still synthesized — no sample provided) ---------- */

function gong() {
  const c = ensureCtx();
  if (!c || !masterGain) return;
  const dst: AudioNode = masterGain;
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

/* ---------- Mute ---------- */

function setMuted(next: boolean) {
  muted = next;
  if (masterGain) masterGain.gain.value = next ? 0 : 0.85;
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
