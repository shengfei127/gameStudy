import { describe, expect, test } from "vitest";
import {
  calculateStudyReward,
  createInitialProgress,
  feedPet,
  getEvolutionStage,
  recordStudySession,
} from "./pet";

describe("pet study growth rules", () => {
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
