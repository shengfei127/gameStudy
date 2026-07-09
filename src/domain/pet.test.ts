import { describe, expect, test } from "vitest";
import {
  EGG_OPTIONS,
  SHOP_ITEMS,
  buyShopItem,
  calculateStudyReward,
  createInitialProgress,
  equipShopItem,
  feedPet,
  getEquippedShopItems,
  getPetAssetPath,
  getPetEggCutoutPath,
  getPetStageAssetPath,
  getShopItemAssetPath,
  getEvolutionStage,
  normalizePetProgress,
  recordStudySession,
  type ShopItemId,
} from "./pet";

describe("pet study growth rules", () => {
  test("offers zodiac and myth-inspired eggs with adult previews", () => {
    const requiredIds = [
      "zodiac_rat",
      "zodiac_ox",
      "zodiac_tiger",
      "zodiac_rabbit",
      "zodiac_dragon",
      "zodiac_snake",
      "zodiac_horse",
      "zodiac_goat",
      "zodiac_monkey",
      "zodiac_rooster",
      "zodiac_dog",
      "zodiac_pig",
      "windfire",
      "crimson_phoenix",
      "ruby_kirin",
      "violet_fox",
      "nebula_deer",
    ];

    expect(EGG_OPTIONS.length).toBeGreaterThanOrEqual(16);
    expect(requiredIds.every((id) => EGG_OPTIONS.some((egg) => egg.id === id))).toBe(true);
    expect(EGG_OPTIONS.every((egg) => egg.adultName && egg.archetype && egg.iconLabel)).toBe(true);
  });

  test("resolves stable project asset paths for realistic pet art", () => {
    expect(getPetAssetPath("windfire", "adult")).toBe("/static/pets/windfire-adult.webp");
    expect(getPetAssetPath("zodiac_dragon", "egg")).toBe("/static/pets/zodiac_dragon-egg.webp");
    expect(getPetEggCutoutPath("windfire")).toBe("/static/pets/windfire-egg-cutout.webp");
    expect(getPetStageAssetPath("zodiac_dragon", "hatchling")).toBe("/static/pets/zodiac_dragon-hatchling.webp");
    expect(getPetStageAssetPath("zodiac_dragon", "student")).toBe("/static/pets/zodiac_dragon-student.webp");
    expect(getPetStageAssetPath("zodiac_dragon", "scholar")).toBe("/static/pets/zodiac_dragon-scholar.webp");
    expect(getPetStageAssetPath("zodiac_dragon", "guardian")).toBe("/static/pets/zodiac_dragon-adult.webp");
  });

  test("rewards every check-in with a fixed 30 points", () => {
    expect(calculateStudyReward({ minutes: 25, focusLevel: 3 })).toBe(30);
    expect(calculateStudyReward({ minutes: 10, focusLevel: 1 })).toBe(30);
  });

  test("records study sessions and starts a daily streak once per day", () => {
    const progress = createInitialProgress("aurora");
    const result = recordStudySession(
      progress,
      { subject: "数学", minutes: 30, focusLevel: 2, photoPath: "/tmp/math.jpg", note: "完成错题整理" },
      new Date("2026-07-06T08:00:00"),
    );

    expect(result.progress.points).toBe(30);
    expect(result.progress.streak).toBe(1);
    expect(result.progress.totalStudyMinutes).toBe(30);
    expect(result.progress.studyLogs).toHaveLength(1);
  });

  test("keeps same-day check-ins from increasing the streak twice", () => {
    const first = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "英语", minutes: 20, focusLevel: 2, photoPath: "/tmp/english-a.jpg" },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const second = recordStudySession(
      first,
      { subject: "数学", minutes: 20, focusLevel: 2, photoPath: "/tmp/math.jpg" },
      new Date("2026-07-06T20:00:00"),
    ).progress;

    expect(second.streak).toBe(1);
    expect(second.studyLogs).toHaveLength(2);
  });

  test("rejects a second check-in for the same subject on the same day", () => {
    const first = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "数学", minutes: 25, focusLevel: 2, photoPath: "/tmp/math-a.jpg" },
      new Date("2026-07-06T08:00:00"),
    ).progress;

    expect(() =>
      recordStudySession(
        first,
        { subject: "数学", minutes: 30, focusLevel: 2, photoPath: "/tmp/math-b.jpg" },
        new Date("2026-07-06T20:00:00"),
      ),
    ).toThrow("今天数学已经打卡过了");
  });

  test("increments streak on consecutive study days", () => {
    const dayOne = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "语文", minutes: 20, focusLevel: 2, photoPath: "/tmp/chinese-a.jpg" },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const dayTwo = recordStudySession(
      dayOne,
      { subject: "语文", minutes: 25, focusLevel: 3, photoPath: "/tmp/chinese-b.jpg" },
      new Date("2026-07-07T08:00:00"),
    ).progress;

    expect(dayTwo.streak).toBe(2);
  });

  test("feeding spends points, grows the pet, and unlocks evolution stages", () => {
    const firstStudy = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "科学", minutes: 60, focusLevel: 3, photoPath: "/tmp/science.jpg" },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const studied = recordStudySession(
      firstStudy,
      { subject: "英语", minutes: 60, focusLevel: 1, photoPath: "/tmp/english.jpg" },
      new Date("2026-07-06T20:00:00"),
    ).progress;
    const fed = feedPet(studied, "focus_biscuit").progress;

    expect(fed.points).toBe(0);
    expect(fed.growth).toBe(88);
    expect(getEvolutionStage(fed.growth).id).toBe("hatchling");
  });

  test("requires a study photo for check-in records", () => {
    expect(() =>
      recordStudySession(createInitialProgress("aurora"), {
        subject: "数学",
        minutes: 25,
        focusLevel: 2,
        photoPath: "",
      }),
    ).toThrow("请上传学习打卡照片");
  });

  test("starts every new pet with an empty collection and equipment set", () => {
    const progress = createInitialProgress("windfire");

    expect(progress.ownedItemIds).toEqual([]);
    expect(progress.equippedItems).toEqual({});
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(28);
    expect(getShopItemAssetPath("focus_lamp")).toBe("/static/shop-items/focus_lamp.webp");
  });

  test("adds red and purple shop items for outfit and room collections", () => {
    const addedItems: ShopItemId[] = [
      "crimson_focus_band",
      "ruby_wing_cape",
      "violet_quill",
      "nebula_orbit",
      "ruby_study_wall",
      "crimson_lantern",
      "violet_window",
      "amethyst_floor",
    ];
    const addedItemSet: ReadonlySet<ShopItemId> = new Set(addedItems);

    expect(SHOP_ITEMS.filter((item) => addedItemSet.has(item.id)).map((item) => item.id)).toEqual(addedItems);
    expect(SHOP_ITEMS.filter((item) => addedItemSet.has(item.id) && item.category === "outfit")).toHaveLength(4);
    expect(SHOP_ITEMS.filter((item) => addedItemSet.has(item.id) && item.category === "room")).toHaveLength(4);
    expect(getShopItemAssetPath("ruby_study_wall")).toBe("/static/shop-items/ruby_study_wall.webp");
  });

  test("buys a shop item by spending points and adding it to the collection", () => {
    const progress = { ...createInitialProgress("windfire"), points: 120 };
    const result = buyShopItem(progress, "focus_lamp");

    expect(result.item.name).toBe("专注台灯");
    expect(result.progress.points).toBe(40);
    expect(result.progress.ownedItemIds).toEqual(["focus_lamp"]);
  });

  test("rejects duplicate purchases and insufficient points", () => {
    const owned = buyShopItem({ ...createInitialProgress("windfire"), points: 200 }, "focus_lamp").progress;

    expect(() => buyShopItem(owned, "focus_lamp")).toThrow("已经拥有专注台灯");
    expect(() => buyShopItem({ ...createInitialProgress("windfire"), points: 20 }, "focus_lamp")).toThrow(
      "积分不足，无法购买专注台灯",
    );
  });

  test("equips only owned items and replaces items in the same slot", () => {
    const progress = {
      ...createInitialProgress("windfire"),
      points: 400,
    };
    const withLamp = buyShopItem(progress, "focus_lamp").progress;
    const equippedLamp = equipShopItem(withLamp, "focus_lamp").progress;
    const withMoonWindow = buyShopItem(equippedLamp, "moon_window").progress;
    const equippedMoonWindow = equipShopItem(withMoonWindow, "moon_window").progress;
    const withSunriseWindow = buyShopItem(equippedMoonWindow, "sunrise_window").progress;
    const equippedSunriseWindow = equipShopItem(withSunriseWindow, "sunrise_window").progress;

    expect(() => equipShopItem(progress, "focus_lamp")).toThrow("请先拥有专注台灯");
    expect(equippedLamp.equippedItems.lamp).toBe("focus_lamp");
    expect(equippedSunriseWindow.equippedItems.window).toBe("sunrise_window");
    expect(getEquippedShopItems(equippedSunriseWindow).map((item) => item.id)).toContain("focus_lamp");
    expect(getEquippedShopItems(equippedSunriseWindow).map((item) => item.id)).not.toContain("moon_window");
  });

  test("normalizes old progress records without collection fields", () => {
    const oldProgress = {
      ...createInitialProgress("windfire"),
      ownedItemIds: undefined,
      equippedItems: undefined,
    };

    expect(normalizePetProgress(oldProgress).ownedItemIds).toEqual([]);
    expect(normalizePetProgress(oldProgress).equippedItems).toEqual({});
  });
});
