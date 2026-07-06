export type EggId =
  | "zodiac_rat"
  | "zodiac_ox"
  | "zodiac_tiger"
  | "zodiac_rabbit"
  | "zodiac_dragon"
  | "zodiac_snake"
  | "zodiac_horse"
  | "zodiac_goat"
  | "zodiac_monkey"
  | "zodiac_rooster"
  | "zodiac_dog"
  | "zodiac_pig"
  | "windfire"
  | "moonjade"
  | "mechlion"
  | "lotusguard"
  | "aurora"
  | "sprout"
  | "tide";
export type EggCategory = "zodiac" | "myth" | "classic";
export type EggMotif =
  | "whisker"
  | "horn"
  | "stripe"
  | "moon"
  | "crest"
  | "serpent"
  | "mane"
  | "cloud"
  | "spark"
  | "crown"
  | "guard"
  | "fortune"
  | "flame"
  | "lunar"
  | "lion"
  | "lotus"
  | "classic";
export type FocusLevel = 1 | 2 | 3;

export interface EggOption {
  id: EggId;
  category: EggCategory;
  name: string;
  petName: string;
  adultName: string;
  archetype: string;
  trait: string;
  studyStyle: string;
  iconLabel: string;
  motif: EggMotif;
  palette: {
    shell: string;
    accent: string;
    body: string;
    glow: string;
    ink: string;
  };
}

export interface EvolutionStage {
  id: "egg" | "hatchling" | "student" | "scholar" | "guardian";
  name: string;
  threshold: number;
  title: string;
  description: string;
}

export interface FeedItem {
  id: "seed_cracker" | "focus_biscuit" | "star_meal";
  name: string;
  cost: number;
  growth: number;
  description: string;
}

export interface StudyInput {
  subject: string;
  minutes: number;
  focusLevel: FocusLevel;
  photoPath: string;
  note?: string;
}

export interface StudyLog extends StudyInput {
  id: string;
  dateKey: string;
  reward: number;
  createdAt: string;
}

export interface FeedLog {
  id: string;
  itemId: FeedItem["id"];
  cost: number;
  growth: number;
  createdAt: string;
}

export interface PetProgress {
  eggId: EggId;
  petName: string;
  points: number;
  growth: number;
  streak: number;
  totalStudyMinutes: number;
  lastStudyDateKey: string;
  studyLogs: StudyLog[];
  feedLogs: FeedLog[];
}

