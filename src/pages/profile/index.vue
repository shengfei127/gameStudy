<template>
  <view class="page" :style="pageStyle">
    <view v-if="!progress" class="empty">
      <view class="empty-card">
        <image class="empty-backdrop" src="/static/profile-stage/growth-archive-initial-bg.webp" mode="aspectFill" />
        <view class="empty-shade" />
        <view class="empty-orbit" />
        <view class="empty-copy">
          <text class="eyebrow">GROWTH ARCHIVE</text>
          <text class="empty-title">等待第一份成长档案</text>
          <text class="empty-text">选择一颗宠物蛋后，学习分钟、积分、进化阶段都会沉淀在这里。</text>
          <button class="primary-button" @tap="goHome">去选择伙伴</button>
        </view>
      </view>
    </view>

    <scroll-view v-else class="content" scroll-y enhanced :show-scrollbar="false">
      <view class="hero-card">
        <image class="hero-bg" src="/static/profile-stage/growth-archive-empty-stage.png" mode="aspectFill" />
        <view class="hero-scrim" />
        <view class="hero-top">
          <view>
            <text class="eyebrow">GROWTH ARCHIVE</text>
            <text class="hero-title">{{ displayName }}</text>
            <text class="hero-subtitle">{{ petStore.stage.title }} · {{ petStore.stage.name }}</text>
          </view>
          <view class="stage-token">
            <text class="stage-token-value">{{ currentStageIndex + 1 }}</text>
            <text class="stage-token-label">阶段</text>
          </view>
        </view>

        <view class="hero-avatar">
          <view class="avatar-ring" />
          <view class="archive-portrait">
            <image class="archive-pet-image" :src="archivePetSrc" mode="aspectFill" />
            <view class="archive-pet-shine" />
          </view>
          <view class="avatar-shelf" />
        </view>

        <view class="growth-panel">
          <view class="growth-line">
            <text class="growth-label">成长值 {{ progress.growth }}</text>
            <text class="growth-label">{{ nextStage ? `下一阶段 ${nextStage.threshold}` : "已完全进化" }}</text>
          </view>
          <view class="bar">
            <view class="bar-fill" :style="{ width: `${petStore.evolutionPercent}%` }" />
          </view>
        </view>
      </view>

      <view class="stats">
        <view v-for="stat in stats" :key="stat.label" class="stat">
          <text class="stat-value">{{ stat.value }}</text>
          <text class="stat-label">{{ stat.label }}</text>
        </view>
      </view>

      <view class="panel collection-panel">
        <view class="panel-head">
          <text class="panel-title">收藏装备</text>
          <text class="panel-note">{{ petStore.collectionCount }}/{{ shopItemCount }} 已收集</text>
        </view>
        <view class="equip-grid">
          <view v-for="slot in equipSlots" :key="slot.key" class="equip-item" :class="{ active: Boolean(equippedBySlot[slot.key]) }">
            <text class="equip-label">{{ slot.label }}</text>
            <text class="equip-name">{{ getEquippedName(slot.key) }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="panel-head">
          <text class="panel-title">进化路线</text>
          <text class="panel-note">{{ unlockedStageCount }}/{{ evolutionStages.length }} 已点亮</text>
        </view>
        <scroll-view class="stage-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="stage-track">
            <view
              v-for="stage in evolutionStages"
              :key="stage.id"
              class="stage-card"
              :class="{ active: progress.growth >= stage.threshold, current: petStore.stage.id === stage.id }"
            >
              <image class="stage-thumb" :src="getPetStageAssetPath(progress.eggId, stage.id)" mode="aspectFill" />
              <text class="stage-name">{{ stage.name }}</text>
              <text class="stage-threshold">{{ stage.threshold }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="panel">
        <view class="panel-head">
          <text class="panel-title">学习记录</text>
          <text class="panel-note">{{ progress.studyLogs.length }} 条</text>
        </view>
        <view v-if="progress.studyLogs.length === 0" class="empty-log">
          <text class="empty-log-title">还没有学习记录</text>
          <text class="empty-log-copy">完成一次语文、数学或英语打卡后，这里会出现第一条记录。</text>
        </view>
        <view v-for="log in progress.studyLogs.slice(0, 12)" :key="log.id" class="history-row">
          <image v-if="log.photoPath" class="history-photo" :src="log.photoPath" mode="aspectFill" />
          <view v-else class="history-photo placeholder-photo">
            <text>{{ log.subject.slice(0, 1) }}</text>
          </view>
          <view class="history-copy">
            <text class="history-title">{{ log.subject }} · {{ log.minutes }} 分钟</text>
            <text class="history-note">{{ log.note || log.dateKey }}</text>
          </view>
          <text class="history-score">+{{ log.reward }}</text>
        </view>
      </view>

      <button class="danger-button" @tap="confirmReset">重新开始</button>
      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  EVOLUTION_STAGES,
  SHOP_ITEMS,
  getEggOption,
  getPetStageAssetPath,
  getShopItem,
  type EggOption,
  type ShopItemSlot,
} from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const progress = computed(() => petStore.progress);
const evolutionStages = EVOLUTION_STAGES;
const activeEgg = computed(() => (progress.value ? getEggOption(progress.value.eggId) : null));
const archivePetSrc = computed(() => (progress.value ? getPetStageAssetPath(progress.value.eggId, petStore.stage.id) : ""));
const displayName = computed(() =>
  progress.value && activeEgg.value && petStore.stage.id === "guardian" ? activeEgg.value.adultName : progress.value?.petName,
);
const totalHours = computed(() => (progress.value ? Math.round((progress.value.totalStudyMinutes / 60) * 10) / 10 : 0));
const nextStage = computed(() => petStore.nextStage);
const currentStageIndex = computed(() => evolutionStages.findIndex((stage) => stage.id === petStore.stage.id));
const unlockedStageCount = computed(() =>
  progress.value ? evolutionStages.filter((stage) => progress.value && progress.value.growth >= stage.threshold).length : 0,
);
const stats = computed(() => [
  { label: "可用积分", value: progress.value?.points || 0 },
  { label: "成长值", value: progress.value?.growth || 0 },
  { label: "连续天数", value: progress.value?.streak || 0 },
  { label: "已收集", value: petStore.collectionCount },
]);
const pageStyle = computed(() => (activeEgg.value ? themeStyle(activeEgg.value) : ""));
const shopItemCount = SHOP_ITEMS.length;
const equippedBySlot = computed(() => progress.value?.equippedItems || {});
const equipSlots: Array<{ key: ShopItemSlot; label: string }> = [
  { key: "head", label: "头饰" },
  { key: "back", label: "背饰" },
  { key: "hand", label: "手持" },
  { key: "aura", label: "光环" },
  { key: "wall", label: "背景" },
  { key: "floor", label: "地面" },
];

function goHome() {
  uni.switchTab({ url: "/pages/home/index" });
}

function confirmReset() {
  uni.showModal({
    title: "重新开始？",
    content: "当前宠物、积分和学习记录都会清空。",
    confirmText: "清空",
    confirmColor: "#c2410c",
    async success(result) {
      if (result.confirm) {
        try {
          await petStore.resetProgress();
          uni.showToast({ title: "已重置", icon: "none" });
        } catch (error) {
          uni.showToast({ title: error instanceof Error ? error.message : "重置失败", icon: "none" });
        }
      }
    },
  });
}

function getEquippedName(slot: ShopItemSlot) {
  const itemId = equippedBySlot.value[slot];
  return itemId ? getShopItem(itemId).shortName : "未装";
}

function themeStyle(egg: EggOption) {
  return [
    `--accent:${egg.palette.accent}`,
    `--accent-rgb:${hexToRgb(egg.palette.accent)}`,
    `--ink:${egg.palette.ink}`,
    `--soft:${egg.palette.glow}`,
    `--shell:${egg.palette.shell}`,
  ].join(";");
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);

  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}
