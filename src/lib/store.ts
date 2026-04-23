"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildDeck, shuffle, type Card } from "./deck";

export type Phase = "setup" | "playing" | "ended";

export interface GameState {
  // deck
  phase: Phase;
  deck: Card[]; // remaining cards top = last index
  discard: Card[]; // flipped cards
  lastFlipped: Card | null;

  // dice pool
  dicePool: number; // total dice accumulated
  initialRollDone: boolean; // opening roll completed

  // counters (for rule display only)
  nineCount: number;
  aceCount: number;
  jCount: number;
  kCount: number;

  // status flags
  neuropathActive: boolean; // manually toggled when 3 is drawn / passed
  direction: "cw" | "ccw"; // 10 flips this

  // K recording (base64 data URL)
  kRecording: string | null;

  // end game
  finalRolls: number[];
  rerollsLeft: number;

  // modal state (last flipped card's rule)
  showRule: boolean;

  // actions
  startGame: () => void;
  setInitialDice: (n: number) => void;
  flipCard: () => void;
  closeRule: () => void;
  addDice: (n: number) => void;
  toggleNeuropath: () => void;
  setKRecording: (b64: string | null) => void;
  reshuffle: () => void;
  resetGame: () => void;
  rollFinal: () => void;
  reroll: (keep: boolean[]) => void;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: "setup",
      deck: [],
      discard: [],
      lastFlipped: null,
      dicePool: 0,
      initialRollDone: false,
      nineCount: 0,
      aceCount: 0,
      jCount: 0,
      kCount: 0,
      neuropathActive: false,
      direction: "cw",
      kRecording: null,
      finalRolls: [],
      rerollsLeft: 3,
      showRule: false,

      startGame: () => {
        set({
          phase: "playing",
          deck: shuffle(buildDeck()),
          discard: [],
          lastFlipped: null,
          dicePool: 0,
          initialRollDone: false,
          nineCount: 0,
          aceCount: 0,
          jCount: 0,
          kCount: 0,
          neuropathActive: false,
          direction: "cw",
          kRecording: null,
          finalRolls: [],
          rerollsLeft: 3,
          showRule: false,
        });
      },

      setInitialDice: (n) => {
        if (get().initialRollDone) return;
        set({ dicePool: n, initialRollDone: true });
      },

      flipCard: () => {
        const s = get();
        if (s.deck.length === 0 || s.phase !== "playing") return;
        const newDeck = [...s.deck];
        const card = newDeck.pop()!;
        const discard = [...s.discard, card];

        const patch: Partial<GameState> = {
          deck: newDeck,
          discard,
          lastFlipped: card,
          showRule: true,
        };

        if (card.rank === "9") patch.nineCount = s.nineCount + 1;
        if (card.rank === "A") patch.aceCount = s.aceCount + 1;
        if (card.rank === "J") patch.jCount = s.jCount + 1;
        if (card.rank === "K") patch.kCount = s.kCount + 1;
        if (card.rank === "10")
          patch.direction = s.direction === "cw" ? "ccw" : "cw";

        // 4th A → end game
        if (card.rank === "A" && s.aceCount + 1 >= 4) {
          patch.phase = "ended";
        }

        set(patch as GameState);
      },

      closeRule: () => set({ showRule: false }),

      addDice: (n) => set((s) => ({ dicePool: s.dicePool + n })),

      toggleNeuropath: () =>
        set((s) => ({ neuropathActive: !s.neuropathActive })),

      setKRecording: (b64) => set({ kRecording: b64 }),

      reshuffle: () =>
        set((s) => ({
          deck: shuffle([...s.deck, ...s.discard]),
          discard: [],
        })),

      resetGame: () =>
        set({
          phase: "setup",
          deck: [],
          discard: [],
          lastFlipped: null,
          dicePool: 0,
          initialRollDone: false,
          nineCount: 0,
          aceCount: 0,
          jCount: 0,
          kCount: 0,
          neuropathActive: false,
          direction: "cw",
          kRecording: null,
          finalRolls: [],
          rerollsLeft: 3,
          showRule: false,
        }),

      rollFinal: () => {
        const s = get();
        const rolls = Array.from({ length: s.dicePool }, () =>
          Math.floor(Math.random() * 6) + 1
        );
        set({ finalRolls: rolls });
      },

      reroll: (keep) => {
        const s = get();
        if (s.rerollsLeft <= 0) return;
        const newRolls = s.finalRolls.map((v, i) =>
          keep[i] ? v : Math.floor(Math.random() * 6) + 1
        );
        set({ finalRolls: newRolls, rerollsLeft: s.rerollsLeft - 1 });
      },
    }),
    {
      name: "chaoji-fanpai-state",
      version: 1,
    }
  )
);
