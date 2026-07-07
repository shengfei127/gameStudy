"use strict";

const db = uniCloud.database();
const progressCollection = db.collection("study_pet_progress");

const EGG_NAMES = {
  zodiac_rat: "星籽灵鼠",
  zodiac_ox: "青耕小牛",
  zodiac_tiger: "赤曜幼虎",
  zodiac_rabbit: "月桂小兔",
  zodiac_dragon: "云海幼龙",
  zodiac_snake: "青玉灵蛇",
  zodiac_horse: "逐风幼马",
  zodiac_goat: "云绒小羊",
  zodiac_monkey: "星机小猴",
  zodiac_rooster: "晨鸣小凤",
  zodiac_dog: "守卷小犬",
  zodiac_pig: "福袋小猪",
  windfire: "风火童子",
  moonjade: "月玉灵童",
  mechlion: "醒狮幼将",
  lotusguard: "莲灯小守",
  aurora: "晨光狐",
  sprout: "森芽鹿",
  tide: "蓝潮鲸",
};

const FEED_ITEMS = [
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

const EVOLUTION_STAGES = [
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

const FOCUS_BONUS = {
  1: 0,
  2: 5,
  3: 12,
};

exports.main = async (event) => {
  try {
    const action = event && event.action;
    const payload = (event && event.payload) || {};
    const clientId = requireClientId(payload.clientId);

    if (action === "getProgress") {
      return ok(await getProgress(clientId));
    }

    if (action === "chooseEgg") {
      return ok(await chooseEgg(clientId, payload.eggId));
    }

    if (action === "checkIn") {
      return ok(await checkIn(clientId, payload.input));
    }

    if (action === "feed") {
      return ok(await feed(clientId, payload.itemId));
    }

    if (action === "resetProgress") {
      await removeProgress(clientId);
      return ok(null);
    }

    throw new Error(`Unsupported action: ${action}`);
  } catch (error) {
    return fail(error && error.message ? error.message : "云函数执行失败");
  }
};

async function getProgress(clientId) {
  const record = await getProgressRecord(clientId);
  return record ? record.progress : null;
}

async function chooseEgg(clientId, eggId) {
  const progress = createInitialProgress(eggId);
  await saveProgress(clientId, progress);
  return progress;
}

async function checkIn(clientId, input) {
  const progress = requireProgress(await getProgress(clientId));
  const result = recordStudySession(progress, input, new Date());
  await saveProgress(clientId, result.progress);
  return result;
}

async function feed(clientId, itemId) {
  const progress = requireProgress(await getProgress(clientId));
  const beforeStage = getEvolutionStage(progress.growth);
  const result = feedPet(progress, itemId, new Date());
  const afterStage = getEvolutionStage(result.progress.growth);

  await saveProgress(clientId, result.progress);

  return {
    ...result,
    evolved: beforeStage.id !== afterStage.id,
    stage: afterStage,
  };
}

function createInitialProgress(eggId) {
  const petName = EGG_NAMES[eggId];

  if (!petName) {
    throw new Error(`Unknown egg: ${eggId}`);
  }

  return {
    eggId,
    petName,
    points: 0,
    growth: 0,
    streak: 0,
    totalStudyMinutes: 0,
    lastStudyDateKey: "",
    studyLogs: [],
    feedLogs: [],
  };
}

function recordStudySession(progress, input, now) {
  validateStudyInput(input);

  const dateKey = getDateKey(now);
  const subject = String(input.subject || "").trim() || "自主学习";
  const hasCheckedSubjectToday = progress.studyLogs.some(
    (log) => log.dateKey === dateKey && log.subject === subject,
  );

  if (hasCheckedSubjectToday) {
    throw new Error(`今天${subject}已经打卡过了`);
  }

  const reward = calculateStudyReward(input);
  const isSameStudyDay = progress.lastStudyDateKey === dateKey;
  const streak = isSameStudyDay
    ? progress.streak
    : isConsecutiveDay(progress.lastStudyDateKey, dateKey)
      ? progress.streak + 1
      : 1;

  const log = {
    id: `${dateKey}-${now.getTime()}-${progress.studyLogs.length + 1}`,
    subject,
    minutes: input.minutes,
    focusLevel: input.focusLevel,
    photoPath: String(input.photoPath || "").trim(),
    note: input.note ? String(input.note).trim() : undefined,
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

function feedPet(progress, itemId, now) {
  const item = FEED_ITEMS.find((candidate) => candidate.id === itemId);

  if (!item) {
    throw new Error(`Unknown feed item: ${itemId}`);
  }

  if (progress.points < item.cost) {
    throw new Error("Not enough points to feed pet");
  }

  const log = {
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

function calculateStudyReward(input) {
  return input.minutes * 2 + FOCUS_BONUS[input.focusLevel];
}

function validateStudyInput(input) {
  if (!input || !Number.isFinite(input.minutes) || input.minutes < 5 || input.minutes > 240) {
    throw new Error("Study minutes must be between 5 and 240");
  }

  if (![1, 2, 3].includes(input.focusLevel)) {
    throw new Error("Focus level must be 1, 2, or 3");
  }

  if (!String(input.photoPath || "").trim()) {
    throw new Error("请上传学习打卡照片");
  }
}

function getEvolutionStage(growth) {
  return EVOLUTION_STAGES.reduce((current, stage) => (growth >= stage.threshold ? stage : current));
}

function requireProgress(progress) {
  if (!progress) {
    throw new Error("请先选择一颗宠物蛋");
  }

  return progress;
}

function getDateKey(date) {
  const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().slice(0, 10);
}

function isConsecutiveDay(previousDateKey, currentDateKey) {
  if (!previousDateKey) {
    return false;
  }

  return daysFromDateKey(currentDateKey) - daysFromDateKey(previousDateKey) === 1;
}

function daysFromDateKey(dateKey) {
  const parts = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(parts[0], parts[1] - 1, parts[2]) / 86400000);
}

async function getProgressRecord(clientId) {
  const result = await progressCollection.where({ clientId }).limit(1).get();
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

async function saveProgress(clientId, progress) {
  const now = new Date().toISOString();
  const record = await getProgressRecord(clientId);

  if (record && record._id) {
    await progressCollection.doc(record._id).update({
      progress,
      updatedAt: now,
    });
    return;
  }

  await progressCollection.add({
    clientId,
    progress,
    createdAt: now,
    updatedAt: now,
  });
}

async function removeProgress(clientId) {
  const record = await getProgressRecord(clientId);

  if (record && record._id) {
    await progressCollection.doc(record._id).remove();
  }
}

function requireClientId(value) {
  const clientId = String(value || "").trim();

  if (!clientId) {
    throw new Error("缺少客户端身份标识");
  }

  return clientId;
}

function ok(data) {
  return {
    success: true,
    data,
  };
}

function fail(message) {
  return {
    success: false,
    message,
  };
}