</script>

<style>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 0%, var(--soft, #f4fbf6), transparent 35%),
    linear-gradient(180deg, #f7faf8 0%, #eef5f1 100%);
}

.content {
  box-sizing: border-box;
  height: 100vh;
  padding: 24rpx 26rpx 0;
}

.empty {
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  padding: 28rpx 26rpx calc(var(--window-bottom) + 28rpx);
  background:
    radial-gradient(circle at 22% 0%, rgba(20, 184, 166, 0.12), transparent 34%),
    linear-gradient(180deg, #f6fbf8, #edf6f1);
}

.empty-card {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - var(--window-bottom) - 56rpx);
  border-radius: 34rpx;
  background: #080c12;
  box-shadow: 0 28rpx 78rpx rgba(15, 35, 48, 0.18);
}

.empty-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  filter: saturate(1.05) contrast(1.04) brightness(1);
}

.empty-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(5, 13, 14, 0.68), rgba(5, 13, 14, 0.3) 56%, rgba(5, 13, 14, 0.08)),
    linear-gradient(180deg, rgba(5, 10, 13, 0.16), rgba(5, 10, 13, 0.08) 44%, rgba(5, 10, 13, 0.34));
}

.empty-orbit {
  position: absolute;
  right: -140rpx;
  bottom: 62rpx;
  width: 560rpx;
  height: 560rpx;
  border: 2rpx solid rgba(255, 236, 184, 0.1);
  border-radius: 50%;
}

