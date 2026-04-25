"use client";

/**
 * Sound effects powered by real samples (Web Audio API for low-latency
 * playback + polyphony). Falls back to silence if decoding fails.
 *
 * Samples:
 *   /sounds/click.mp3  — UI button click
 *   /sounds/flip.mp3   — playing card flip
 *   /sounds/dice.mp3   — dice shaken in cup
 *
 * Gong (end-game) is still procedurally synthesized.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

type Sample = {
  url: string;
  buffer: AudioBuffer | null;
  loading: Promise<AudioBuffer | null> | null;
};

const samples: Record<"click" | "flip" | "dice", Sample> = {
  click: { url: "/sounds/click.mp3", buffer: null, loading: null },
  flip: { url: "/sounds/flip.mp3", buffer: null, loading: null },
  dice: { url: "/sounds/dice.mp3", buffer: null, loading: null },
};

let diceLoop: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

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
  masterGain.gain.value = muted ? 0 : 0.9;
  masterGain.connect(ctx.destination);
  // Kick off loading on first unlock (user gesture has happened by now).
  void Promise.all([load("click"), load("flip"), load("dice")]);
  return ctx;
}

async function load(name: keyof typeof samples): Promise<AudioBuffer | null> {
  const s = samples[name];
  if (s.buffer) return s.buffer;
  if (s.loading) return s.loading;
  const c = ctx;
  if (!c) return null;
  s.loading = (async () => {
    try {
      const res = await fetch(s.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ab = await res.arrayBuffer();
      s.buffer = await c.decodeAudioData(ab);
      return s.buffer;
    } catch (e) {
      console.warn(`[sfx] load ${name} failed`, e);
      return null;
    } finally {
      s.loading = null;
    }
  })();
  return s.loading;
}

function out(): AudioNode | null {
  const c = ensureCtx();
  if (!c || !masterGain) return null;
  return masterGain;
}

async function playOneShot(
  name: keyof typeof samples,
  opts: { volume?: number; rate?: number; offset?: number } = {}
) {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  const buf = samples[name].buffer ?? (await load(name));
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = opts.rate ?? 1;
  const g = c.createGain();
  g.gain.value = opts.volume ?? 1;
  src.connect(g).connect(dst);
  src.start(0, opts.offset ?? 0);
}

/* ---------- Public API ---------- */

function click() {
  void playOneShot("click", { volume: 0.9 });
}

function softTap() {
  // Same sample at lower volume + faster rate so it reads as "lighter"
  void playOneShot("click", { volume: 0.55, rate: 1.15 });
}

function flip() {
  void playOneShot("flip", { volume: 1.0 });
}

async function diceRollStart() {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  if (diceLoop) return;
  const buf = samples.dice.buffer ?? (await load("dice"));
  if (!buf || diceLoop) return; // could have been stopped before load finished
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  // Loop only the middle of the sample to avoid re-triggering the initial
  // transient on every loop (cup impact at the start).
  if (buf.duration > 0.5) {
    src.loopStart = 0.08;
    src.loopEnd = Math.max(0.5, buf.duration - 0.08);
  }
  const g = c.createGain();
  g.gain.value = 0.95;
  src.connect(g).connect(dst);
  src.start(0);
  diceLoop = { source: src, gain: g };
}

function diceRollStop() {
  if (!diceLoop || !ctx) return;
  const now = ctx.currentTime;
  // Quick fade to avoid click
  diceLoop.gain.gain.cancelScheduledValues(now);
  diceLoop.gain.gain.setValueAtTime(diceLoop.gain.gain.value, now);
  diceLoop.gain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
  try {
    diceLoop.source.stop(now + 0.05);
  } catch {}
  diceLoop = null;
}

function diceLand() {
  diceRollStop();
  // Play the tail of the sample — the natural ending where the dice settle.
  const buf = samples.dice.buffer;
  if (buf) {
    const tailStart = Math.max(0, buf.duration - 0.5);
    void playOneShot("dice", { volume: 1.0, offset: tailStart });
  } else {
    void playOneShot("dice", { volume: 1.0 });
  }
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

/* ---------- Mute controls ---------- */

function setMuted(next: boolean) {
  muted = next;
  if (masterGain) masterGain.gain.value = next ? 0 : 0.9;
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
