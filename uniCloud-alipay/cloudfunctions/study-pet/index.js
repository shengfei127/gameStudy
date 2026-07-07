"use strict";

const crypto = require("crypto");
const db = uniCloud.database();
const progressCollection = db.collection("study_pet_progress");
const usersCollection = db.collection("study_pet_users");

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

const SHOP_ITEMS = [
  {
    id: "flame_headband",
    category: "outfit",
    slot: "head",
    name: "风火额饰",
    shortName: "额饰",
    cost: 60,
    rarity: "common",
    theme: "#ef4444",
    accent: "#f97316",
    description: "适合冲刺日佩戴，给伙伴增加醒目的行动感。",
  },
  {
    id: "scholar_crown",
    category: "outfit",
    slot: "head",
    name: "星辰冠",
    shortName: "星冠",
    cost: 120,
    rarity: "rare",
    theme: "#4f46e5",
    accent: "#facc15",
    description: "完成阶段复盘后很有仪式感的进阶头饰。",
  },
  {
    id: "cloud_cape",
    category: "outfit",
    slot: "back",
    name: "云纹披风",
    shortName: "披风",
    cost: 160,
    rarity: "rare",
    theme: "#0891b2",
    accent: "#67e8f9",
    description: "让伙伴的守护形态更稳、更有气场。",
  },
  {
    id: "book_pack",
    category: "outfit",
    slot: "back",
    name: "书卷背包",
    shortName: "书包",
    cost: 90,
    rarity: "common",
    theme: "#7c2d12",
    accent: "#fdba74",
    description: "日常学习感最强的收集件，适合基础打卡阶段。",
  },
  {
    id: "ink_brush",
    category: "outfit",
    slot: "hand",
    name: "状元笔",
    shortName: "状元笔",
    cost: 80,
    rarity: "common",
    theme: "#1f2937",
    accent: "#94a3b8",
    description: "语文和错题整理日的经典装备。",
  },
  {
    id: "focus_staff",
    category: "outfit",
    slot: "hand",
    name: "专注法杖",
    shortName: "法杖",
    cost: 180,
    rarity: "epic",
    theme: "#2563eb",
    accent: "#38bdf8",
    description: "高专注打卡后的目标装备，强化伙伴的能量表现。",
  },
  {
    id: "morning_aura",
    category: "outfit",
    slot: "aura",
    name: "晨读光环",
    shortName: "晨光",
    cost: 140,
    rarity: "rare",
    theme: "#d97706",
    accent: "#fde68a",
    description: "适合每天早读坚持后的温暖光效。",
  },
  {
    id: "perfect_aura",
    category: "outfit",
    slot: "aura",
    name: "满分光环",
    shortName: "满分",
    cost: 260,
    rarity: "epic",
    theme: "#be123c",
    accent: "#fda4af",
    description: "高价值收藏，代表一次又一次自觉完成。",
  },
  {
    id: "spark_effect",
    category: "outfit",
    slot: "effect",
    name: "星火粒子",
    shortName: "星火",
    cost: 110,
    rarity: "rare",
    theme: "#7c3aed",
    accent: "#c4b5fd",
    description: "让伙伴周围出现更积极的完成反馈。",
  },
  {
    id: "cloud_effect",
    category: "outfit",
    slot: "effect",
    name: "云雾环绕",
    shortName: "云雾",
    cost: 150,
    rarity: "rare",
    theme: "#0f766e",
    accent: "#99f6e4",
    description: "低调但高级的陪伴特效，适合长期坚持型学生。",
  },
  {
    id: "forest_wall",
    category: "room",
    slot: "wall",
    name: "森林书屋",
    shortName: "森林墙",
    cost: 120,
    rarity: "rare",
    theme: "#166534",
    accent: "#86efac",
    description: "把伙伴房间变成清新的自习角。",
  },
  {
    id: "dragon_wall",
    category: "room",
    slot: "wall",
    name: "龙宫书阁",
    shortName: "龙宫墙",
    cost: 220,
    rarity: "epic",
    theme: "#0e7490",
    accent: "#67e8f9",
    description: "更震撼的背景主题，适合高阶伙伴。",
  },
  {
    id: "moon_window",
    category: "room",
    slot: "window",
    name: "月夜窗台",
    shortName: "月窗",
    cost: 160,
    rarity: "rare",
    theme: "#4338ca",
    accent: "#c4b5fd",
    description: "给夜间复盘和阅读一个安静窗口。",
  },
  {
    id: "sunrise_window",
    category: "room",
    slot: "window",
    name: "晨光窗景",
    shortName: "晨窗",
    cost: 120,
    rarity: "common",
    theme: "#ea580c",
    accent: "#fed7aa",
    description: "适合早起打卡的明亮房间件。",
  },
  {
    id: "oak_desk",
    category: "room",
    slot: "desk",
    name: "橡木学习桌",
    shortName: "橡木桌",
    cost: 100,
    rarity: "common",
    theme: "#92400e",
    accent: "#fcd34d",
    description: "房间核心家具，让学习目标更有落点。",
  },
  {
    id: "focus_lamp",
    category: "room",
    slot: "lamp",
    name: "专注台灯",
    shortName: "台灯",
    cost: 80,
    rarity: "common",
    theme: "#ca8a04",
    accent: "#fef08a",
    description: "低价但关键的第一件房间装饰。",
  },
  {
    id: "trophy_shelf",
    category: "room",
    slot: "decor",
    name: "奖杯架",
    shortName: "奖杯",
    cost: 180,
    rarity: "epic",
    theme: "#b45309",
    accent: "#fde68a",
    description: "把连续坚持的成就感摆出来。",
  },
  {
    id: "tomato_clock",
    category: "room",
    slot: "decor",
    name: "番茄钟",
    shortName: "番茄钟",
    cost: 70,
    rarity: "common",
    theme: "#dc2626",
    accent: "#fecaca",
    description: "适合短时高频学习打卡的房间小物。",
  },
  {
    id: "star_floor",
    category: "room",
    slot: "floor",
    name: "星空地毯",
    shortName: "星毯",
    cost: 140,
    rarity: "rare",
    theme: "#312e81",
    accent: "#a5b4fc",
    description: "让伙伴舞台底座更有收藏感。",
  },
  {
    id: "cloud_floor",
    category: "room",
    slot: "floor",
    name: "云纹地板",
    shortName: "云地板",
    cost: 130,
    rarity: "rare",
    theme: "#0f766e",
    accent: "#99f6e4",
    description: "柔和干净的房间地面主题。",
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

    if (action === "register") {
      return ok(await register(payload));
    }

    if (action === "login") {
      return ok(await login(payload));
    }

    if (action === "getSession") {
      return ok(await getSession(payload.token));
    }

    if (action === "logout") {
      await logout(payload.token);
      return ok(null);
    }

    const ownerKey = await resolveOwnerKey(payload);

    if (action === "getProgress") {
      return ok(await getProgress(ownerKey));
    }

    if (action === "chooseEgg") {
      return ok(await chooseEgg(ownerKey, payload.eggId));
    }

    if (action === "checkIn") {
      return ok(await checkIn(ownerKey, payload.input));
    }

    if (action === "feed") {
      return ok(await feed(ownerKey, payload.itemId));
    }

    if (action === "buyShopItem") {
      return ok(await buyShopItemForOwner(ownerKey, payload.itemId));
    }

    if (action === "equipShopItem") {
      return ok(await equipShopItemForOwner(ownerKey, payload.itemId));
    }

    if (action === "resetProgress") {
      await removeProgress(ownerKey);
      return ok(null);
    }

    throw new Error(`Unsupported action: ${action}`);
  } catch (error) {
    return fail(error && error.message ? error.message : "云函数执行失败");
  }
};

