import { defineStore } from "pinia";
import {
  EGG_OPTIONS,
  EVOLUTION_STAGES,
  FEED_ITEMS,
  SHOP_ITEMS,
  getEggOption,
  getDateKey,
  getEquippedShopItems,
  getEvolutionProgress,
  getEvolutionStage,
  getNextEvolutionStage,
  getOwnedShopItems,
  normalizePetProgress,
  type EggId,
  type FeedItem,
  type PetProgress,
  type ShopItem,
  type ShopItemId,
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
    ownedShopItems(state) {
      return state.progress ? getOwnedShopItems(state.progress) : [];
    },
    equippedShopItems(state) {
      return state.progress ? getEquippedShopItems(state.progress) : [];
    },
    collectionCount(state) {
      return state.progress ? normalizePetProgress(state.progress).ownedItemIds.length : 0;
    },
    outfitCollectionCount(state) {
      return state.progress
        ? normalizePetProgress(state.progress).ownedItemIds.filter((itemId) => getOwnedCategory(itemId) === "outfit").length
        : 0;
    },
    roomCollectionCount(state) {
      return state.progress
        ? normalizePetProgress(state.progress).ownedItemIds.filter((itemId) => getOwnedCategory(itemId) === "room").length
        : 0;
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
    async buyShopItem(itemId: ShopItemId) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      this.loading = true;
      try {
        const result = await petApi.buyShopItem(itemId);
        this.progress = result.progress;
        this.lastMessage = `已收集 ${result.item.name}`;
        return result;
      } finally {
        this.loading = false;
      }
    },
    async equipShopItem(itemId: ShopItemId) {
      if (!this.progress) {
        throw new Error("请先选择一颗宠物蛋");
      }

      this.loading = true;
      try {
        const result = await petApi.equipShopItem(itemId);
        this.progress = result.progress;
        this.lastMessage = `${result.item.name} 已应用`;
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

function getOwnedCategory(itemId: ShopItemId): ShopItem["category"] | "" {
  return SHOP_ITEMS.find((item) => item.id === itemId)?.category || "";
}

export { EGG_OPTIONS, EVOLUTION_STAGES, FEED_ITEMS, SHOP_ITEMS };
