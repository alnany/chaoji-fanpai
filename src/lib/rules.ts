import type { Rank } from "./deck";

export interface RuleInfo {
  title: string;
  subtitle: string;
  body: string[];
  color: string; // tailwind text color for header accent
}

export const RULES: Record<Rank, RuleInfo> = {
  JOKER: {
    title: "PK 牌 · 主人与狗",
    subtitle: "剪刀石头布，输的叫爸爸",
    color: "text-cinnabar",
    body: [
      "抽到的人指定一人挑战剪刀石头布。",
      "输的对赢的说：「主人，我是你的狗。」",
      "从此主人被罚酒时，狗替喝。",
      "❌ 主人「跟神经病说话」被罚，狗不能代喝。",
      "❌ 主人与狗之间若有人是神经病，他们之间说话被罚免罚（一家人）。",
      "可同时是多个主人的狗，也可养多条狗。关系仅当局有效。",
    ],
  },
  "3": {
    title: "神经病",
    subtitle: "我脑子有病！",
    color: "text-jade",
    body: [
      "抽到的人大喊：「我脑子有病！」",
      "任何人跟他说话，立即罚酒 1 杯。",
      "神经病可以主动勾引别人开口 😈",
      "效果持续到下一张 3 被翻到，身份转移。",
    ],
  },
  "4": {
    title: "撕纸巾",
    subtitle: "嘴对嘴传，手碰就罚",
    color: "text-ivory",
    body: [
      "抽到的人咬一张纸巾，用嘴传给下家。",
      "接到后两人嘴里都要有纸巾，然后下家再传下下家。",
      "手碰纸巾 = 当场罚 1 杯。",
      "掉地 / 拒传 / 失败 = 两人交杯酒 1 杯。",
      "传递过程为原子动作，期间不翻新牌。",
    ],
  },
  "7": {
    title: "大冒险",
    subtitle: "真心话 or 大冒险",
    color: "text-cinnabar",
    body: [
      "抽到的人做一次真心话或大冒险。",
      "仅允许 1 人出题（先举手先得）。",
      "拒绝 / 失败 = 罚 10 杯 🍺🍺🍺",
    ],
  },
  "9": {
    title: "点名喝",
    subtitle: "指定一人喝酒",
    color: "text-red-gold",
    body: [
      "第 1 张 9：指定 1 人喝 1 杯",
      "第 2 张 9：指定 1 人喝 2 杯",
      "第 3 张 9：指定 1 人喝 3 杯",
      "第 4 张 9：指定 1 人喝 4 杯",
      "不能指定自己，不能拆分。",
    ],
  },
  "10": {
    title: "回转",
    subtitle: "方向反转，上家再抽",
    color: "text-jade",
    body: [
      "下一轮回到上一个抽牌人。",
      "回合方向反转（顺 ↔ 逆）。",
      "连续两张 10 = 等于没反转，正常衔接。",
    ],
  },
  J: {
    title: "加骰子",
    subtitle: "骰池 +1 ~ +3",
    color: "text-red-gold",
    body: [
      "往骰池里加 1、2 或 3 颗骰子（自己选）。",
      "骰池只增不减，保留到终局摇。",
      "全局最多 4 张 J。",
    ],
  },
  K: {
    title: "传承喝法",
    subtitle: "口头接力",
    color: "text-cinnabar",
    body: [
      "抽到的人：先喝 1 杯。",
      "当场口头定义下一张 K 的喝法（不针对特定玩家）。",
      "下一张 K 出现时，按上一张 K 定义的规则执行。",
    ],
  },
  A: {
    title: "终局之神",
    subtitle: "四张 A 游戏结束",
    color: "text-red-gold",
    body: [
      "第 1–3 张 A：无事发生，继续翻牌。",
      "第 4 张 A：游戏结束。",
      "抽到第 4 张 A 的人喝酒。",
      "摇骰池所有骰子，点数之和 = 喝几杯。",
      "可重摇（最多 3 次）：留任意小点数 + 重摇剩余。",
      "重摇代价：亲左 or 右一口 💋",
    ],
  },
};
