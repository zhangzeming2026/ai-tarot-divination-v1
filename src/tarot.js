const POSITIONS = ["过去的根源", "当下的课题", "未来的走向"];

const MAJOR_ARCANA = [
  {
    id: "fool",
    arcana: "0",
    name: "愚者",
    imageFile: "The Fool.png",
    upright: "新的开始、自由冒险、信任直觉",
    reversed: "鲁莽、逃避现实、计划不足",
    symbol: "🕊"
  },
  {
    id: "magician",
    arcana: "I",
    name: "魔术师",
    imageFile: "The Magician.png",
    upright: "资源整合、行动力、创造显化",
    reversed: "分心、操控欲、潜力未发挥",
    symbol: "✦"
  },
  {
    id: "high-priestess",
    arcana: "II",
    name: "女祭司",
    imageFile: "The HighPriestess.png",
    upright: "内在智慧、洞察、沉着观察",
    reversed: "直觉受阻、信息模糊、情绪压抑",
    symbol: "☾"
  },
  {
    id: "empress",
    arcana: "III",
    name: "皇后",
    imageFile: "TheEmpress.png",
    upright: "丰盛成长、滋养、关系和谐",
    reversed: "过度依赖、懒散、边界不清",
    symbol: "❀"
  },
  {
    id: "emperor",
    arcana: "IV",
    name: "皇帝",
    imageFile: "TheEmperor.png",
    upright: "秩序、领导、结构稳定",
    reversed: "控制过强、僵化、权威冲突",
    symbol: "♜"
  },
  {
    id: "hierophant",
    arcana: "V",
    name: "教皇",
    imageFile: "TheHierophant.png",
    upright: "传统智慧、学习、规范支持",
    reversed: "教条束缚、盲从、规则冲突",
    symbol: "☥"
  },
  {
    id: "lovers",
    arcana: "VI",
    name: "恋人",
    imageFile: "The Lovers.png",
    upright: "价值一致、真诚选择、关系连接",
    reversed: "犹豫、价值冲突、关系失衡",
    symbol: "♥"
  },
  {
    id: "chariot",
    arcana: "VII",
    name: "战车",
    imageFile: "The Chariot.png",
    upright: "意志坚定、突破困境、动力启动",
    reversed: "失控、方向混乱、阻力",
    symbol: "⚔"
  },
  {
    id: "strength",
    arcana: "VIII",
    name: "力量",
    imageFile: "Strength.png",
    upright: "温和坚定、耐心、内在韧性",
    reversed: "自我怀疑、情绪失控、消耗",
    symbol: "♌"
  },
  {
    id: "hermit",
    arcana: "IX",
    name: "隐者",
    imageFile: "The Hermit.png",
    upright: "独处沉淀、反思、寻找真相",
    reversed: "封闭、拖延、脱离现实",
    symbol: "🕯"
  },
  {
    id: "wheel-of-fortune",
    arcana: "X",
    name: "命运之轮",
    imageFile: "Wheel ofFortune.png",
    upright: "好运、顺势、循环转变",
    reversed: "厄运、逆流、控制失效",
    symbol: "☸"
  },
  {
    id: "justice",
    arcana: "XI",
    name: "正义",
    imageFile: "Justice.png",
    upright: "平衡、因果、真理显现",
    reversed: "不公、偏见、自欺欺人",
    symbol: "⚖"
  },
  {
    id: "hanged-man",
    arcana: "XII",
    name: "吊人",
    imageFile: "The HangedMan.png",
    upright: "暂停、转变视角、神圣等待",
    reversed: "延迟、抗拒、被困",
    symbol: "☯"
  },
  {
    id: "death",
    arcana: "XIII",
    name: "死神",
    imageFile: "Death.png",
    upright: "结束、转生、深度转变",
    reversed: "停滞、抗拒变化、遗留",
    symbol: "☠"
  },
  {
    id: "temperance",
    arcana: "XIV",
    name: "节制",
    imageFile: "Temperance.png",
    upright: "平衡、融合、和谐流动",
    reversed: "失衡、过度、冲突",
    symbol: "⚗"
  },
  {
    id: "devil",
    arcana: "XV",
    name: "恶魔",
    imageFile: "The Devil.png",
    upright: "欲望、物质执着、束缚",
    reversed: "解脱、打破束缚、觉醒",
    symbol: "♆"
  },
  {
    id: "tower",
    arcana: "XVI",
    name: "塔",
    imageFile: "The Tower.png",
    upright: "突然崩溃、彻底改变、解放",
    reversed: "延迟打击、内部崩溃、恐惧",
    symbol: "⚡"
  },
  {
    id: "star",
    arcana: "XVII",
    name: "星星",
    imageFile: "The Star.png",
    upright: "希望、灵感、精神指引",
    reversed: "失望、灵感缺失、迷茫",
    symbol: "✶"
  },
  {
    id: "moon",
    arcana: "XVIII",
    name: "月亮",
    imageFile: "The Moon.png",
    upright: "直觉、梦境、幻觉与真实之间",
    reversed: "清晰、释放恐惧、痊愈",
    symbol: "☽"
  },
  {
    id: "sun",
    arcana: "XIX",
    name: "太阳",
    imageFile: "The Sun.png",
    upright: "成功、活力、纯正喜悦",
    reversed: "暂时遮蔽、短暂黑暗、延迟",
    symbol: "☀"
  },
  {
    id: "judgement",
    arcana: "XX",
    name: "审判",
    imageFile: "Judgement.png",
    upright: "觉醒、召唤、高层次抉择",
    reversed: "自我审判、延迟、内疚",
    symbol: "📯"
  },
  {
    id: "world",
    arcana: "XXI",
    name: "世界",
    imageFile: "The World.png",
    upright: "完成、圆满、强大的结束",
    reversed: "未竟、寻求闭合、中断",
    symbol: "◎"
  }
];

