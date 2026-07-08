import { describe, expect, test } from "vitest";
import { checkAppUpdate, compareVersionName, resolveAppUpdate } from "./app-update";

const current = {
  versionName: "0.1.0",
  versionCode: 10,
  platform: "android",
};

describe("app update checker", () => {
  test("detects an android update when remote versionCode is higher", () => {
    const result = resolveAppUpdate(current, {
      versionName: "0.2.0",
      versionCode: 20,
      platforms: ["android"],
      downloadUrl: "https://example.com/study-pet-0.2.0.apk",
      changelog: ["新增应用内更新", "优化收藏馆舞台"],
    });

    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.update.versionName).toBe("0.2.0");
      expect(result.update.versionCode).toBe(20);
      expect(result.update.downloadUrl).toBe("https://example.com/study-pet-0.2.0.apk");
      expect(result.update.notes).toEqual(["新增应用内更新", "优化收藏馆舞台"]);
    }
  });

  test("keeps the app up to date when the remote version is not newer", () => {
    expect(
      resolveAppUpdate(current, {
        versionName: "0.1.0",
        versionCode: 10,
        platforms: ["android"],
        downloadUrl: "https://example.com/study-pet-0.1.0.apk",
      }).status,
    ).toBe("up-to-date");
  });

  test("falls back to semantic version names when versionCode is absent", () => {
    expect(compareVersionName("0.10.0", "0.2.9")).toBeGreaterThan(0);
    expect(
      resolveAppUpdate(current, {
        versionName: "0.1.1",
        platforms: ["android"],
        apkUrl: "https://example.com/study-pet-0.1.1.apk",
      }).status,
    ).toBe("available");
  });

  test("does not request a manifest when the update URL is not configured", async () => {
    let requested = false;
    const result = await checkAppUpdate({
      current,
      manifestUrl: "",
      request: async () => {
        requested = true;
        throw new Error("should not request");
      },
    });

    expect(result.status).toBe("not-configured");
    expect(requested).toBe(false);
  });
});
