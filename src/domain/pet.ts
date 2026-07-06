export type EggId = "aurora" | "sprout" | "tide";
export type FocusLevel = 1 | 2 | 3;

export interface EggOption {
  id: EggId;
  name: string;
  petName: string;
  trait: string;
  palette: {
    shell: string;
    accent: string;
    body: string;
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

export const EGG_OPTIONS: EggOption[] = [
  {
    id: "aurora",
    name: "晨光蛋",
    petName: "晨光狐",
    trait: "适合晨读、背诵和每天稳定开局。",
    palette: {
      shell: "#ffe2a7",
      accent: "#ff8a4d",
      body: "#ffbc6b",
    },
  },
  {
    id: "sprout",
    name: "绿芽蛋",
    petName: "森芽鹿",
    trait: "适合长期计划、错题复盘和循序渐进。",
    palette: {
      shell: "#caefd6",
      accent: "#31b56a",
      body: "#7ddc93",
    },
  },
  {
    id: "tide",
    name: "潮汐蛋",
    petName: "蓝潮鲸",
    trait: "适合专注冲刺、限时训练和考试复习。",
    palette: {
      shell: "#cfe7ff",
      accent: "#3b82f6",
      body: "#75c7f0",
    },
  },
];

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
