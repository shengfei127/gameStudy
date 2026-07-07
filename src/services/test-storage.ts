import type { StorageAdapter } from "./pet-api";

export function createMemoryStorage(): StorageAdapter {
  const storage = new Map<string, unknown>();

  return {
    get<T>(key: string) {
      return storage.get(key) as T | undefined;
    },
    set(key: string, value: unknown) {
      storage.set(key, value);
    },
    remove(key) {
      storage.delete(key);
    },
  };
}
