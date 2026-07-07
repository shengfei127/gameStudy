import { describe, expect, test } from "vitest";
import { createLocalProxyAuthApi, type AuthSession } from "./auth-api";
import { createMemoryStorage } from "./test-storage";

describe("auth api local proxy adapter", () => {
  test("registers and logs in through cloud-style auth actions", async () => {
    const session: AuthSession = {
      token: "token-001",
      userId: "user-001",
      username: "student01",
    };
    const requests: Array<{ url: string; body: unknown }> = [];
    const api = createLocalProxyAuthApi({
      baseUrl: "/api/study-pet",
      fetcher: async (url, init) => {
        requests.push({
          url: String(url),
          body: JSON.parse(String(init?.body || "{}")),
        });

        return new Response(JSON.stringify({ success: true, data: session }));
      },
    });

    const registerResult = await api.register({ username: "student01", password: "secret123" });
    const loginResult = await api.login({ username: "student01", password: "secret123" });

    expect(registerResult).toEqual(session);
    expect(loginResult).toEqual(session);
    expect(requests.map((request) => request.body)).toEqual([
      { action: "register", payload: { username: "student01", password: "secret123" } },
      { action: "login", payload: { username: "student01", password: "secret123" } },
    ]);
  });

  test("persists and clears the current session for app startup", async () => {
    const storage = createMemoryStorage();
    const session: AuthSession = {
      token: "token-002",
      userId: "user-002",
      username: "student02",
    };
    const api = createLocalProxyAuthApi({
      storage,
      baseUrl: "/api/study-pet",
      fetcher: async () => new Response(JSON.stringify({ success: true, data: session })),
    });

    await api.saveSession(session);
    expect(await api.getCachedSession()).toEqual(session);

    await api.clearSession();
    expect(await api.getCachedSession()).toBeNull();
  });

  test("validates a cached token with the backend", async () => {
    const requests: Array<unknown> = [];
    const api = createLocalProxyAuthApi({
      baseUrl: "/api/study-pet",
      fetcher: async (_url, init) => {
        requests.push(JSON.parse(String(init?.body || "{}")));

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              token: "token-003",
              userId: "user-003",
              username: "student03",
            },
          }),
        );
      },
    });

    const session = await api.getSession("token-003");

    expect(session.username).toBe("student03");
    expect(requests[0]).toEqual({
      action: "getSession",
      payload: {
        token: "token-003",
      },
    });
  });
});
