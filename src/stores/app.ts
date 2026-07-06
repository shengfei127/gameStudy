import { defineStore } from "pinia";

const STORAGE_KEY = "game-study-app-state";

interface AppState {
  launchCount: number;
  platform: string;
  hydrated: boolean;
}

export const useAppStore = defineStore("app", {
  state: (): AppState => ({
    launchCount: 0,
    platform: "unknown",
    hydrated: false,
  }),
  actions: {
    hydrate() {
      if (this.hydrated) {
        return;
      }

      const cached = uni.getStorageSync(STORAGE_KEY) as Partial<AppState> | "";
      if (cached && typeof cached === "object") {
        this.launchCount = Number(cached.launchCount || 0);
        this.platform = cached.platform || "unknown";
      }

      this.hydrated = true;
    },
    recordLaunch(platform: string) {
      this.launchCount += 1;
      this.platform = platform;
      this.persist();
    },
    persist() {
      uni.setStorageSync(STORAGE_KEY, {
        launchCount: this.launchCount,
        platform: this.platform,
      });
    },
  },
});