.empty-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 18rpx;
  padding: 78rpx 40rpx;
}

.eyebrow {
  color: var(--accent, #2f855a);
  font-size: 21rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.empty-title {
  color: #ffffff;
  font-size: 50rpx;
  font-weight: 900;
  line-height: 1.06;
}

.empty-text {
  max-width: 540rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 27rpx;
  font-weight: 700;
  line-height: 1.52;
}

.primary-button {
  width: 250rpx;
  height: 82rpx;
  margin-top: 20rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #ffffff, #dff7ed);
  color: #123327;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 82rpx;
}

.hero-card {
  position: relative;
  overflow: hidden;
  min-height: 590rpx;
  border-radius: 32rpx;
  padding: 28rpx;
  background: #100d0a;
  color: #ffffff;
  box-shadow: 0 28rpx 70rpx rgba(26, 21, 15, 0.24);
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  filter: saturate(1.04) contrast(1.03) brightness(0.76);
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 54% 48%, transparent 0 42%, rgba(5, 8, 12, 0.22) 76%),
    linear-gradient(180deg, rgba(5, 8, 12, 0.12), rgba(5, 8, 12, 0.72)),
    linear-gradient(90deg, rgba(5, 8, 12, 0.7), rgba(5, 8, 12, 0.12) 50%, rgba(5, 8, 12, 0.22));
}

.hero-top,
.growth-panel,
.hero-avatar {
  position: relative;
  z-index: 1;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-title {
  display: block;
  margin-top: 10rpx;
  color: #ffffff;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1.05;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 25rpx;
  font-weight: 800;
}

.stage-token {
  flex: none;
  width: 90rpx;
  height: 90rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.26);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.14);
  text-align: center;
  backdrop-filter: blur(12rpx);
}

.stage-token-value {
  display: block;
  padding-top: 12rpx;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1;
}

.stage-token-label {
  display: block;
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.66);
  font-size: 19rpx;
  font-weight: 800;
}

.hero-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350rpx;
  margin-top: -4rpx;
}

.avatar-ring {
  position: absolute;
  bottom: 18rpx;
  width: 486rpx;
  height: 248rpx;
  border: 0;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(255, 250, 218, 0.28), transparent 54%),
    radial-gradient(ellipse at 50% 82%, rgba(255, 185, 92, 0.22), transparent 70%);
  opacity: 0.72;
  filter: blur(4rpx);
}