const zodiacEggs: EggOption[] = [
  {
    id: "zodiac_rat",
    category: "zodiac",
    name: "星籽鼠蛋",
    petName: "星籽灵鼠",
    adultName: "星图策士",
    archetype: "十二生肖 · 子鼠",
    trait: "灵巧、记忆快，适合碎片时间背诵。",
    studyStyle: "单词、公式、知识点速记",
    iconLabel: "子",
    motif: "whisker",
    palette: { shell: "#e8edf7", accent: "#7c8aa5", body: "#b9c5db", glow: "#eef5ff", ink: "#243148" },
  },
  {
    id: "zodiac_ox",
    category: "zodiac",
    name: "青耕牛蛋",
    petName: "青耕小牛",
    adultName: "山河力士",
    archetype: "十二生肖 · 丑牛",
    trait: "踏实、耐力强，适合长期计划。",
    studyStyle: "作业推进、错题整理",
    iconLabel: "丑",
    motif: "horn",
    palette: { shell: "#dff1e7", accent: "#3c8f68", body: "#8fcb9e", glow: "#edfff3", ink: "#1f3d2f" },
  },
  {
    id: "zodiac_tiger",
    category: "zodiac",
    name: "赤曜虎蛋",
    petName: "赤曜幼虎",
    adultName: "赤曜战将",
    archetype: "十二生肖 · 寅虎",
    trait: "有冲劲，适合限时训练和突破难题。",
    studyStyle: "刷题冲刺、薄弱项突破",
    iconLabel: "寅",
    motif: "stripe",
    palette: { shell: "#ffe0b8", accent: "#f97316", body: "#f6b15d", glow: "#fff3dc", ink: "#4a2a14" },
  },
  {
    id: "zodiac_rabbit",
    category: "zodiac",
    name: "月桂兔蛋",
    petName: "月桂小兔",
    adultName: "月桂药师",
    archetype: "十二生肖 · 卯兔",
    trait: "安静、细腻，适合阅读和复盘。",
    studyStyle: "阅读理解、笔记整理",
    iconLabel: "卯",
    motif: "moon",
    palette: { shell: "#fff1f5", accent: "#ef7da8", body: "#ffc0d4", glow: "#fff7fb", ink: "#4a2637" },
  },
  {
    id: "zodiac_dragon",
    category: "zodiac",
    name: "云海龙蛋",
    petName: "云海幼龙",
    adultName: "云海龙君",
    archetype: "十二生肖 · 辰龙",
    trait: "目标感强，适合阶段复习和大目标。",
    studyStyle: "考试复盘、章节总览",
    iconLabel: "辰",
    motif: "crest",
    palette: { shell: "#d9f7ff", accent: "#0891b2", body: "#70d8ed", glow: "#ecfeff", ink: "#164052" },
  },
  {
    id: "zodiac_snake",
    category: "zodiac",
    name: "青玉蛇蛋",
    petName: "青玉灵蛇",
    adultName: "青玉谋士",
    archetype: "十二生肖 · 巳蛇",
    trait: "冷静、善分析，适合难题拆解。",
    studyStyle: "逻辑推理、题型归纳",
    iconLabel: "巳",
    motif: "serpent",
    palette: { shell: "#dff7ed", accent: "#10a37f", body: "#76d4b1", glow: "#effff8", ink: "#173d35" },
  },
  {
    id: "zodiac_horse",
    category: "zodiac",
    name: "逐风马蛋",
    petName: "逐风幼马",
    adultName: "逐风骑士",
    archetype: "十二生肖 · 午马",
    trait: "行动快，适合番茄钟和短冲刺。",
    studyStyle: "计时训练、阶段冲刺",
    iconLabel: "午",
    motif: "mane",
    palette: { shell: "#ffe8d6", accent: "#d97706", body: "#f5b06c", glow: "#fff6eb", ink: "#49301d" },
  },
  {
    id: "zodiac_goat",
    category: "zodiac",
    name: "云绒羊蛋",
    petName: "云绒小羊",
    adultName: "云绒守书者",
    archetype: "十二生肖 · 未羊",
    trait: "温和稳定，适合每天固定习惯。",
    studyStyle: "晨读、听写、基础巩固",
    iconLabel: "未",
    motif: "cloud",
    palette: { shell: "#fff4df", accent: "#d6a449", body: "#f2d795", glow: "#fffaf0", ink: "#4b3a20" },
  },
  {
    id: "zodiac_monkey",
    category: "zodiac",
    name: "星机猴蛋",
    petName: "星机小猴",
    adultName: "星机巧匠",
    archetype: "十二生肖 · 申猴",
    trait: "好奇、灵活，适合举一反三。",
    studyStyle: "实验探究、错题变式",
    iconLabel: "申",
    motif: "spark",
    palette: { shell: "#efe7ff", accent: "#8b5cf6", body: "#bda4ff", glow: "#f7f2ff", ink: "#352456" },
  },
  {
    id: "zodiac_rooster",
    category: "zodiac",
    name: "晨鸣凤蛋",
    petName: "晨鸣小凤",
    adultName: "晨鸣司钟",
    archetype: "十二生肖 · 酉鸡",
    trait: "守时、提醒感强，适合固定打卡。",
    studyStyle: "早晚计划、时间管理",
    iconLabel: "酉",
    motif: "crown",
    palette: { shell: "#fff1cc", accent: "#f43f5e", body: "#f8c85f", glow: "#fff8e5", ink: "#4d2430" },
  },
  {
    id: "zodiac_dog",
    category: "zodiac",
    name: "守卷犬蛋",
    petName: "守卷小犬",
    adultName: "守卷卫士",
    archetype: "十二生肖 · 戌狗",
    trait: "忠诚可靠，适合陪伴式自习。",
    studyStyle: "自习室、长时间陪伴",
    iconLabel: "戌",
    motif: "guard",
    palette: { shell: "#e6f0ff", accent: "#4f6fda", body: "#91a9e8", glow: "#f0f6ff", ink: "#25345d" },
  },
  {
    id: "zodiac_pig",
    category: "zodiac",
    name: "福袋猪蛋",
    petName: "福袋小猪",
    adultName: "福袋掌柜",
    archetype: "十二生肖 · 亥猪",
    trait: "乐观有奖励感，适合积累式任务。",
    studyStyle: "任务清单、奖励兑换",
    iconLabel: "亥",
    motif: "fortune",
    palette: { shell: "#ffe4ea", accent: "#fb7185", body: "#f9a8b8", glow: "#fff1f4", ink: "#542536" },
  },
];