const SUITS = [
  {
    key: "wands",
    nameCn: "权杖",
    fileName: "Wands",
    symbol: "🔥",
    upright: "行动力、意志、扩张",
    reversed: "冲动、焦躁、精力分散"
  },
  {
    key: "cups",
    nameCn: "圣杯",
    fileName: "Cups",
    symbol: "💧",
    upright: "情感、关系、感受流动",
    reversed: "情绪内耗、关系失衡、敏感过度"
  },
  {
    key: "swords",
    nameCn: "宝剑",
    fileName: "Swords",
    symbol: "🗡",
    upright: "思维、决断、真相澄清",
    reversed: "焦虑、误判、沟通冲突"
  },
  {
    key: "pentacles",
    nameCn: "星币",
    fileName: "Pentacles",
    symbol: "🪙",
    upright: "现实、资源、长期建设",
    reversed: "物质压力、停滞、效率下滑"
  }
];

const RANKS = [
  {
    key: "ace",
    labelCn: "王牌",
    fileName: "Ace",
    short: "A",
    upright: "新机会出现、种子能量启动",
    reversed: "机会延迟、动力不足、方向不清"
  },
  {
    key: "two",
    labelCn: "二",
    fileName: "Two",
    short: "2",
    upright: "平衡与选择、关系建立",
    reversed: "拉扯与犹豫、协作失衡"
  },
  {
    key: "three",
    labelCn: "三",
    fileName: "Three",
    short: "3",
    upright: "拓展合作、初步成果",
    reversed: "分工混乱、推进受阻"
  },
  {
    key: "four",
    labelCn: "四",
    fileName: "Four",
    short: "4",
    upright: "稳定与修整、巩固基础",
    reversed: "停滞保守、舒适区困住"
  },
  {
    key: "five",
    labelCn: "五",
    fileName: "Five",
    short: "5",
    upright: "冲突挑战、价值重估",
    reversed: "内耗缓解、准备和解"
  },
  {
    key: "six",
    labelCn: "六",
    fileName: "Six",
    short: "6",
    upright: "改善与过渡、得到支持",
    reversed: "进展缓慢、回到旧问题"
  },
  {
    key: "seven",
    labelCn: "七",
    fileName: "Seven",
    short: "7",
    upright: "评估策略、坚持边界",
    reversed: "怀疑动摇、策略失焦"
  },
  {
    key: "eight",
    labelCn: "八",
    fileName: "Eight",
    short: "8",
    upright: "快速推进、技能深化",
    reversed: "节奏失控、效率下降"
  },
  {
    key: "nine",
    labelCn: "九",
    fileName: "Nine",
    short: "9",
    upright: "阶段收获、临门一脚",
    reversed: "疲惫焦虑、临近退缩"
  },
  {
    key: "ten",
    labelCn: "十",
    fileName: "Ten",
    short: "10",
    upright: "周期完成、结果显化",
    reversed: "负担过重、旧周期拖尾"
  },
  {
    key: "page",
    labelCn: "侍者",
    fileName: "Page",
    short: "P",
    upright: "新讯息、新学习、新尝试",
    reversed: "信息噪声、心态不稳、执行稚嫩"
  },
  {
    key: "knight",
    labelCn: "骑士",
    fileName: "Knight",
    short: "N",
    upright: "行动推进、目标追击",
    reversed: "冒进鲁莽、半途摇摆"
  },
  {
    key: "queen",
    labelCn: "王后",
    fileName: "Queen",
    short: "Q",
    upright: "成熟掌控、细腻平衡",
    reversed: "控制过度、情绪化决策"
  },
  {
    key: "king",
    labelCn: "国王",
    fileName: "King",
    short: "K",
    upright: "权威整合、结果导向",
    reversed: "刚愎或失控、领导失衡"
  }
];

