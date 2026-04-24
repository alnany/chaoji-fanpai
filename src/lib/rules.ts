import type { Rank } from "./deck";

export interface RuleInfo {
  title: string;
  subtitle: string;
  body: string[];
  color: string; // tailwind text color for header accent
}

export const RULES: Record<Rank, RuleInfo> = {
  JOKER: {
    title: "主人与狗",
    subtitle: "剪刀石头布定主狗",
    color: "text-cinnabar",
    body: [
      "指定一人猜拳，输的当狗。",
      "主人罚酒时可让狗代喝。",
    ],
  },
  "3": {
    title: "神经病",
    subtitle: "谁跟我说话谁喝",
    color: "text-jade",
    body: [
      "大喊「我脑子有病！」。",
      "有人跟你说话，罚他 1 杯。",
      "下一张 3 接班。",
    ],
  },
  "4": {
    title: "撕纸巾",
    subtitle: "嘴对嘴传纸巾",
    color: "text-ivory",
    body: [
      "咬纸巾传下家，手碰到 = 罚 1 杯。",
      "纸巾掉地 = 两人交杯。",
    ],
  },
  "7": {
    title: "大冒险",
    subtitle: "真心话或大冒险",
    color: "text-cinnabar",
    body: [
      "先举手的人出题。",
      "不做 / 做失败 = 10 杯。",
    ],
  },
  "9": {
    title: "点名喝",
    subtitle: "第 N 张 9 罚 N 杯",
    color: "text-red-gold",
    body: [
      "指定一人喝，不能指自己，不能拆。",
      "第 1 / 2 / 3 / 4 张 → 1 / 2 / 3 / 4 杯。",
    ],
  },
  "10": {
    title: "回转",
    subtitle: "方向反转",
    color: "text-jade",
    body: [
      "下一轮回到上家，顺逆颠倒。",
    ],
  },
  J: {
    title: "加骰",
    subtitle: "骰池 +1~3",
    color: "text-red-gold",
    body: [
      "选加 1、2 或 3 颗骰子。",
      "骰池只增不减。",
    ],
  },
  K: {
    title: "传承喝法",
    subtitle: "口头接力",
    color: "text-cinnabar",
    body: [
      "自己先喝 1 杯。",
      "口头定义下一张 K 的喝法，由下一个抽到的人执行。",
    ],
  },
  A: {
    title: "游戏结束",
    subtitle: "第 4 张 A 开结局",
    color: "text-red-gold",
    body: [
      "前 3 张：无事发生。",
      "第 4 张：抽到的人摇整个骰池，点数之和 = 要喝的杯数。",
      "可重摇 3 次，代价 = 亲左邻或右邻一口。",
    ],
  },
};
