import { describe, expect, test } from "vitest";
import { createMemoryStorage } from "./test-storage";
import { getAccountAvatarPath, saveAccountAvatarPath } from "./profile-avatar";

describe("profile avatar storage", () => {
  test("keeps the default avatar empty until the account saves an image", () => {
    const storage = createMemoryStorage();

    expect(getAccountAvatarPath(storage, "user-001")).toBe("");
  });

  test("stores avatar images per account", () => {
    const storage = createMemoryStorage();

    saveAccountAvatarPath(storage, "user-001", "file:///avatar-a.jpg");
    saveAccountAvatarPath(storage, "user-002", "file:///avatar-b.jpg");

    expect(getAccountAvatarPath(storage, "user-001")).toBe("file:///avatar-a.jpg");
    expect(getAccountAvatarPath(storage, "user-002")).toBe("file:///avatar-b.jpg");
  });

  test("normalizes blank account and image values to the default avatar", () => {
    const storage = createMemoryStorage();

    saveAccountAvatarPath(storage, "", "file:///avatar-a.jpg");
    saveAccountAvatarPath(storage, "user-001", "   ");

    expect(getAccountAvatarPath(storage, "")).toBe("");
    expect(getAccountAvatarPath(storage, "user-001")).toBe("");
  });
});