const FILE_OVERRIDES = {
  "pentacles-two": "Two ofPentacles.png",
  "pentacles-three": "Three ofPentacles.png",
  "pentacles-four": "Four ofPentacles.png",
  "pentacles-seven": "Seven ofPentacles.png",
  "pentacles-eight": "Eight ofPentacles.png",
  "pentacles-nine": "Nine ofPentacles.png",
  "pentacles-page": "Page ofPentacles.png",
  "pentacles-knight": "Knight ofPentacles.png",
  "pentacles-queen": "Queen ofPentacles.png",
  "pentacles-king": "King ofPentacles.png",
  "swords-knight": "Knight ofSwords.png",
  "swords-queen": "Queen ofSwords.png"
};

function getMinorImageFile(suit, rank) {
  const id = `${suit.key}-${rank.key}`;
  if (FILE_OVERRIDES[id]) {
    return FILE_OVERRIDES[id];
  }

  return `${rank.fileName} of ${suit.fileName}.png`;
}

function buildMinorArcana() {
  const cards = [];

  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      cards.push({
        id: `${suit.key}-${rank.key}`,
        arcana: `${suit.nameCn}${rank.short}`,
        name: `${suit.nameCn}${rank.labelCn}`,
        imageFile: getMinorImageFile(suit, rank),
        upright: `${suit.upright}；${rank.upright}`,
        reversed: `${suit.reversed}；${rank.reversed}`,
        symbol: suit.symbol
      });
    });
  });

  return cards;
}

const DECK = [...MAJOR_ARCANA, ...buildMinorArcana()];
const MAJOR_IDS = new Set(MAJOR_ARCANA.map((card) => card.id));

function parseBoolean(value) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function isMajorOnlyEnabled() {
  const env = import.meta.env || {};
  return parseBoolean(env.VITE_ONLY_MAJOR_ARCANA) || parseBoolean(env.ONLY_MAJOR_ARCANA);
}

const DEFAULT_DECK_MODE = isMajorOnlyEnabled() ? "major" : "full";

function resolveDeck(mode) {
  return mode === "major" ? MAJOR_ARCANA : DECK;
}

export function getDefaultDeckMode() {
  return DEFAULT_DECK_MODE;
}

function pickOrientation() {
  return Math.random() < 0.5 ? "upright" : "reversed";
}

export function drawThreeCards(deckMode = DEFAULT_DECK_MODE) {
  const pool = [...resolveDeck(deckMode)];
  const picked = [];

  for (let i = 0; i < 3; i += 1) {
    const idx = Math.floor(Math.random() * pool.length);
    const card = pool.splice(idx, 1)[0];
    const orientation = pickOrientation();

    picked.push({
      id: card.id,
      arcana: card.arcana,
      arcanaType: MAJOR_IDS.has(card.id) ? "大阿卡那" : "小阿卡那",
      name: card.name,
      imageFile: card.imageFile,
      position: POSITIONS[i],
      orientation,
      meaning: orientation === "upright" ? card.upright : card.reversed,
      symbol: card.symbol || "✦",
      imageUrl: `/image/${encodeURIComponent(card.imageFile)}`
    });
  }

  return picked;
}
