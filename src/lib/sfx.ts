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

  // Pre-bake a 1-second white-noise buffer we can reuse.
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
  //   1) Short broadband rustle, peaking in the 2–6 kHz range with some body.
  //   2) Immediate thwack at the end = high-pass noise click + tiny low-body.
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

/* ---------- Dice ---------- */

/**
 * One "wood-on-wood" clack — the core unit of any dice sound.
 * Mix of:
 *   - very short broadband noise transient (the impact)
 *   - resonant band around 700–1600 Hz (plastic/wood body)
 *   - a short low thump (mass hitting the surface/cup)
 * Each call varies pitch/level slightly so repeated clacks don't machine-gun.
 */
function diceClack(opts: { volume?: number; lowCup?: boolean } = {}) {
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst || !noiseBuf) return;
  const now = c.currentTime;
  const v = opts.volume ?? 1;

  // Offset start within the noise buffer for variety
  const offset = Math.random() * 0.8;

  // 1) Transient: bright noise burst (contact)
  const trans = c.createBufferSource();
  trans.buffer = noiseBuf;
  const transHp = c.createBiquadFilter();
  transHp.type = "highpass";
  transHp.frequency.value = 1800 + Math.random() * 1600;
  const transGain = c.createGain();
  const peakT = 0.28 + Math.random() * 0.18;
  transGain.gain.setValueAtTime(0.0001, now);
  transGain.gain.exponentialRampToValueAtTime(peakT * v, now + 0.002);
  transGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
  trans.connect(transHp).connect(transGain).connect(dst);
  trans.start(now, offset);
  trans.stop(now + 0.06);

  // 2) Body: resonant mid-band (the "wood" pitch of the cube)
  const body = c.createBufferSource();
  body.buffer = noiseBuf;
  const bodyBp = c.createBiquadFilter();
  bodyBp.type = "bandpass";
  const bodyFreq = 700 + Math.random() * 900;
  bodyBp.frequency.value = bodyFreq;
  bodyBp.Q.value = 6;
  const bodyGain = c.createGain();
  bodyGain.gain.setValueAtTime(0.0001, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.22 * v, now + 0.004);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  body.connect(bodyBp).connect(bodyGain).connect(dst);
  body.start(now, offset + 0.1);
  body.stop(now + 0.1);

  // 3) Low thump: tonal sub-pulse so the dice feel like they have mass
  const thump = c.createOscillator();
  const tg = c.createGain();
  thump.type = "sine";
  const tBase = 140 + Math.random() * 80;
  thump.frequency.setValueAtTime(tBase, now);
  thump.frequency.exponentialRampToValueAtTime(tBase * 0.55, now + 0.06);
  tg.gain.setValueAtTime(0.0001, now);
  tg.gain.exponentialRampToValueAtTime(0.14 * v, now + 0.004);
  tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  thump.connect(tg).connect(dst);
  thump.start(now);
  thump.stop(now + 0.11);

  // 4) Optional "cup hollow" — resonance around 400 Hz for a cup-held rattle
  if (opts.lowCup) {
    const cup = c.createBufferSource();
    cup.buffer = noiseBuf;
    const cupBp = c.createBiquadFilter();
    cupBp.type = "bandpass";
    cupBp.frequency.value = 400 + Math.random() * 120;
    cupBp.Q.value = 10;
    const cg = c.createGain();
    cg.gain.setValueAtTime(0.0001, now);
    cg.gain.exponentialRampToValueAtTime(0.12 * v, now + 0.005);
    cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    cup.connect(cupBp).connect(cg).connect(dst);
    cup.start(now, offset + 0.2);
    cup.stop(now + 0.15);
  }
}

function diceRollStart() {
  if (diceLoop) return;
  let stopped = false;

  // Real rattle = several dice colliding per "tick" — fire 2–4 staggered
  // clacks per wave, then a short pause, then another wave. Mix hard
  // (volume 1, cup off) and soft (volume 0.6, cup on) clacks so it sounds
  // like cubes bouncing off each other and the cup wall.
  const wave = () => {
    if (stopped) return;
    const n = 2 + Math.floor(Math.random() * 3); // 2–4 hits
    for (let i = 0; i < n; i++) {
      const delayMs = i * (18 + Math.random() * 32); // 18–50ms between hits
      setTimeout(() => {
        if (stopped) return;
        const soft = Math.random() < 0.45;
        diceClack({
          volume: soft ? 0.55 + Math.random() * 0.15 : 0.85 + Math.random() * 0.15,
          lowCup: soft,
        });
      }, delayMs);
    }
    // Gap between waves
    const gap = 90 + Math.random() * 120; // 90–210ms
    setTimeout(wave, gap);
  };
  wave();

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
  const c = ensureCtx();
  const dst = out();
  if (!c || !dst) return;

  // Settle sequence: 2 big clacks close together (die tumbling to rest),
  // then 1 final thump once it stops.
  diceClack({ volume: 1.1 });
  setTimeout(() => diceClack({ volume: 0.9, lowCup: true }), 45);
  setTimeout(() => diceClack({ volume: 0.7 }), 110);

  // Final low thud (die fully at rest on the table)
  const now = c.currentTime + 0.16;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.3, now + 0.006);
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
