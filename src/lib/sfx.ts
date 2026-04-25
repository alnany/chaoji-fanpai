"use client";

/**
 * Sound effects for the game.
 *
 * - Dice rattle uses a real recorded sample (`/sfx/dice-shake.mp3`) for the
 *   shake-in-cup loop and a snippet of the same sample for the landing hit.
 * - Other sounds (click, softTap, card flip, end-game gong) are still
 *   synthesized procedurally via the Web Audio API to stay small and snappy.
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

// Real dice-shake sample (loaded lazily on first use)
const DICE_SAMPLE_URL = "/sfx/dice-shake.mp3";
let diceSampleBuf: AudioBuffer | null = null;
let diceSamplePromise: Promise<AudioBuffer | null> | null = null;
let diceSampleSrc: AudioBufferSourceNode | null = null;
let diceSampleGain: GainNode | null = null;

function loadDiceSample(): Promise<AudioBuffer | null> {
  const c = ensureCtx();
  if (!c) return Promise.resolve(null);
  if (diceSampleBuf) return Promise.resolve(diceSampleBuf);
  if (diceSamplePromise) return diceSamplePromise;
  diceSamplePromise = fetch(DICE_SAMPLE_URL)
    .then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.arrayBuffer();
    })
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => {
      diceSampleBuf = buf;
      return buf;
    })
    .catch(() => null);
  return diceSamplePromise;
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

  // Pre-bake a 1-second white-noise buffer we can reuse.
  const size = Math.floor(ctx.sampleRate * 1.0);
  noiseBuf = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;

  // Kick off the dice sample load early (non-blocking).
  void loadDiceSample();

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

/* ---------- Card flip ---------- */

function flip() {
  // Dry paper "fwip" + landing snap. Total ~130ms.
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst || !noiseBuf) return;
  const now = c.currentTime;

  // 1) Rustle
  const rustle = c.createBufferSource();
  rustle.buffer = noiseBuf;
  const peak = c.createBiquadFilter();
  peak.type = "peaking";
  peak.frequency.setValueAtTime(5200, now);
  peak.frequency.exponentialRampToValueAtTime(1800, now + 0.08);
  peak.Q.value = 0.9;
  peak.gain.value = 8;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 600;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(9000, now);
  lp.frequency.exponentialRampToValueAtTime(2400, now + 0.09);
  const rg = c.createGain();
  rg.gain.setValueAtTime(0.0001, now);
  rg.gain.exponentialRampToValueAtTime(0.5, now + 0.008);
  rg.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  rustle.connect(hp).connect(peak).connect(lp).connect(rg).connect(dst);
  rustle.start(now);
  rustle.stop(now + 0.12);

  // 2) Thwack at ~90ms
  const snapAt = now + 0.09;
  const clk = c.createBufferSource();
  clk.buffer = noiseBuf;
  const clkHp = c.createBiquadFilter();
  clkHp.type = "highpass";
  clkHp.frequency.value = 2000;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0.0001, snapAt);
  cg.gain.exponentialRampToValueAtTime(0.4, snapAt + 0.003);
  cg.gain.exponentialRampToValueAtTime(0.0001, snapAt + 0.04);
  clk.connect(clkHp).connect(cg).connect(dst);
  clk.start(snapAt);
  clk.stop(snapAt + 0.05);

  const body = c.createOscillator();
  const bg = c.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(220, snapAt);
  body.frequency.exponentialRampToValueAtTime(110, snapAt + 0.06);
  bg.gain.setValueAtTime(0.0001, snapAt);
  bg.gain.exponentialRampToValueAtTime(0.18, snapAt + 0.004);
  bg.gain.exponentialRampToValueAtTime(0.0001, snapAt + 0.08);
  body.connect(bg).connect(dst);
  body.start(snapAt);
  body.stop(snapAt + 0.1);
}

/* ---------- Dice (real sample) ---------- */

function playDiceSample(opts: {
  offset?: number;
  duration?: number;
  loop?: boolean;
  volume?: number;
  fadeOut?: number;
  playbackRate?: number;
} = {}): { source: AudioBufferSourceNode; gain: GainNode } | null {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst || !diceSampleBuf) return null;
  const src = c.createBufferSource();
  src.buffer = diceSampleBuf;
  src.loop = !!opts.loop;
  src.playbackRate.value = opts.playbackRate ?? 1;
  if (src.loop) {
    // Loop the noisy middle of the shake so we don't hear the start/stop
    // transients every time it wraps around.
    const dur = diceSampleBuf.duration;
    src.loopStart = Math.min(0.15, dur * 0.1);
    src.loopEnd = Math.max(dur - 0.2, dur * 0.9);
  }
  const g = c.createGain();
  const now = c.currentTime;
  const vol = opts.volume ?? 0.9;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.015);
  src.connect(g).connect(dst);
  const when = now;
  const offset = opts.offset ?? 0;
  if (opts.duration != null) {
    src.start(when, offset, opts.duration);
    if (opts.fadeOut) {
      const endAt = when + opts.duration;
      g.gain.setValueAtTime(vol, endAt - opts.fadeOut);
      g.gain.exponentialRampToValueAtTime(0.0001, endAt);
    }
  } else {
    src.start(when, offset);
  }
  return { source: src, gain: g };
}

function diceRollStart() {
  if (diceLoop) return;
  let stopped = false;
  let local: { source: AudioBufferSourceNode; gain: GainNode } | null = null;

  const begin = () => {
    if (stopped) return;
    // Slight randomized start offset + playbackRate so repeated rolls don't
    // sound identical.
    const offset = Math.random() * 0.15;
    const rate = 0.96 + Math.random() * 0.12; // 0.96–1.08
    local = playDiceSample({ loop: true, offset, volume: 0.9, playbackRate: rate });
    if (local) {
      diceSampleSrc = local.source;
      diceSampleGain = local.gain;
    }
  };

  if (diceSampleBuf) {
    begin();
  } else {
    void loadDiceSample().then(() => {
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
      diceSampleSrc = null;
      diceSampleGain = null;
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

  // Play the tail end of the sample (the final settle + thud). If the sample
  // isn't loaded yet, fall back to a short synthesized thud so the UX never
  // goes silent.
  if (diceSampleBuf) {
    const dur = diceSampleBuf.duration;
    // Use the last ~0.5s of the recording as the settle.
    const tailLen = Math.min(0.55, dur);
    const offset = Math.max(0, dur - tailLen);
    playDiceSample({ offset, duration: tailLen, volume: 1.0, fadeOut: 0.08 });
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

/* ---------- End-game gong ---------- */

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
