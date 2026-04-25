"use client";

/**
 * Sound effects — uses real recorded samples for the three main interactions
 * (dice shaking in cup, playing card flip, tap/click), plus a synthesized
 * gong for the end-game ceremony.
 *
 * Samples live under /public/sfx/ and are decoded lazily into AudioBuffers
 * the first time any sfx method runs inside a user gesture.
 *
 * Usage: `import { sfx } from "@/lib/sfx"` then call `sfx.click()`, etc.
 */

type BufKey = "click" | "flip" | "dice";

const SAMPLE_URLS: Record<BufKey, string> = {
  click: "/sfx/tap-click.mp3",
  flip: "/sfx/card-flip.mp3",
  dice: "/sfx/dice-shake.mp3",
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
const buffers: Partial<Record<BufKey, AudioBuffer>> = {};
const decoding: Partial<Record<BufKey, Promise<AudioBuffer | null>>> = {};
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
  masterGain.gain.value = muted ? 0 : 0.9;
  masterGain.connect(ctx.destination);
  // Kick off preload of all samples in the background.
  (Object.keys(SAMPLE_URLS) as BufKey[]).forEach((k) => void loadBuf(k));
  return ctx;
}

function out(): AudioNode | null {
  ensureCtx();
  return masterGain;
}

async function loadBuf(key: BufKey): Promise<AudioBuffer | null> {
  if (buffers[key]) return buffers[key] ?? null;
  if (decoding[key]) return decoding[key] ?? null;
  const c = ensureCtx();
  if (!c) return null;
  const p = (async () => {
    try {
      const res = await fetch(SAMPLE_URLS[key]);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const buf = await c.decodeAudioData(arr);
      buffers[key] = buf;
      return buf;
    } catch {
      return null;
    }
  })();
  decoding[key] = p;
  return p;
}

/**
 * Fire-and-forget sample playback. If the buffer isn't decoded yet we kick
 * off decoding and play as soon as it's ready — the first tap may be silent
 * on a cold start, but every subsequent tap is instant.
 */
function playBuf(
  key: BufKey,
  opts: { volume?: number; rate?: number; offset?: number; duration?: number } = {}
): AudioBufferSourceNode | null {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return null;
  const buf = buffers[key];
  if (!buf) {
    void loadBuf(key).then((b) => {
      if (b && !muted) playBuf(key, opts);
    });
    return null;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = opts.rate ?? 1;
  const g = c.createGain();
  g.gain.value = opts.volume ?? 1;
  src.connect(g).connect(dst);
  const now = c.currentTime;
  if (opts.duration != null) {
    src.start(now, opts.offset ?? 0, opts.duration);
  } else {
    src.start(now, opts.offset ?? 0);
  }
  return src;
}

/* ---------- Public sounds ---------- */

function click() {
  // Tap/click sample at full volume.
  playBuf("click", { volume: 1 });
}

function softTap() {
  // Same sample a touch quieter + slightly higher pitch for secondary UI.
  playBuf("click", { volume: 0.65, rate: 1.15 });
}

function flip() {
  playBuf("flip", { volume: 1 });
}

/**
 * Dice shake — loops the sample through a gain node so we can fade out
 * cleanly when the player lets go / lands the dice.
 */
function diceRollStart() {
  if (diceLoop) return;
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;

  const start = (buf: AudioBuffer) => {
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    // Loop the "meat" of the shake (skip initial silence / tail ringing)
    src.loopStart = Math.min(0.1, buf.duration * 0.1);
    src.loopEnd = Math.max(0.2, buf.duration - 0.05);
    const g = c.createGain();
    g.gain.value = 0.9;
    src.connect(g).connect(dst);
    src.start();

    diceLoop = {
      stop: () => {
        const t = c.currentTime;
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        try {
          src.stop(t + 0.15);
        } catch {}
        diceLoop = null;
      },
    };
  };

  const pre = buffers.dice;
  if (pre) {
    start(pre);
  } else {
    void loadBuf("dice").then((buf) => {
      if (!buf) return;
      if (diceLoop) return; // another call may have already started
      if (muted) return;
      start(buf);
    });
    // Placeholder so rapid start/stop doesn't race.
    diceLoop = { stop: () => { diceLoop = null; } };
  }
}

function diceRollStop() {
  diceLoop?.stop();
  diceLoop = null;
}

function diceLand() {
  diceRollStop();
  // Play the tail end of the dice sample as the "landing" — it contains the
  // final clack/settle of the recording.
  const buf = buffers.dice;
  if (buf) {
    const tailFrom = Math.max(0, buf.duration - 0.45);
    playBuf("dice", { volume: 1, offset: tailFrom });
  } else {
    playBuf("dice", { volume: 1 });
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
