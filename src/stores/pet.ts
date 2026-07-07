import { defineStore } from "pinia";
import {
  EGG_OPTIONS,
  EVOLUTION_STAGES,
  FEED_ITEMS,
  getEggOption,
  getDateKey,
  getEvolutionProgress,
  getEvolutionStage,
  getNextEvolutionStage,
  type EggId,
  type FeedItem,
  type PetProgress,
  type StudyInput,
} from "@/domain/pet";
import { petApi } from "@/services/pet-api";

interface PetStoreState {
  progress: PetProgress | null;
  lastReward: number;
  lastMessage: string;
  loading: boolean;
}

export const usePetStore = defineStore("pet", {
  state: (): PetStoreState => ({
    progress: null,
    lastReward: 0,
    lastMessage: "",
    loading: false,
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
      const dateKey = getDateKey();
      return state.progress
        ? state.progress.studyLogs
            .filter((log) => log.dateKey === dateKey)
            .reduce((total, log) => total + log.minutes, 0)
        : 0;
    },
    checkedSubjectsToday(state) {
      const dateKey = getDateKey();
      const checkedSubjects = state.progress
        ? state.progress.studyLogs.filter((log) => log.dateKey === dateKey).map((log) => log.subject)
        : [];
      return Array.from(new Set(checkedSubjects));
    },
    recentStudyLogs(state) {
      return state.progress ? state.progress.studyLogs.slice(0, 8) : [];
    },
  },
  actions: {
    async hydrate() {
      this.loading = true;
      try {
        this.progress = await petApi.getProgress();
      } catch (error) {
        this.lastMessage = error instanceof Error ? error.message : "学习档案同步失败";
        uni.showToast({ title: this.lastMessage, icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    async chooseEgg(eggId: EggId) {
      this.loading = true;
      try {
        const progress = await petApi.chooseEgg(eggId);
        this.progress = progress;
        this.lastMessage = `${progress.petName} 正在等待你的第一天学习打卡`;
      } finally {
        this.loading = false;
      }
    },
    async checkIn(input: StudyInput) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      this.loading = true;
      try {
        const result = await petApi.recordCheckIn(input);
        this.progress = result.progress;
        this.lastReward = result.reward;
        this.lastMessage = `学习完成，获得 ${result.reward} 积分`;
        return result;
      } finally {
        this.loading = false;
      }
    },
    async feed(itemId: FeedItem["id"]) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      this.loading = true;
      try {
        const result = await petApi.feed(itemId);
        this.progress = result.progress;
        this.lastMessage = result.evolved
          ? `${this.progress.petName} 进化到${result.stage.name}`
          : `${result.item.name} 已喂给 ${this.progress.petName}`;
        return result;
      } finally {
        this.loading = false;
      }
    },
    async resetProgress() {
      this.loading = true;
      try {
        this.progress = await petApi.resetProgress();
        this.lastReward = 0;
        this.lastMessage = "";
      } finally {
        this.loading = false;
      }
    },
    clearState() {
      this.progress = null;
      this.lastReward = 0;
      this.lastMessage = "";
      this.loading = false;
    },
    uploadStudyPhoto(tempFilePath: string) {
      return petApi.uploadStudyPhoto(tempFilePath);
    },
  },
});

export { EGG_OPTIONS, EVOLUTION_STAGES, FEED_ITEMS };
