import { defineStore } from "pinia";
import {
  EGG_OPTIONS,
  EVOLUTION_STAGES,
  FEED_ITEMS,
  createInitialProgress,
  feedPet,
  getEggOption,
  getEvolutionProgress,
  getEvolutionStage,
  getNextEvolutionStage,
  recordStudySession,
  type EggId,
  type FeedItem,
  type PetProgress,
  type StudyInput,
} from "@/domain/pet";

const STORAGE_KEY = "study-pet-progress";

interface PetStoreState {
  progress: PetProgress | null;
  lastReward: number;
  lastMessage: string;
}

export const usePetStore = defineStore("pet", {
  state: (): PetStoreState => ({
    progress: null,
    lastReward: 0,
    lastMessage: "",
  }),
  getters: {
    egg(state) {
      return state.progress ? getEggOption(state.progress.eggId) : null;
    },
    stage(state) {
      return state.progress ? getEvolutionStage(state.progress.growth) : EVOLUTION_STAGES[0];
    },
    nextStage(state) {
      return state.progress ? getNextEvolutionStage(state.progress.growth) : EVOLUTION_STAGES[1];
    },
    evolutionPercent(state) {
      return state.progress ? getEvolutionProgress(state.progress.growth) : 0;
    },
    todayMinutes(state) {
      const today = new Date();
      const dateKey = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;
      return state.progress
        ? state.progress.studyLogs
            .filter((log) => log.dateKey === dateKey)
            .reduce((total, log) => total + log.minutes, 0)
        : 0;
    },
    recentStudyLogs(state) {
      return state.progress ? state.progress.studyLogs.slice(0, 8) : [];
    },
  },
  actions: {
    hydrate() {
      const cached = uni.getStorageSync(STORAGE_KEY) as PetProgress | "";
      if (cached && typeof cached === "object") {
        this.progress = cached;
      }
    },
    chooseEgg(eggId: EggId) {
      this.progress = createInitialProgress(eggId);
      this.lastMessage = `${this.progress.petName} 正在等待你的第一天学习打卡`;
      this.persist();
    },
    checkIn(input: StudyInput) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      const result = recordStudySession(this.progress, input);
      this.progress = result.progress;
      this.lastReward = result.reward;
      this.lastMessage = `学习完成，获得 ${result.reward} 积分`;
      this.persist();
      return result;
    },
    feed(itemId: FeedItem["id"]) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      const beforeStage = getEvolutionStage(this.progress.growth);
      const result = feedPet(this.progress, itemId);
      const afterStage = getEvolutionStage(result.progress.growth);

      this.progress = result.progress;
      this.lastMessage =
        beforeStage.id === afterStage.id
          ? `${result.item.name} 已喂给 ${this.progress.petName}`
          : `${this.progress.petName} 进化到${afterStage.name}`;
      this.persist();

      return {
        ...result,
        evolved: beforeStage.id !== afterStage.id,
        stage: afterStage,
      };
    },
    resetProgress() {
      this.progress = null;
      this.lastReward = 0;
      this.lastMessage = "";
      uni.removeStorageSync(STORAGE_KEY);
    },
    persist() {
      if (this.progress) {
        uni.setStorageSync(STORAGE_KEY, this.progress);
      }
    },
  },
});

export { EGG_OPTIONS, EVOLUTION_STAGES, FEED_ITEMS };