async function register(payload) {
  const credentials = normalizeCredentials(payload);
  const existingUser = await getUserByUsername(credentials.usernameLower);

  if (existingUser) {
    throw new Error("用户名已存在");
  }

  const now = new Date().toISOString();
  const passwordSalt = randomToken(16);
  const token = randomToken(32);
  const result = await usersCollection.add({
    username: credentials.username,
    usernameLower: credentials.usernameLower,
    passwordSalt,
    passwordHash: hashPassword(credentials.password, passwordSalt),
    tokenHash: hashToken(token),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  });

  return {
    token,
    userId: String(result.id || ""),
    username: credentials.username,
  };
}

async function login(payload) {
  const credentials = normalizeCredentials(payload);
  const user = await getUserByUsername(credentials.usernameLower);

  if (!user || user.passwordHash !== hashPassword(credentials.password, user.passwordSalt)) {
    throw new Error("用户名或密码错误");
  }

  const token = randomToken(32);
  const now = new Date().toISOString();
  await usersCollection.doc(user._id).update({
    tokenHash: hashToken(token),
    lastLoginAt: now,
    updatedAt: now,
  });

  return createSession(user, token);
}

async function getSession(token) {
  const user = await requireUserByToken(token);
  return createSession(user, token);
}

async function logout(token) {
  const user = await getUserByToken(token);

  if (user && user._id) {
    await usersCollection.doc(user._id).update({
      tokenHash: "",
      updatedAt: new Date().toISOString(),
    });
  }
}

