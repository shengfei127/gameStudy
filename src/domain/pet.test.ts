import { describe, expect, test } from "vitest";
import {
  EGG_OPTIONS,
  calculateStudyReward,
  createInitialProgress,
  feedPet,
  getPetAssetPath,
  getEvolutionStage,
  recordStudySession,
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
    ];

    expect(EGG_OPTIONS.length).toBeGreaterThanOrEqual(16);
    expect(requiredIds.every((id) => EGG_OPTIONS.some((egg) => egg.id === id))).toBe(true);
    expect(EGG_OPTIONS.every((egg) => egg.adultName && egg.archetype && egg.iconLabel)).toBe(true);
  });

  test("resolves stable project asset paths for realistic pet art", () => {
    expect(getPetAssetPath("windfire", "adult")).toBe("/static/pets/windfire-adult.webp");
    expect(getPetAssetPath("zodiac_dragon", "egg")).toBe("/static/pets/zodiac_dragon-egg.webp");
  });

  test("rewards focused study by minutes and focus level", () => {
    expect(calculateStudyReward({ minutes: 25, focusLevel: 3 })).toBe(62);
    expect(calculateStudyReward({ minutes: 10, focusLevel: 1 })).toBe(20);
  });

  test("records study sessions and starts a daily streak once per day", () => {
    const progress = createInitialProgress("aurora");
    const result = recordStudySession(
      progress,
      { subject: "数学", minutes: 30, focusLevel: 2, note: "完成错题整理" },
      new Date("2026-07-06T08:00:00"),
    );

    expect(result.progress.points).toBe(65);
    expect(result.progress.streak).toBe(1);
    expect(result.progress.totalStudyMinutes).toBe(30);
    expect(result.progress.studyLogs).toHaveLength(1);
  });

  test("keeps same-day check-ins from increasing the streak twice", () => {
    const first = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "英语", minutes: 20, focusLevel: 2 },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const second = recordStudySession(
      first,
      { subject: "英语", minutes: 20, focusLevel: 2 },
      new Date("2026-07-06T20:00:00"),
    ).progress;

    expect(second.streak).toBe(1);
    expect(second.studyLogs).toHaveLength(2);
  });

  test("increments streak on consecutive study days", () => {
    const dayOne = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "语文", minutes: 20, focusLevel: 2 },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const dayTwo = recordStudySession(
      dayOne,
      { subject: "语文", minutes: 25, focusLevel: 3 },
      new Date("2026-07-07T08:00:00"),
    ).progress;

    expect(dayTwo.streak).toBe(2);
  });

  test("feeding spends points, grows the pet, and unlocks evolution stages", () => {
    const studied = recordStudySession(
      createInitialProgress("aurora"),
      { subject: "科学", minutes: 60, focusLevel: 3 },
      new Date("2026-07-06T08:00:00"),
    ).progress;
    const fed = feedPet(studied, "focus_biscuit").progress;

    expect(fed.points).toBe(72);
    expect(fed.growth).toBe(88);
    expect(getEvolutionStage(fed.growth).id).toBe("hatchling");
  });
});
