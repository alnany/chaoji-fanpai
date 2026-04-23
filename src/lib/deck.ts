// Card system for 超级翻牌
// 34-card deck: Joker×2 + 3/4/7/9/10/J/K/A each ×4

export type Rank = "JOKER" | "3" | "4" | "7" | "9" | "10" | "J" | "K" | "A";
export type Suit = "spade" | "heart" | "diamond" | "club" | "red-joker" | "black-joker";

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

const SUITS: Suit[] = ["spade", "heart", "diamond", "club"];

export function buildDeck(): Card[] {
  const deck: Card[] = [];

  // 2 Jokers
  deck.push({ id: "joker-red", rank: "JOKER", suit: "red-joker" });
  deck.push({ id: "joker-black", rank: "JOKER", suit: "black-joker" });

  // 3, 4, 7, 9, 10, J, K, A — each × 4 suits
  const ranks: Rank[] = ["3", "4", "7", "9", "10", "J", "K", "A"];
  for (const rank of ranks) {
    for (const suit of SUITS) {
      deck.push({ id: `${rank}-${suit}`, rank, suit });
    }
  }
  return deck;
}

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const RANK_LABEL: Record<Rank, string> = {
  JOKER: "小丑",
  "3": "3",
  "4": "4",
  "7": "7",
  "9": "9",
  "10": "10",
  J: "J",
  K: "K",
  A: "A",
};

export const SUIT_SYMBOL: Record<Suit, string> = {
  spade: "♠",
  heart: "♥",
  diamond: "♦",
  club: "♣",
  "red-joker": "🃏",
  "black-joker": "🃏",
};

export function isRed(suit: Suit): boolean {
  return suit === "heart" || suit === "diamond" || suit === "red-joker";
}