function createSession(user, token) {
  return {
    token,
    userId: String(user._id || ""),
    username: user.username,
  };
}

async function getProgress(clientId) {
  const record = await getProgressRecord(clientId);
  return record ? normalizePetProgress(record.progress) : null;
}

async function resolveOwnerKey(payload) {
  if (payload.authToken) {
    const user = await requireUserByToken(payload.authToken);
    return `user:${user._id}`;
  }

  return requireClientId(payload.clientId);
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

async function buyShopItemForOwner(clientId, itemId) {
  const progress = requireProgress(await getProgress(clientId));
  const result = buyShopItem(progress, itemId);
  await saveProgress(clientId, result.progress);
  return result;
}

async function equipShopItemForOwner(clientId, itemId) {
  const progress = requireProgress(await getProgress(clientId));
  const result = equipShopItem(progress, itemId);
  await saveProgress(clientId, result.progress);
  return result;
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
    ownedItemIds: [],
    equippedItems: {},
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

function buyShopItem(progress, itemId) {
  const item = getShopItem(itemId);
  const normalized = normalizePetProgress(progress);

  if (normalized.ownedItemIds.includes(item.id)) {
    throw new Error(`已经拥有${item.name}`);
  }

  if (normalized.points < item.cost) {
    throw new Error(`积分不足，无法购买${item.name}`);
  }

  return {
    item,
    progress: {
      ...normalized,
      points: normalized.points - item.cost,
      ownedItemIds: [...normalized.ownedItemIds, item.id],
    },
  };
}

function equipShopItem(progress, itemId) {
  const item = getShopItem(itemId);
  const normalized = normalizePetProgress(progress);

  if (!normalized.ownedItemIds.includes(item.id)) {
    throw new Error(`请先拥有${item.name}`);
  }

  return {
    item,
    progress: {
      ...normalized,
      equippedItems: {
        ...normalized.equippedItems,
        [item.slot]: item.id,
      },
    },
  };
}

function getShopItem(itemId) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);

  if (!item) {
    throw new Error(`Unknown shop item: ${itemId}`);
  }

  return item;
}

function normalizePetProgress(progress) {
  return {
    ...progress,
    studyLogs: Array.isArray(progress.studyLogs) ? progress.studyLogs : [],
    feedLogs: Array.isArray(progress.feedLogs) ? progress.feedLogs : [],
    ownedItemIds: Array.isArray(progress.ownedItemIds) ? progress.ownedItemIds : [],
    equippedItems:
      progress.equippedItems && typeof progress.equippedItems === "object" && !Array.isArray(progress.equippedItems)
        ? progress.equippedItems
        : {},
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
  const normalized = normalizePetProgress(progress);

  if (record && record._id) {
    await progressCollection.doc(record._id).update({
      progress: normalized,
      updatedAt: now,
    });
    return;
  }

  await progressCollection.add({
    clientId,
    progress: normalized,
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

function normalizeCredentials(payload) {
  const username = String((payload && payload.username) || "").trim();
  const password = String((payload && payload.password) || "");

  if (username.length < 3 || username.length > 20) {
    throw new Error("用户名需为3-20个字符");
  }

  if (/\s/.test(username)) {
    throw new Error("用户名不能包含空格");
  }

  if (password.length < 6 || password.length > 32) {
    throw new Error("密码需为6-32个字符");
  }

  return {
    username,
    usernameLower: username.toLowerCase(),
    password,
  };
}

async function getUserByUsername(usernameLower) {
  const result = await usersCollection.where({ usernameLower }).limit(1).get();
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

async function getUserByToken(token) {
  const cleanToken = String(token || "").trim();

  if (!cleanToken) {
    return null;
  }

  const result = await usersCollection.where({ tokenHash: hashToken(cleanToken) }).limit(1).get();
  return result.data && result.data.length > 0 ? result.data[0] : null;
}

async function requireUserByToken(token) {
  const user = await getUserByToken(token);

  if (!user) {
    throw new Error("登录状态已失效，请重新登录");
  }

  return user;
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function randomToken(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
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
