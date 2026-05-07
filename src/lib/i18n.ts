"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rank } from "./deck";
import type { RuleInfo } from "./rules";

export type Lang = "zh" | "en";

/* ---------- Flat UI strings ---------- */

type Dict = Record<string, string>;

const ZH: Dict = {
  // Start screen
  "start.tagline": "A Drinking Game",
  "start.howTo": "玩法",
  "start.rule1": "·  34 张牌，围桌轮流翻",
  "start.rule2": "·  开局摇一颗骰子 = 初始骰池",
  "start.rule3": "·  翻到哪张，照牌面规则执行",
  "start.rule4": "·  翻到第 4 张 A，摇骰子罚酒",
  "start.startBtn": "开局",
  "start.disclaimer": "仅供成年人朋友助兴 · 请适量饮酒",

  // Card back
  "card.back.line1": "翻",
  "card.back.line2": "牌",

  // Rule modal — action prompts per rank
  "prompt.3.head": "大喊「我脑子有病！」",
  "prompt.3.sub": "谁跟你说话 · 罚 1 杯",
  "prompt.4.head": "咬住纸巾传下家",
  "prompt.4.sub": "手碰 1 杯 · 掉地交杯酒",
  "prompt.7.head": "真心话 or 大冒险",
  "prompt.7.sub": "先举手的出题 · 拒绝罚 10 杯",
  "prompt.9.head": "指定一个人喝 {n} 杯",
  "prompt.9.sub": "不能指自己 · 不能拆",
  "prompt.10.head": "方向反转",
  "prompt.10.sub": "下一个换上家",
  "prompt.K.head": "喝 1 杯",
  "prompt.K.sub": "口头定义下一张 K 的喝法",
  "prompt.A.head": "第 {n} 张 A · 还有 {left} 张",
  "prompt.A.sub": "第 4 张 A · 游戏结束",
  "prompt.JOKER.head": "找一个人猜拳，输的认主人",
  "prompt.JOKER.sub": "主人罚酒可找狗代喝",
  "prompt.jDice": "本次加多少颗？",
  "prompt.jDiceConfirm": "确认加入骰池",

  // Rule modal — controls
  "rule.btn.openBody": "📖 规则",
  "rule.btn.openBody.aria": "查看规则",
  "rule.btn.next": "完成 · 下一位",
  "rule.btn.gameOver": "游戏结束",
  "rule.btn.jBlock": "⚠️ 必须加骰子才能继续",
  "rule.body.titleSuffix": "· 规则",
  "rule.body.close": "关闭",

  // Dice controls — initial roll
  "dice.initial.title": "开局摇骰",
  "dice.initial.sub": "一人摇一颗，点数即初始骰池数量",
  "dice.btn.rolling": "摇中...",
  "dice.btn.confirm": "确认 {n} 颗",
  "dice.btn.roll": "摇",
  "dice.pool.current": "当前骰池：{n}",

  // Game board
  "board.resetConfirm": "重开一局？",
  "board.resetAria": "重开一局",
  "board.resetBtn": "重开",
  "board.deckEmpty": "牌已翻完",
  "board.newGame": "重开一局",
  "board.leftCount": "剩 {n} 张",
  "board.flipHint": "点牌堆翻下一张",
  "board.progress": "{pct}% 已翻",

  // Global HUD
  "hud.mute": "关闭音效",
  "hud.unmute": "打开音效",
  "hud.pool": "🎲 骰池",
  "hud.langAria": "切换语言",

  // End-game screen
  "end.headline": "你输了",
  "end.rollN.before": "摇 ",
  "end.rollN.after": " 颗骰子",
  "end.rollN.sub": "点数之和 = 你要喝的杯数",
  "end.btn.roll": "开摇",
  "end.die.keep": "保留",
  "end.die.reroll": "可重摇",
  "end.total": "合计 {n} 杯 🍺",
  "end.reroll.label": "重摇 · 剩 {n} 次 · 代价：亲一口 💋",
  "end.again": "再来一局",

  // PWA install banner
  "pwa.title": "装到手机桌面",
  "pwa.subAndroid": "一键安装，像 App 一样打开。",
  "pwa.subIOS": "点 Safari 底部「分享」→ 添加到主屏幕。",
  "pwa.install": "安装",
  "pwa.dismissAria": "关闭",
};