.archive-portrait {
  position: relative;
  z-index: 2;
  overflow: hidden;
  width: 354rpx;
  height: 354rpx;
  border: 2rpx solid rgba(237, 219, 183, 0.68);
  border-radius: 34rpx;
  background:
    radial-gradient(circle at 74% 12%, rgba(255, 249, 224, 0.72), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.46), rgba(255, 255, 255, 0.13)),
    rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.74),
    inset 0 -26rpx 42rpx rgba(55, 36, 24, 0.18),
    0 24rpx 42rpx rgba(0, 0, 0, 0.28);
}

.archive-portrait::before,
.archive-portrait::after {
  position: absolute;
  content: "";
  pointer-events: none;
}

.archive-portrait::before {
  inset: 14rpx;
  z-index: 3;
  border: 1rpx solid rgba(255, 235, 188, 0.3);
  border-radius: 26rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 22%, transparent 74%, rgba(8, 11, 16, 0.18)),
    radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(9, 11, 18, 0.18) 100%);
  box-shadow:
    inset 0 0 36rpx rgba(255, 235, 188, 0.12),
    inset 0 -18rpx 28rpx rgba(8, 11, 16, 0.1);
}

.archive-portrait::after {
  top: 0;
  bottom: 0;
  left: -28%;
  z-index: 4;
  width: 56%;
  background: linear-gradient(105deg, rgba(255, 255, 255, 0.32), transparent 62%);
  opacity: 0.52;
  transform: skewX(-12deg);
}

.archive-pet-image {
  position: absolute;
  inset: 14rpx;
  z-index: 2;
  width: calc(100% - 28rpx);
  height: calc(100% - 28rpx);
  border-radius: 24rpx;
  opacity: 1;
  filter:
    saturate(1.08)
    contrast(1.04)
    brightness(0.98)
    drop-shadow(0 20rpx 24rpx rgba(0, 0, 0, 0.24));
}

.archive-pet-shine {
  position: absolute;
  top: 18rpx;
  right: 20rpx;
  z-index: 4;
  width: 138rpx;
  height: 78rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.46), transparent 66%);
  filter: blur(2rpx);
  opacity: 0.44;
  transform: rotate(-14deg);
  pointer-events: none;
}

.avatar-shelf {
  position: absolute;
  right: 148rpx;
  bottom: 8rpx;
  left: 148rpx;
  z-index: 1;
  height: 40rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(8, 11, 16, 0.28), transparent 64%),
    radial-gradient(ellipse at center, rgba(255, 226, 165, 0.24), rgba(255, 178, 78, 0.14) 42%, transparent 72%);
  filter: blur(4rpx);
  opacity: 0.86;
}

.growth-panel {
  padding: 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12rpx);
}

.growth-line,
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.growth-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 22rpx;
  font-weight: 800;
}

.bar {
  overflow: hidden;
  height: 14rpx;
  margin-top: 12rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
}

.bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffffff, var(--accent, #2f855a));
  box-shadow: 0 0 24rpx rgba(var(--accent-rgb, 47, 133, 90), 0.44);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin-top: 16rpx;
}

.stat {
  min-height: 116rpx;
  padding: 18rpx 8rpx;
  border: 1rpx solid rgba(var(--accent-rgb, 47, 133, 90), 0.2);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  box-shadow: 0 14rpx 34rpx rgba(var(--accent-rgb, 47, 133, 90), 0.08);
}

