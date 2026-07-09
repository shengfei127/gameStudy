import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, test } from "vitest";

type CollectionRecord = Record<string, unknown> & { _id: string };

interface MockDatabase {
  collections: Record<string, CollectionRecord[]>;
}

describe("study-pet cloud function auth", () => {
  test("registers, rejects duplicate usernames, and validates password login", async () => {
    const { main } = loadCloudFunction();

    const registered = await main({
      action: "register",
      payload: {
        username: "student01",
        password: "secret123",
      },
    });
    const duplicate = await main({
      action: "register",
      payload: {
        username: "student01",
        password: "secret123",
      },
    });
    const loggedIn = await main({
      action: "login",
      payload: {
        username: "student01",
        password: "secret123",
      },
    });
    const wrongPassword = await main({
      action: "login",
      payload: {
        username: "student01",
        password: "badpass",
      },
    });

    expect(registered.success).toBe(true);
    expect(registered.data).toMatchObject({
      userId: expect.any(String),
      username: "student01",
      token: expect.any(String),
    });
    expect(duplicate).toMatchObject({
      success: false,
      message: "用户名已存在",
    });
    expect(loggedIn.success).toBe(true);
    expect(loggedIn.data.username).toBe("student01");
    expect(wrongPassword).toMatchObject({
      success: false,
      message: "用户名或密码错误",
    });
  });

  test("keeps pet progress isolated by logged-in user token", async () => {
    const { main } = loadCloudFunction();
    const firstUser = await main({
      action: "register",
      payload: {
        username: "student01",
        password: "secret123",
      },
    });
    const secondUser = await main({
      action: "register",
      payload: {
        username: "student02",
        password: "secret123",
      },
    });

    await main({
      action: "chooseEgg",
      payload: {
        authToken: firstUser.data.token,
        eggId: "windfire",
      },
    });
    await main({
      action: "chooseEgg",
      payload: {
        authToken: secondUser.data.token,
        eggId: "zodiac_dragon",
      },
    });

    const firstProgress = await main({
      action: "getProgress",
      payload: {
        authToken: firstUser.data.token,
      },
    });
    const secondProgress = await main({
      action: "getProgress",
      payload: {
        authToken: secondUser.data.token,
      },
    });

    expect(firstProgress.data.eggId).toBe("windfire");
    expect(secondProgress.data.eggId).toBe("zodiac_dragon");
  });

  test("buys and equips shop items in cloud-backed progress", async () => {
    const { main } = loadCloudFunction();

    await main({
      action: "chooseEgg",
      payload: {
        clientId: "student-device",
        eggId: "windfire",
      },
    });
    await main({
      action: "checkIn",
      payload: {
        clientId: "student-device",
        input: {
          subject: "英语",
          minutes: 60,
          focusLevel: 3,
          photoPath: "cloud://study/english.jpg",
        },
      },
    });
    await main({
      action: "checkIn",
      payload: {
        clientId: "student-device",
        input: {
          subject: "数学",
          minutes: 60,
          focusLevel: 1,
          photoPath: "cloud://study/math.jpg",
        },
      },
    });
    await main({
      action: "checkIn",
      payload: {
        clientId: "student-device",
        input: {
          subject: "语文",
          minutes: 60,
          focusLevel: 2,
          photoPath: "cloud://study/chinese.jpg",
        },
      },
    });

    const bought = await main({
      action: "buyShopItem",
      payload: {
        clientId: "student-device",
        itemId: "focus_lamp",
      },
    });
    const equipped = await main({
      action: "equipShopItem",
      payload: {
        clientId: "student-device",
        itemId: "focus_lamp",
      },
    });

    expect(bought.success).toBe(true);
    expect(bought.data.item.name).toBe("专注台灯");
    expect(bought.data.progress.points).toBe(10);
    expect(equipped.success).toBe(true);
    expect(equipped.data.progress.equippedItems.lamp).toBe("focus_lamp");
  });

  test("buys newly added shop items in cloud-backed progress", async () => {
    const { main } = loadCloudFunction();

    await main({
      action: "chooseEgg",
      payload: {
        clientId: "new-shop-item-device",
        eggId: "windfire",
      },
    });

    for (const subject of ["english", "math", "reading", "science", "history"]) {
      await main({
        action: "checkIn",
        payload: {
          clientId: "new-shop-item-device",
          input: {
            subject,
            minutes: 30,
            focusLevel: 1,
            photoPath: `cloud://study/${subject}.jpg`,
          },
        },
      });
    }

    const bought = await main({
      action: "buyShopItem",
      payload: {
        clientId: "new-shop-item-device",
        itemId: "violet_quill",
      },
    });

    expect(bought.success).toBe(true);
    expect(bought.data.item.id).toBe("violet_quill");
    expect(bought.data.progress.ownedItemIds).toContain("violet_quill");
    expect(bought.data.progress.points).toBe(20);
  });
});

function loadCloudFunction() {
  const require = createRequire(import.meta.url);
  const functionPath = path.resolve(process.cwd(), "uniCloud-alipay/cloudfunctions/study-pet/index.js");
  const database = createMockDatabase();
  const globalWithUniCloud = globalThis as typeof globalThis & {
    uniCloud?: { database: () => ReturnType<typeof createUniCloudDatabaseMock> };
  };
  const previousUniCloud = globalWithUniCloud.uniCloud;

  globalWithUniCloud.uniCloud = {
    database: () => createUniCloudDatabaseMock(database),
  };

  try {
    delete require.cache[require.resolve(functionPath)];
    return require(functionPath) as {
      main: (event: { action: string; payload: Record<string, unknown> }) => Promise<any>;
    };
  } finally {
    if (previousUniCloud) {
      globalWithUniCloud.uniCloud = previousUniCloud;
    } else {
      delete globalWithUniCloud.uniCloud;
    }
  }
}

function createMockDatabase(): MockDatabase {
  return {
    collections: {
      study_pet_progress: [],
      study_pet_users: [],
    },
  };
}

function createUniCloudDatabaseMock(database: MockDatabase) {
  return {
    collection(name: string) {
      database.collections[name] ||= [];
      return createCollectionMock(database.collections[name]);
    },
  };
}

function createCollectionMock(records: CollectionRecord[]) {
  return {
    where(query: Record<string, unknown>) {
      return {
        limit(count: number) {
          return {
            async get() {
              return {
                data: records.filter((record) => matchesQuery(record, query)).slice(0, count),
              };
            },
          };
        },
      };
    },
    doc(id: string) {
      return {
        async update(patch: Record<string, unknown>) {
          const index = records.findIndex((record) => record._id === id);
          if (index >= 0) {
            records[index] = {
              ...records[index],
              ...patch,
            };
          }
        },
        async remove() {
          const index = records.findIndex((record) => record._id === id);
          if (index >= 0) {
            records.splice(index, 1);
          }
        },
      };
    },
    async add(record: Record<string, unknown>) {
      const id = `mock-${records.length + 1}`;
      records.push({
        _id: id,
        ...record,
      });
      return { id };
    },
  };
}

function matchesQuery(record: CollectionRecord, query: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => record[key] === value);
}