const EN: Dict = {
  "start.tagline": "A Drinking Game",
  "start.howTo": "How to play",
  "start.rule1": "·  34 cards, flipped around the table in turn",
  "start.rule2": "·  Roll one die at start = seed dice pool",
  "start.rule3": "·  Follow the rule on whichever card you flip",
  "start.rule4": "·  Flip the 4th A to trigger the final roll",
  "start.startBtn": "Start",
  "start.disclaimer": "Adults only · Please drink responsibly",

  "card.back.line1": "FLIP",
  "card.back.line2": "CARD",

  "prompt.3.head": "Shout “I’M CRAZY!”",
  "prompt.3.sub": "Anyone who talks to you drinks 1",
  "prompt.4.head": "Pass a tissue mouth-to-mouth",
  "prompt.4.sub": "Hands touch = 1 cup · Drops = both drink linked",
  "prompt.7.head": "Truth or Dare",
  "prompt.7.sub": "First hand up asks · refuse = 10 cups",
  "prompt.9.head": "Pick someone to drink {n}",
  "prompt.9.sub": "Not yourself · no splitting",
  "prompt.10.head": "Reverse direction",
  "prompt.10.sub": "Next turn passes backward",
  "prompt.K.head": "Drink 1 cup",
  "prompt.K.sub": "Out loud, set the rule for the next K",
  "prompt.A.head": "A #{n} · {left} left",
  "prompt.A.sub": "4th A ends the game",
  "prompt.JOKER.head": "RPS someone — loser is your dog",
  "prompt.JOKER.sub": "Master's drinks can be served by the dog",
  "prompt.jDice": "Add how many dice?",
  "prompt.jDiceConfirm": "Add to pool",

  "rule.btn.openBody": "📖 Rules",
  "rule.btn.openBody.aria": "View rules",
  "rule.btn.next": "Done · Next",
  "rule.btn.gameOver": "Game over",
  "rule.btn.jBlock": "⚠️ Pick dice to continue",
  "rule.body.titleSuffix": "· Rules",
  "rule.body.close": "Close",

  "dice.initial.title": "Opening Roll",
  "dice.initial.sub": "One die — the face value seeds the pool",
  "dice.btn.rolling": "Rolling...",
  "dice.btn.confirm": "Confirm {n}",
  "dice.btn.roll": "Roll",
  "dice.pool.current": "Dice pool: {n}",

  "board.resetConfirm": "Start a new game?",
  "board.resetAria": "Start new game",
  "board.resetBtn": "Reset",
  "board.deckEmpty": "Deck empty",
  "board.newGame": "New game",
  "board.leftCount": "{n} left",
  "board.flipHint": "Tap deck to flip",
  "board.progress": "{pct}% flipped",

  "hud.mute": "Mute",
  "hud.unmute": "Unmute",
  "hud.pool": "🎲 Pool",
  "hud.langAria": "Switch language",

  "end.headline": "YOU LOSE",
  "end.rollN.before": "Roll ",
  "end.rollN.after": " dice",
  "end.rollN.sub": "Sum = cups you drink",
  "end.btn.roll": "Roll",
  "end.die.keep": "Keep",
  "end.die.reroll": "Reroll",
  "end.total": "Total {n} cups 🍺",
  "end.reroll.label": "Reroll · {n} left · cost: one kiss 💋",
  "end.again": "Play again",

  "pwa.title": "Install on home screen",
  "pwa.subAndroid": "Install with one tap — opens like an app.",
  "pwa.subIOS": "In Safari, tap Share → Add to Home Screen.",
  "pwa.install": "Install",
  "pwa.dismissAria": "Dismiss",
};

const STRINGS: Record<Lang, Dict> = { zh: ZH, en: EN };

/* ---------- Rule card content per language ---------- */

const RULE_COLORS: Record<Rank, string> = {
  JOKER: "text-cinnabar",
  "3": "text-jade",
  "4": "text-ivory",
  "7": "text-cinnabar",
  "9": "text-red-gold",
  "10": "text-jade",
  J: "text-red-gold",
  K: "text-cinnabar",
  A: "text-red-gold",
};

type RuleContent = Omit<RuleInfo, "color">;