.stat-value {
  display: block;
  color: var(--ink, #203047);
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1;
}

.stat-label {
  display: block;
  margin-top: 10rpx;
  color: #66758a;
  font-size: 20rpx;
  font-weight: 800;
}

.panel {
  margin-top: 18rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(var(--accent-rgb, 47, 133, 90), 0.18);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 44rpx rgba(26, 44, 64, 0.08);
}

.panel-title {
  color: #203047;
  font-size: 30rpx;
  font-weight: 900;
}

.panel-note {
  color: #7b8797;
  font-size: 22rpx;
  font-weight: 800;
}

.stage-scroll {
  margin-top: 20rpx;
  white-space: nowrap;
}

.stage-track {
  display: flex;
  gap: 14rpx;
}

.stage-card {
  display: inline-flex;
  width: 150rpx;
  flex: none;
  flex-direction: column;
  align-items: center;
  padding: 14rpx 12rpx;
  border: 1rpx solid #e4ece6;
  border-radius: 20rpx;
  background: #f8faf9;
  opacity: 0.72;
}

.stage-card.active {
  border-color: rgba(var(--accent-rgb, 47, 133, 90), 0.36);
  background: linear-gradient(180deg, #ffffff, var(--shell, #eef7f1));
  opacity: 1;
}

.stage-card.current {
  box-shadow:
    0 14rpx 30rpx rgba(var(--accent-rgb, 47, 133, 90), 0.18),
    0 0 0 4rpx rgba(var(--accent-rgb, 47, 133, 90), 0.08);
}

.stage-thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 18rpx;
  background: #e8efe9;
  filter: grayscale(0.26);
}

.stage-card.active .stage-thumb {
  filter: none;
}

.stage-name {
  display: block;
  margin-top: 12rpx;
  color: #203047;
  font-size: 23rpx;
  font-weight: 900;
}

.stage-threshold {
  display: block;
  margin-top: 4rpx;
  color: #7b8797;
  font-size: 20rpx;
  font-weight: 800;
}

.equip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 18rpx;
}

.equip-item {
  min-height: 96rpx;
  padding: 14rpx 8rpx;
  border: 1rpx solid rgba(var(--accent-rgb, 47, 133, 90), 0.14);
  border-radius: 16rpx;
  background: #f8faf9;
  text-align: center;
}

.equip-item.active {
  background: linear-gradient(180deg, #ffffff, var(--shell, #eef7f1));
  box-shadow: inset 0 0 0 2rpx rgba(var(--accent-rgb, 47, 133, 90), 0.08);
}

.equip-label,
.equip-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equip-label {
  color: #7b8797;
  font-size: 20rpx;
  font-weight: 800;
}

.equip-name {
  margin-top: 8rpx;
  color: #203047;
  font-size: 23rpx;
  font-weight: 900;
}

.empty-log {
  padding: 28rpx 0 6rpx;
  text-align: center;
}

.empty-log-title {
  display: block;
  color: #203047;
  font-size: 28rpx;
  font-weight: 900;
}

.empty-log-copy {
  display: block;
  margin-top: 8rpx;
  color: #718096;
  font-size: 23rpx;
  line-height: 1.4;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.history-row:first-of-type {
  border-top: 0;
}

.history-photo {
  display: flex;
  flex: none;
  width: 72rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  border-radius: 18rpx;
  background: var(--shell, #e8efe9);
  color: var(--ink, #203047);
  font-size: 28rpx;
  font-weight: 900;
}

.history-copy {
  min-width: 0;
  flex: 1;
}

.history-title {
  display: block;
  color: #203047;
  font-size: 27rpx;
  font-weight: 900;
}

.history-note {
  display: block;
  overflow: hidden;
  margin-top: 6rpx;
  color: #718096;
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-score {
  flex: none;
  color: var(--accent, #2f855a);
  font-size: 28rpx;
  font-weight: 900;
}

.danger-button {
  height: 82rpx;
  margin-top: 18rpx;
  border: 1rpx solid #fed7aa;
  border-radius: 18rpx;
  background: #fff7ed;
  color: #c2410c;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 82rpx;
}

.bottom-space {
  height: 140rpx;
}
</style>