const mythEggs: EggOption[] = [
  {
    id: "windfire",
    category: "myth",
    name: "风火莲蛋",
    petName: "风火童子",
    adultName: "风火少年",
    archetype: "神话灵感 · 风火轮",
    trait: "热血、爆发强，适合把拖延任务一口气点燃。",
    studyStyle: "拖延清理、考前冲刺",
    iconLabel: "火",
    motif: "flame",
    palette: { shell: "#ffe3d0", accent: "#ef4444", body: "#ffb35c", glow: "#fff1e7", ink: "#541c14" },
  },
  {
    id: "moonjade",
    category: "myth",
    name: "月玉仙蛋",
    petName: "月玉灵童",
    adultName: "月玉仙子",
    archetype: "神话灵感 · 月宫",
    trait: "清醒、专注，适合夜间复盘和阅读。",
    studyStyle: "阅读、背诵、复盘",
    iconLabel: "月",
    motif: "lunar",
    palette: { shell: "#eef2ff", accent: "#818cf8", body: "#c4b5fd", glow: "#f6f7ff", ink: "#2f2b5f" },
  },
  {
    id: "mechlion",
    category: "myth",
    name: "醒狮机蛋",
    petName: "醒狮幼将",
    adultName: "机甲醒狮",
    archetype: "国潮灵感 · 醒狮",
    trait: "仪式感强，适合开启一天的第一段学习。",
    studyStyle: "晨间启动、目标宣言",
    iconLabel: "狮",
    motif: "lion",
    palette: { shell: "#fff0cf", accent: "#dc2626", body: "#fbbf24", glow: "#fff8e6", ink: "#4a1d1d" },
  },
  {
    id: "lotusguard",
    category: "myth",
    name: "莲灯灵蛋",
    petName: "莲灯小守",
    adultName: "莲灯守护者",
    archetype: "神话灵感 · 莲灯",
    trait: "沉稳、治愈，适合建立长期自律节奏。",
    studyStyle: "长期计划、情绪稳定",
    iconLabel: "莲",
    motif: "lotus",
    palette: { shell: "#e7f8f2", accent: "#14b8a6", body: "#8ae0d1", glow: "#effffb", ink: "#17433d" },
  },
];

const classicEggs: EggOption[] = [
  {
    id: "aurora",
    category: "classic",
    name: "晨光蛋",
    petName: "晨光狐",
    adultName: "晨光狐导师",
    archetype: "经典伙伴 · 晨读",
    trait: "适合晨读、背诵和每天稳定开局。",
    studyStyle: "晨读、背诵、每日启动",
    iconLabel: "晨",
    motif: "classic",
    palette: { shell: "#ffe2a7", accent: "#ff8a4d", body: "#ffbc6b", glow: "#fff4db", ink: "#4d2c17" },
  },
  {
    id: "sprout",
    category: "classic",
    name: "绿芽蛋",
    petName: "森芽鹿",
    adultName: "森芽鹿导师",
    archetype: "经典伙伴 · 长线",
    trait: "适合长期计划、错题复盘和循序渐进。",
    studyStyle: "长期计划、错题复盘",
    iconLabel: "芽",
    motif: "classic",
    palette: { shell: "#caefd6", accent: "#31b56a", body: "#7ddc93", glow: "#ecfff2", ink: "#1c3f2b" },
  },
  {
    id: "tide",
    category: "classic",
    name: "潮汐蛋",
    petName: "蓝潮鲸",
    adultName: "蓝潮鲸导师",
    archetype: "经典伙伴 · 冲刺",
    trait: "适合专注冲刺、限时训练和考试复习。",
    studyStyle: "限时训练、考试复习",
    iconLabel: "潮",
    motif: "classic",
    palette: { shell: "#cfe7ff", accent: "#3b82f6", body: "#75c7f0", glow: "#edf7ff", ink: "#17355e" },
  },
];

export const EGG_OPTIONS: EggOption[] = [...zodiacEggs, ...mythEggs, ...classicEggs];

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    id: "egg",
    name: "蛋眠期",
    threshold: 0,
    title: "等待孵化",
    description: "完成学习打卡并喂养后，它会慢慢醒来。",
  },
  {
    id: "hatchling",
    name: "幼生期",
    threshold: 80,
    title: "刚刚破壳",
    description: "已经开始回应你的学习节奏。",
  },
  {
    id: "student",
    name: "陪读期",
    threshold: 220,
    title: "一起学习",
    description: "能陪你完成更长的学习计划。",
  },
  {
    id: "scholar",
    name: "进阶期",
    threshold: 460,
    title: "知识充能",
    description: "持续学习让它拥有更稳定的能量。",
  },
  {
    id: "guardian",
    name: "守护期",
    threshold: 760,
    title: "自律守护",
    description: "它已经成为你的长期学习伙伴。",
  },
];

export const FEED_ITEMS: FeedItem[] = [
  {
    id: "seed_cracker",
    name: "知识饼干",
    cost: 30,
    growth: 36,
    description: "适合每日小目标后的轻量喂养。",
  },
  {
    id: "focus_biscuit",
    name: "专注能量块",
    cost: 60,
    growth: 88,
    description: "把一次完整学习转化成明显成长。",
  },
  {
    id: "star_meal",
    name: "星光套餐",
    cost: 110,
    growth: 170,
    description: "适合阶段复盘或大块时间学习后使用。",
  },
];

const FOCUS_BONUS: Record<FocusLevel, number> = {
  1: 0,
  2: 5,
  3: 12,
};

