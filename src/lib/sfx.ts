"use client";

/**
 * Procedural sound effects via the Web Audio API.
 *
 * No external files. Every sound is synthesized from oscillators + noise
 * buffers, which keeps the bundle tiny and makes the SFX feel part of the
 * game rather than a canned library.
 *
 * Usage: `import { sfx } from "@/lib/sfx"` then call `sfx.click()`, etc.
 * The first call lazily creates an AudioContext — call any sfx method from
 * a user gesture (click / touch) for browsers to allow playback.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let diceLoop: { stop: () => void } | null = null;
let muted = false;

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

  // Pre-bake a 1-second white-noise buffer we can reuse for swooshes and rattles.
  const size = Math.floor(ctx.sampleRate * 1.0);
  noiseBuf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

  return ctx;
}

function out(): AudioNode | null {
  const c = ensureCtx();
  if (!c || !masterGain) return null;
  return masterGain;
}

/* ---------- Individual sounds ---------- */

function click() {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1600, now);
  osc.frequency.exponentialRampToValueAtTime(650, now + 0.05);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.25, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(g).connect(dst);
  osc.start(now);
  osc.stop(now + 0.08);
}

function softTap() {
  // Lower, rounder click for secondary UI (rule toggle, close)
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(620, now);
  osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  osc.connect(g).connect(dst);
  osc.start(now);
  osc.stop(now + 0.16);
}

function flip() {
  // Paper swoosh + card snap at the apex of the 3D flip.
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst || !noiseBuf) return;
  const now = c.currentTime;

  // 1) Filtered-noise whoosh that sweeps down in frequency
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = false;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(2400, now);
  bp.frequency.exponentialRampToValueAtTime(700, now + 0.28);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  src.connect(bp).connect(g).connect(dst);
  src.start(now);
  src.stop(now + 0.36);

  // 2) A brief click at ~halfway through the flip (mimics paper snap)
  const snapAt = now + 0.17;
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1400, snapAt);
  osc.frequency.exponentialRampToValueAtTime(520, snapAt + 0.05);
  og.gain.setValueAtTime(0.0001, snapAt);
  og.gain.exponentialRampToValueAtTime(0.22, snapAt + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, snapAt + 0.08);
  osc.connect(og).connect(dst);
  osc.start(snapAt);
  osc.stop(snapAt + 0.1);
}

function diceClack() {
  // One short wood/plastic clack — used for rattle loop and landing thud.
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst || !noiseBuf) return;
  const now = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900 + Math.random() * 1400;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.35 + Math.random() * 0.2, now + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07 + Math.random() * 0.04);
  src.connect(hp).connect(g).connect(dst);
  src.start(now);
  src.stop(now + 0.15);

  // Tonal thump underneath for body
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  const base = 180 + Math.random() * 160;
  osc.frequency.setValueAtTime(base, now);
  osc.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.08);
  og.gain.setValueAtTime(0.0001, now);
  og.gain.exponentialRampToValueAtTime(0.16, now + 0.005);
  og.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  osc.connect(og).connect(dst);
  osc.start(now);
  osc.stop(now + 0.12);
}

function diceRollStart() {
  // Start a rattle that plays clacks at irregular intervals until stopped.
  if (diceLoop) return;
  let stopped = false;
  const tick = () => {
    if (stopped) return;
    diceClack();
    // Random gap ~40–110ms to feel like tumbling
    const next = 40 + Math.random() * 70;
    setTimeout(tick, next);
  };
  tick();
  diceLoop = {
    stop: () => {
      stopped = true;
      diceLoop = null;
    },
  };
}

function diceRollStop() {
  diceLoop?.stop();
  diceLoop = null;
}

function diceLand() {
  diceRollStop();
  // Final impact = one loud clack + a short low thud
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;
  diceClack();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.35, now + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.connect(g).connect(dst);
  osc.start(now);
  osc.stop(now + 0.28);
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

// Restore mute preference on load (client only)
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
  setMuted,
  isMuted,
};
