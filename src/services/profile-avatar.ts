import type { StorageAdapter } from "./pet-api";

const ACCOUNT_AVATAR_STORAGE_PREFIX = "study-pet-account-avatar";

export function getAccountAvatarPath(storage: StorageAdapter, accountKey: string) {
  const storageKey = getAccountAvatarStorageKey(accountKey);

  if (!storageKey) {
    return "";
  }

  const value = storage.get<string | null | "">(storageKey);
  return typeof value === "string" ? value.trim() : "";
}

export function saveAccountAvatarPath(storage: StorageAdapter, accountKey: string, avatarPath: string) {
  const storageKey = getAccountAvatarStorageKey(accountKey);

  if (!storageKey) {
    return "";
  }

  const normalizedPath = avatarPath.trim();

  if (!normalizedPath) {
    storage.remove(storageKey);
    return "";
  }

  storage.set(storageKey, normalizedPath);
  return normalizedPath;
}

export function createProfileAvatarStorage(): StorageAdapter {
  return {
    get(key) {
      const value = uni.getStorageSync(key);
      return value === "" ? undefined : value;
    },
    set(key, value) {
      uni.setStorageSync(key, value);
    },
    remove(key) {
      uni.removeStorageSync(key);
    },
  };
}

function getAccountAvatarStorageKey(accountKey: string) {
  const normalizedAccountKey = accountKey.trim();
  return normalizedAccountKey ? `${ACCOUNT_AVATAR_STORAGE_PREFIX}:${normalizedAccountKey}` : "";
}
