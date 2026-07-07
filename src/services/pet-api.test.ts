import { describe, expect, test } from "vitest";
import { getEvolutionStage } from "@/domain/pet";
import { createLocalPetApi, createLocalProxyPetApi, type StorageAdapter } from "./pet-api";

function createMemoryStorage(): StorageAdapter {
  const storage = new Map<string, unknown>();

  return {
    get<T>(key: string) {
      return storage.get(key) as T | undefined;
    },
    set(key: string, value: unknown) {
      storage.set(key, value);
    },
    remove(key: string) {
      storage.delete(key);
    },
  };
}

describe("pet api local adapter", () => {
  test("chooses an egg and persists progress through the api boundary", async () => {
    const api = createLocalPetApi({ storage: createMemoryStorage() });

    const progress = await api.chooseEgg("windfire");
    const cached = await api.getProgress();

    expect(progress.eggId).toBe("windfire");
    expect(progress.petName).toBe("风火童子");
    expect(cached?.eggId).toBe("windfire");
  });

  test("records photo-backed check-ins and blocks duplicate subjects per day", async () => {
    const api = createLocalPetApi({
      storage: createMemoryStorage(),
      now: () => new Date("2026-07-06T08:00:00"),
    });

    await api.chooseEgg("windfire");
    const result = await api.recordCheckIn({
      subject: "数学",
      minutes: 25,
      focusLevel: 2,
      photoPath: "cloud://study/math.jpg",
    });

    expect(result.reward).toBe(55);
    expect(result.progress.studyLogs[0].photoPath).toBe("cloud://study/math.jpg");
    await expect(
      api.recordCheckIn({
        subject: "数学",
        minutes: 15,
        focusLevel: 2,
        photoPath: "cloud://study/math-again.jpg",
      }),
    ).rejects.toThrow("今天数学已经打卡过了");
  });

  test("feeds through the api and returns evolution metadata", async () => {
    const api = createLocalPetApi({
      storage: createMemoryStorage(),
      now: () => new Date("2026-07-06T08:00:00"),
    });

    await api.chooseEgg("windfire");
    await api.recordCheckIn({
      subject: "语文",
      minutes: 60,
      focusLevel: 3,
      photoPath: "cloud://study/chinese.jpg",
    });
    const result = await api.feed("focus_biscuit");

    expect(result.item.name).toBe("专注能量块");
    expect(result.progress.growth).toBe(88);
    expect(result.evolved).toBe(true);
    expect(result.stage.id).toBe(getEvolutionStage(result.progress.growth).id);
  });

  test("posts cloud-style requests through the local proxy adapter", async () => {
    const requests: Array<{ url: string; body: unknown }> = [];
    const api = createLocalProxyPetApi({
      storage: createMemoryStorage(),
      baseUrl: "/api/study-pet",
      fetcher: async (url, init) => {
        requests.push({
          url: String(url),
          body: JSON.parse(String(init?.body || "{}")),
        });

        return new Response(JSON.stringify({ success: true, data: null }));
      },
    });

    await api.resetProgress();

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("/api/study-pet");
    expect(requests[0].body).toMatchObject({
      action: "resetProgress",
      payload: {
        clientId: expect.stringMatching(/^anon-/),
      },
    });
  });
});