const RULES_ZH: Record<Rank, RuleContent> = {
  JOKER: {
    title: "主人与狗",
    subtitle: "剪刀石头布定主狗",
    body: ["指定一人猜拳，输的当狗。", "主人罚酒时可让狗代喝。"],
  },
  "3": {
    title: "神经病",
    subtitle: "谁跟我说话谁喝",
    body: ["大喊「我脑子有病！」。", "有人跟你说话，罚他 1 杯。", "下一张 3 接班。"],
  },
  "4": {
    title: "撕纸巾",
    subtitle: "嘴对嘴传纸巾",
    body: ["咬纸巾传下家，手碰到 = 罚 1 杯。", "纸巾掉地 = 两人交杯。"],
  },
  "7": {
    title: "大冒险",
    subtitle: "真心话或大冒险",
    body: ["先举手的人出题。", "不做 / 做失败 = 10 杯。"],
  },
  "9": {
    title: "点名喝",
    subtitle: "第 N 张 9 罚 N 杯",
    body: ["指定一人喝，不能指自己，不能拆。", "第 1 / 2 / 3 / 4 张 → 1 / 2 / 3 / 4 杯。"],
  },
  "10": {
    title: "回转",
    subtitle: "方向反转",
    body: ["下一轮回到上家，顺逆颠倒。"],
  },
  J: {
    title: "加骰",
    subtitle: "骰池 +1~3",
    body: ["选加 1、2 或 3 颗骰子。", "骰池只增不减。"],
  },
  K: {
    title: "传承喝法",
    subtitle: "口头接力",
    body: ["自己先喝 1 杯。", "口头定义下一张 K 的喝法，由下一个抽到的人执行。"],
  },
  A: {
    title: "游戏结束",
    subtitle: "第 4 张 A 开结局",
    body: [
      "前 3 张：无事发生。",
      "第 4 张：抽到的人摇整个骰池，点数之和 = 要喝的杯数。",
      "可重摇 3 次，代价 = 亲左邻或右邻一口。",
    ],
  },
};

const RULES_EN: Record<Rank, RuleContent> = {
  JOKER: {
    title: "Master & Dog",
    subtitle: "RPS decides who plays dog",
    body: [
      "Pick someone and play rock-paper-scissors. The loser becomes your dog.",
      "When the master owes a drink, the dog can drink instead.",
    ],
  },
  "3": {
    title: "Crazy",
    subtitle: "Whoever talks to me drinks",
    body: [
      "Shout “I'M CRAZY!”.",
      "Anyone who talks to you drinks 1 cup.",
      "The next 3 takes over the role.",
    ],
  },
  "4": {
    title: "Tissue Relay",
    subtitle: "Pass a tissue mouth-to-mouth",
    body: [
      "Bite a tissue and pass it to the next player. Hands touching = 1 cup.",
      "Tissue drops = both players drink linked.",
    ],
  },
  "7": {
    title: "Truth or Dare",
    subtitle: "Your choice",
    body: [
      "First hand up gets to ask.",
      "Refuse or fail = 10 cups.",
    ],
  },
  "9": {
    title: "Point to Drink",
    subtitle: "Nth 9 = N cups",
    body: [
      "Pick someone to drink. Not yourself. No splitting.",
      "1st / 2nd / 3rd / 4th → 1 / 2 / 3 / 4 cups.",
    ],
  },
  "10": {
    title: "Reverse",
    subtitle: "Flip the direction",
    body: ["Next turn goes to the previous player. CW ↔ CCW."],
  },
  J: {
    title: "Add Dice",
    subtitle: "Pool +1 to 3",
    body: ["Pick +1, +2, or +3 dice.", "The pool only grows, never shrinks."],
  },
  K: {
    title: "Relay",
    subtitle: "Verbal inheritance",
    body: [
      "Drink 1 cup yourself.",
      "Say out loud how the next K must drink. Whoever draws the next K follows it.",
    ],
  },
  A: {
    title: "Game Over",
    subtitle: "The 4th A triggers the ending",
    body: [
      "1st – 3rd: nothing happens.",
      "4th: whoever drew it rolls the whole dice pool. The sum = cups to drink.",
      "Up to 3 rerolls. Cost = kiss a left or right neighbor.",
    ],
  },
};

const RULES_BY_LANG: Record<Lang, Record<Rank, RuleContent>> = {
  zh: RULES_ZH,
  en: RULES_EN,
};

export function getRules(lang: Lang): Record<Rank, RuleInfo> {
  const src = RULES_BY_LANG[lang];
  const out = {} as Record<Rank, RuleInfo>;
  (Object.keys(src) as Rank[]).forEach((r) => {
    out[r] = { ...src[r], color: RULE_COLORS[r] };
  });
  return out;
}

/* ---------- Zustand store + hooks ---------- */

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

export const useLang = create<LangState>()(
  persist(
    (set, get) => ({
      lang: "zh",
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === "zh" ? "en" : "zh" }),
    }),
    { name: "cf_lang" }
  )
);

export function interpolate(
  str: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : ""
  );
}

export function t(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw = STRINGS[lang]?.[key] ?? STRINGS.zh[key] ?? key;
  return interpolate(raw, vars);
}

/** Hook for components: returns a bound `t(key, vars?)` for the current lang. */
export function useT() {
  const lang = useLang((s) => s.lang);
  return (key: string, vars?: Record<string, string | number>) =>
    t(lang, key, vars);
}