export function createInitialProgress(eggId: EggId): PetProgress {
  const egg = getEggOption(eggId);

  return {
    eggId,
    petName: egg.petName,
    points: 0,
    growth: 0,
    streak: 0,
    totalStudyMinutes: 0,
    lastStudyDateKey: "",
    studyLogs: [],
    feedLogs: [],
  };
}

export function calculateStudyReward(input: Pick<StudyInput, "minutes" | "focusLevel">) {
  validateStudyInput({
    subject: "study",
    minutes: input.minutes,
    focusLevel: input.focusLevel,
    photoPath: "reward-preview",
  });

  return input.minutes * 2 + FOCUS_BONUS[input.focusLevel];
}

export function recordStudySession(progress: PetProgress, input: StudyInput, now = new Date()) {
  validateStudyInput(input);

  const dateKey = getDateKey(now);
  const reward = calculateStudyReward(input);
  const isSameStudyDay = progress.lastStudyDateKey === dateKey;
  const streak = isSameStudyDay
    ? progress.streak
    : isConsecutiveDay(progress.lastStudyDateKey, dateKey)
      ? progress.streak + 1
      : 1;

  const log: StudyLog = {
    id: `${dateKey}-${now.getTime()}-${progress.studyLogs.length + 1}`,
    subject: input.subject.trim() || "自主学习",
    minutes: input.minutes,
    focusLevel: input.focusLevel,
    photoPath: input.photoPath.trim(),
    note: input.note?.trim(),
    dateKey,
    reward,
    createdAt: now.toISOString(),
  };

  return {
    reward,
    progress: {
      ...progress,
      points: progress.points + reward,
      streak,
      totalStudyMinutes: progress.totalStudyMinutes + input.minutes,
      lastStudyDateKey: dateKey,
      studyLogs: [log, ...progress.studyLogs],
    },
  };
}

export function feedPet(progress: PetProgress, itemId: FeedItem["id"], now = new Date()) {
  const item = FEED_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error(`Unknown feed item: ${itemId}`);
  }

  if (progress.points < item.cost) {
    throw new Error("Not enough points to feed pet");
  }

  const log: FeedLog = {
    id: `${now.getTime()}-${progress.feedLogs.length + 1}`,
    itemId,
    cost: item.cost,
    growth: item.growth,
    createdAt: now.toISOString(),
  };

  return {
    item,
    progress: {
      ...progress,
      points: progress.points - item.cost,
      growth: progress.growth + item.growth,
      feedLogs: [log, ...progress.feedLogs],
    },
  };
}

export function getEvolutionStage(growth: number) {
  return EVOLUTION_STAGES.reduce((current, stage) => (growth >= stage.threshold ? stage : current));
}

export function getNextEvolutionStage(growth: number) {
  return EVOLUTION_STAGES.find((stage) => stage.threshold > growth);
}

export function getEvolutionProgress(growth: number) {
  const current = getEvolutionStage(growth);
  const next = getNextEvolutionStage(growth);

  if (!next) {
    return 100;
  }

  const stageGrowth = growth - current.threshold;
  const stageRange = next.threshold - current.threshold;
  return Math.min(100, Math.max(0, Math.round((stageGrowth / stageRange) * 100)));
}

export function getEggOption(eggId: EggId) {
  const egg = EGG_OPTIONS.find((candidate) => candidate.id === eggId);
  if (!egg) {
    throw new Error(`Unknown egg: ${eggId}`);
  }

  return egg;
}

export function getPetAssetPath(eggId: EggId, variant: "egg" | "adult") {
  return `/static/pets/${eggId}-${variant}.webp`;
}

export function getPetEggCutoutPath(eggId: EggId) {
  return `/static/pets/${eggId}-egg-cutout.webp`;
}

export function getPetStageAssetPath(eggId: EggId, stageId: EvolutionStage["id"]) {
  if (stageId === "egg") {
    return getPetEggCutoutPath(eggId);
  }

  if (stageId === "guardian") {
    return getPetAssetPath(eggId, "adult");
  }

  return `/static/pets/${eggId}-${stageId}.webp`;
}

export function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validateStudyInput(input: StudyInput) {
  if (!Number.isFinite(input.minutes) || input.minutes < 5 || input.minutes > 240) {
    throw new Error("Study minutes must be between 5 and 240");
  }

  if (![1, 2, 3].includes(input.focusLevel)) {
    throw new Error("Focus level must be 1, 2, or 3");
  }

  if (!input.photoPath.trim()) {
    throw new Error("请上传学习打卡照片");
  }
}

function isConsecutiveDay(previousDateKey: string, currentDateKey: string) {
  if (!previousDateKey) {
    return false;
  }

  return daysFromDateKey(currentDateKey) - daysFromDateKey(previousDateKey) === 1;
}

function daysFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}
