import { describe, expect, test } from "vitest";
import { getEvolutionStage } from "@/domain/pet";
import { AUTH_SESSION_STORAGE_KEY } from "./auth-api";
import { createLocalPetApi, createLocalProxyPetApi } from "./pet-api";
import { createMemoryStorage } from "./test-storage";

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

    expect(result.reward).toBe(30);
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
    await api.recordCheckIn({
      subject: "数学",
      minutes: 60,
      focusLevel: 1,
      photoPath: "cloud://study/math.jpg",
    });
    const result = await api.feed("focus_biscuit");

    expect(result.item.name).toBe("专注能量块");
    expect(result.progress.growth).toBe(88);
    expect(result.evolved).toBe(true);
    expect(result.stage.id).toBe(getEvolutionStage(result.progress.growth).id);
  });

  test("buys and equips collection items through the local api", async () => {
    const api = createLocalPetApi({
      storage: createMemoryStorage(),
      now: () => new Date("2026-07-06T08:00:00"),
    });

    await api.chooseEgg("windfire");
    await api.recordCheckIn({
      subject: "英语",
      minutes: 60,
      focusLevel: 3,
      photoPath: "cloud://study/english.jpg",
    });
    await api.recordCheckIn({
      subject: "数学",
      minutes: 60,
      focusLevel: 1,
      photoPath: "cloud://study/math.jpg",
    });
    await api.recordCheckIn({
      subject: "语文",
      minutes: 60,
      focusLevel: 2,
      photoPath: "cloud://study/chinese.jpg",
    });
    const bought = await api.buyShopItem("focus_lamp");
    const equipped = await api.equipShopItem("focus_lamp");

    expect(bought.item.name).toBe("专注台灯");
    expect(bought.progress.points).toBe(10);
    expect(equipped.item.slot).toBe("lamp");
    expect(equipped.progress.equippedItems.lamp).toBe("focus_lamp");
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

  test("uses the logged-in auth token for proxied pet progress", async () => {
    const requests: Array<{ body: unknown }> = [];
    const storage = createMemoryStorage();
    storage.set(AUTH_SESSION_STORAGE_KEY, {
      token: "token-abc",
      userId: "user-abc",
      username: "studentabc",
    });
    const api = createLocalProxyPetApi({
      storage,
      baseUrl: "/api/study-pet",
      fetcher: async (_url, init) => {
        requests.push({
          body: JSON.parse(String(init?.body || "{}")),
        });

        return new Response(JSON.stringify({ success: true, data: null }));
      },
    });

    await api.getProgress();

    expect(requests[0].body).toEqual({
      action: "getProgress",
      payload: {
        authToken: "token-abc",
      },
    });
  });

  test("posts shop actions through the local proxy adapter", async () => {
    const requests: Array<{ body: unknown }> = [];
    const api = createLocalProxyPetApi({
      storage: createMemoryStorage(),
      baseUrl: "/api/study-pet",
      fetcher: async (_url, init) => {
        requests.push({
          body: JSON.parse(String(init?.body || "{}")),
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              item: { id: "focus_lamp", name: "专注台灯", slot: "lamp" },
              progress: {
                eggId: "windfire",
                petName: "风火童子",
                points: 52,
                growth: 0,
                streak: 1,
                totalStudyMinutes: 60,
                lastStudyDateKey: "2026-07-06",
                studyLogs: [],
                feedLogs: [],
                ownedItemIds: ["focus_lamp"],
                equippedItems: { lamp: "focus_lamp" },
              },
            },
          }),
        );
      },
    });

    await api.buyShopItem("focus_lamp");
    await api.equipShopItem("focus_lamp");

    expect(requests.map((request) => request.body)).toEqual([
      expect.objectContaining({
        action: "buyShopItem",
        payload: expect.objectContaining({ itemId: "focus_lamp" }),
      }),
      expect.objectContaining({
        action: "equipShopItem",
        payload: expect.objectContaining({ itemId: "focus_lamp" }),
      }),
    ]);
  });
});
