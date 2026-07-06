<template>
  <view class="page">
    <view v-if="!progress" class="onboarding">
      <view class="fixed-showcase" :style="selectedStyle">
        <image class="hero-backdrop" :src="selectedAdultAsset" mode="aspectFill" />
        <view class="hero-vignette" />

        <view class="hero-copy hero-copy-main">
          <text class="hero-kicker">成年形态预览</text>
          <text class="hero-title">{{ selectedEgg.adultName }}</text>
          <text class="hero-subtitle">{{ selectedEgg.archetype }}</text>
        </view>

        <view class="hero-copy hero-copy-side">
          <text class="hero-side-label">{{ selectedEgg.studyStyle }}</text>
          <text class="hero-trait">{{ selectedEgg.trait }}</text>
        </view>

        <view class="egg-badge">
          <view class="egg-badge-art">
            <image class="egg-image" :src="selectedEggAsset" mode="aspectFit" />
          </view>
          <view class="egg-mini-copy">
            <text class="egg-mini-label">初始蛋</text>
            <text class="egg-mini-name">{{ selectedEgg.name }}</text>
          </view>
        </view>
      </view>

      <view class="guide-row">
        <view class="guide-dot" />
        <text class="guide-text">先看成年后的样子，再决定要孵化哪颗蛋。</text>
      </view>

      <scroll-view class="egg-scroll" scroll-y enhanced :show-scrollbar="false">
        <view v-for="group in optionGroups" :key="group.key" class="option-section">
          <view class="section-heading">
            <text class="section-title">{{ group.title }}</text>
            <text class="section-note">{{ group.note }}</text>
          </view>

          <view class="egg-grid">
            <view
              v-for="egg in group.options"
              :key="egg.id"
              class="egg-card"
              :class="{ selected: selectedEggId === egg.id }"
              :style="cardStyle(egg)"
              @tap="selectEgg(egg.id)"
            >
              <image class="card-adult-bg" :src="getPetAssetPath(egg.id, 'adult')" mode="aspectFill" />
              <view class="card-scrim" />

              <view class="card-egg-orb">
                <image class="card-egg-image" :src="getPetAssetPath(egg.id, 'egg')" mode="aspectFit" />
              </view>

              <view class="card-copy">
                <text class="card-name">{{ egg.adultName }}</text>
                <text class="card-meta">{{ egg.name }}</text>
                <text class="card-tag">{{ egg.iconLabel }} · {{ egg.studyStyle }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="scroll-bottom-space" />
      </scroll-view>

      <view class="action-dock">
        <button class="primary-button" @tap="startJourney">选择 {{ selectedEgg.name }}，开始孵化</button>
      </view>
    </view>

    <view v-else class="dashboard">
      <view class="pet-scene" :style="activeStyle">
        <view class="topline">
          <view>
            <text class="scene-label">{{ activeStage.name }}</text>
            <text class="scene-title">{{ displayName }}</text>
          </view>
          <view class="points-pill">
            <text class="points-value">{{ progress.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>

        <view class="avatar-wrap">
          <PetAvatar :egg-id="progress.eggId" :stage-id="activeStage.id" size="large" />
        </view>

        <text class="stage-description">{{ activeStage.description }}</text>

        <view class="progress-block">
          <view class="progress-line">
            <text class="progress-label">成长值 {{ progress.growth }}</text>
            <text class="progress-label">{{ nextStage ? `下一阶段 ${nextStage.threshold}` : "已满级" }}</text>
          </view>
          <view class="bar">
            <view class="bar-fill" :style="{ width: `${petStore.evolutionPercent}%` }" />
          </view>
        </view>
      </view>

      <view class="stat-grid">
        <view class="stat-card">
          <text class="stat-value">{{ progress.streak }}</text>
          <text class="stat-label">连续天数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ petStore.todayMinutes }}</text>
          <text class="stat-label">今日分钟</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ Math.round(progress.totalStudyMinutes / 60) }}</text>
          <text class="stat-label">累计小时</text>
        </view>
      </view>

      <view class="section">
        <view class="section-heading">
          <text class="section-title">喂养伙伴</text>
          <text class="section-note">用学习积分换成长值</text>
        </view>
        <view class="feed-list">
          <view v-for="item in feedItems" :key="item.id" class="feed-row">
            <view class="feed-copy">
              <text class="feed-name">{{ item.name }}</text>
              <text class="feed-desc">{{ item.description }}</text>
              <text class="feed-meta">消耗 {{ item.cost }} 积分，成长 +{{ item.growth }}</text>
            </view>
            <button class="feed-button" :disabled="!canFeed(item.cost)" @tap="handleFeed(item.id)">喂养</button>
          </view>
        </view>
      </view>

      <button class="primary-button" @tap="goCheckIn">去学习打卡</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PetAvatar from "@/components/PetAvatar.vue";
import { EGG_OPTIONS, FEED_ITEMS, getEggOption, getPetAssetPath } from "@/domain/pet";
import type { EggId, EggOption, FeedItem } from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const selectedEggId = ref<EggId>("windfire");

const selectableEggs = EGG_OPTIONS.filter((egg) => egg.category !== "classic");
const optionGroups = [
  {
    key: "zodiac",
    title: "十二生肖图鉴",
    note: "每个生肖对应一种学习性格",
    options: selectableEggs.filter((egg) => egg.category === "zodiac"),
  },
  {
    key: "myth",
    title: "神话潮流图鉴",
    note: "原创神话灵感角色，适合强激励开局",
    options: selectableEggs.filter((egg) => egg.category === "myth"),
  },
];

const feedItems = FEED_ITEMS;
const progress = computed(() => petStore.progress);
const activeEgg = computed(() => (progress.value ? getEggOption(progress.value.eggId) : null));
const activeStage = computed(() => petStore.stage);
const nextStage = computed(() => petStore.nextStage);
const selectedEgg = computed(() => getEggOption(selectedEggId.value));
const selectedAdultAsset = computed(() => getPetAssetPath(selectedEgg.value.id, "adult"));
const selectedEggAsset = computed(() => getPetAssetPath(selectedEgg.value.id, "egg"));
const displayName = computed(() =>
  activeEgg.value && activeStage.value.id === "guardian" ? activeEgg.value.adultName : progress.value?.petName,
);
const selectedStyle = computed(() => panelStyle(selectedEgg.value));
const activeStyle = computed(() => (activeEgg.value ? panelStyle(activeEgg.value) : ""));

function selectEgg(eggId: EggId) {
  selectedEggId.value = eggId;
}

function startJourney() {
  petStore.chooseEgg(selectedEggId.value);
  uni.showToast({ title: "伙伴已孵化", icon: "none" });
}

function canFeed(cost: number) {
  return Boolean(progress.value && progress.value.points >= cost);
}

function handleFeed(itemId: FeedItem["id"]) {
  try {
    const result = petStore.feed(itemId);
    uni.showToast({
      title: result.evolved ? `进化到${result.stage.name}` : "喂养成功",
      icon: "none",
    });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : "喂养失败", icon: "none" });
  }
}

function goCheckIn() {
  uni.switchTab({ url: "/pages/tools/index" });
}

function panelStyle(egg: EggOption) {
  return [
    `--panel-shell:${egg.palette.shell}`,
    `--panel-accent:${egg.palette.accent}`,
    `--panel-glow:${egg.palette.glow}`,
    `--panel-ink:${egg.palette.ink}`,
  ].join(";");
}

function cardStyle(egg: EggOption) {
  return [
    `--card-shell:${egg.palette.shell}`,
    `--card-accent:${egg.palette.accent}`,
    `--card-glow:${egg.palette.glow}`,
    `--card-ink:${egg.palette.ink}`,
  ].join(";");
}
</script>

<style>
.page {
  box-sizing: border-box;
  width: 100%;
  max-width: 760rpx;
  min-height: 100vh;
  overflow: hidden;
  margin: 0 auto;
  padding: 18rpx 24rpx 0;
}

.onboarding {
  display: flex;
  height: calc(100vh - 18rpx);
  min-height: 0;
  flex-direction: column;
  gap: 12rpx;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
  padding-bottom: 28rpx;
}

.fixed-showcase {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  flex: 0 0 568rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 34rpx;
  background:
    radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.96), transparent 23%),
    radial-gradient(circle at 84% 78%, var(--panel-glow), transparent 34%),
    linear-gradient(150deg, #fff9f2 0%, var(--panel-shell) 47%, #f4fbf5 100%);
  box-shadow: 0 24rpx 60rpx rgba(32, 48, 71, 0.12);
  isolation: isolate;
}

.fixed-showcase::before {
  position: absolute;
  top: -208rpx;
  right: -112rpx;
  width: 470rpx;
  height: 470rpx;
  border: 2rpx solid var(--panel-accent);
  border-radius: 50%;
  content: "";
  opacity: 0.14;
}

.fixed-showcase::after {
  position: absolute;
  bottom: -104rpx;
  left: -96rpx;
  width: 420rpx;
  height: 248rpx;
  border-radius: 58% 42% 0 0;
  background: linear-gradient(130deg, var(--panel-accent), transparent 84%);
  content: "";
  opacity: 0.12;
  transform: rotate(8deg);
}

.hero-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  transform: scale(1.06);
  filter: saturate(1.05) contrast(1.02);
}

.hero-vignette {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.5) 34%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0.46) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0.04) 42%, rgba(255, 255, 255, 0.76) 100%);
  pointer-events: none;
}

.hero-copy {
  position: absolute;
  z-index: 1;
}

.hero-copy-main {
  top: 34rpx;
  left: 28rpx;
  width: 392rpx;
}

.hero-copy-side {
  bottom: 24rpx;
  left: 28rpx;
  box-sizing: border-box;
  width: 350rpx;
  padding: 16rpx 18rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14rpx 34rpx rgba(32, 48, 71, 0.08);
  backdrop-filter: blur(12rpx);
}

.hero-kicker {
  display: inline-flex;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: var(--panel-ink);
  font-size: 22rpx;
  font-weight: 900;
}

.hero-title {
  display: block;
  margin-top: 18rpx;
  color: #203047;
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1.04;
}

.hero-subtitle,
.hero-side-label,
.hero-trait {
  display: block;
  color: #44536a;
  font-size: 24rpx;
  line-height: 1.42;
}

.hero-subtitle {
  margin-top: 14rpx;
  font-weight: 900;
}

.hero-trait {
  margin-top: 6rpx;
  font-weight: 700;
}

.hero-side-label {
  color: var(--panel-ink);
  font-weight: 900;
}

.egg-badge {
  position: absolute;
  right: 22rpx;
  bottom: 22rpx;
  z-index: 2;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  gap: 12rpx;
  width: 244rpx;
  padding: 8rpx 16rpx 8rpx 8rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 18rpx 42rpx rgba(32, 48, 71, 0.16);
  backdrop-filter: blur(10rpx);
}

.egg-badge-art,
.card-egg-orb {
  overflow: hidden;
  flex: none;
  border: 4rpx solid rgba(255, 255, 255, 0.86);
  background:
    radial-gradient(ellipse at 34% 18%, rgba(255, 255, 255, 0.98) 0 18%, transparent 34%),
    radial-gradient(ellipse at 50% 72%, var(--card-accent, var(--panel-accent)) 0%, transparent 72%),
    linear-gradient(155deg, #ffffff, var(--card-glow, var(--panel-glow)));
  box-shadow:
    inset -8rpx -16rpx 24rpx rgba(32, 48, 71, 0.12),
    0 14rpx 30rpx rgba(32, 48, 71, 0.16);
}

.egg-badge-art {
  width: 78rpx;
  height: 98rpx;
  border-radius: 50% 50% 46% 46%;
}

.egg-image,
.card-egg-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.egg-mini-copy {
  min-width: 0;
  flex: 1;
}

.egg-mini-label {
  display: block;
  color: #7a8494;
  font-size: 18rpx;
  font-weight: 800;
}

.egg-mini-name {
  display: block;
  overflow: hidden;
  color: #203047;
  font-size: 24rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.guide-row {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 14rpx;
  padding: 2rpx 4rpx 0;
}

.guide-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #2f855a;
}

.guide-text {
  color: #526073;
  font-size: 25rpx;
  line-height: 1.4;
}

.egg-scroll {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.option-section {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
}

.section-title {
  display: block;
  color: #203047;
  font-size: 30rpx;
  font-weight: 900;
}

.section-note {
  max-width: 330rpx;
  color: #7a8494;
  font-size: 22rpx;
  line-height: 1.35;
  text-align: right;
}

.egg-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
}

.egg-card {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  min-height: 232rpx;
  padding: 18rpx 16rpx 20rpx;
  border: 2rpx solid #e3eadf;
  border-radius: 22rpx;
  background:
    radial-gradient(circle at 86% 16%, var(--card-glow), transparent 34%),
    linear-gradient(160deg, #ffffff, var(--card-shell));
  box-shadow: 0 14rpx 34rpx rgba(32, 48, 71, 0.07);
}

.egg-card.selected {
  border-color: var(--card-accent);
  box-shadow: 0 18rpx 46rpx rgba(32, 48, 71, 0.12);
}

.egg-card.selected::after {
  position: absolute;
  top: 14rpx;
  right: 14rpx;
  width: 18rpx;
  height: 18rpx;
  border: 5rpx solid #ffffff;
  border-radius: 50%;
  background: var(--card-accent);
  content: "";
  box-shadow: 0 0 0 2rpx var(--card-accent);
}

.card-adult-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 56%;
  height: 100%;
  opacity: 0.9;
  filter: saturate(1.04) drop-shadow(0 18rpx 26rpx rgba(32, 48, 71, 0.16));
}

.card-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.75) 58%, rgba(255, 255, 255, 0.16) 100%),
    linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.34) 100%);
}

.card-egg-orb {
  position: relative;
  z-index: 1;
  width: 70rpx;
  height: 92rpx;
  border-radius: 50% 50% 45% 45%;
  transform: rotate(-2deg);
}

.card-copy {
  position: relative;
  z-index: 1;
  max-width: 218rpx;
  margin-top: 14rpx;
}

.card-name {
  display: block;
  overflow: hidden;
  color: #203047;
  font-size: 28rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta,
.card-tag {
  display: block;
  color: #657084;
  font-size: 22rpx;
  line-height: 1.35;
}

.card-meta {
  overflow: hidden;
  margin-top: 6rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-tag {
  margin-top: 8rpx;
  color: #3d4b5f;
  font-size: 21rpx;
  font-weight: 800;
  white-space: normal;
}

.scroll-bottom-space {
  height: 126rpx;
}

.action-dock {
  position: fixed;
  right: 24rpx;
  bottom: calc(var(--window-bottom) + 18rpx);
  left: 24rpx;
  z-index: 12;
  box-sizing: border-box;
  max-width: 712rpx;
  margin: 0 auto;
}

.primary-button {
  height: 92rpx;
  border-radius: 18rpx;
  background: #203047;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 92rpx;
  box-shadow: 0 18rpx 38rpx rgba(32, 48, 71, 0.18);
}

.pet-scene {
  overflow: hidden;
  padding: 30rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.74);
  border-radius: 30rpx;
  background:
    radial-gradient(circle at 80% 18%, rgba(255, 255, 255, 0.82), transparent 22%),
    linear-gradient(145deg, var(--panel-glow), var(--panel-shell) 56%, #ffffff 100%);
  box-shadow: 0 24rpx 60rpx rgba(32, 48, 71, 0.1);
}

.topline,
.progress-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.scene-label {
  display: block;
  color: #2f855a;
  font-size: 24rpx;
  font-weight: 900;
}

.scene-title {
  display: block;
  margin-top: 6rpx;
  color: #203047;
  font-size: 42rpx;
  font-weight: 900;
}

.points-pill {
  min-width: 132rpx;
  padding: 12rpx 18rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.78);
  text-align: center;
}

.points-value {
  display: block;
  color: #203047;
  font-size: 34rpx;
  font-weight: 900;
}

.points-label,
.progress-label,
.feed-meta {
  color: #687487;
  font-size: 22rpx;
}

.avatar-wrap {
  display: flex;
  justify-content: center;
  padding: 28rpx 0 12rpx;
}

.stage-description {
  display: block;
  color: #526073;
  font-size: 26rpx;
  line-height: 1.45;
}

.progress-block {
  margin-top: 24rpx;
}

.bar {
  overflow: hidden;
  height: 18rpx;
  margin-top: 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
}

.bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #2f855a, #65c58c);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.stat-card,
.section {
  border: 1rpx solid #dfe8df;
  border-radius: 18rpx;
  background: #ffffff;
}

.stat-card {
  padding: 22rpx 12rpx;
  text-align: center;
}

.stat-value {
  display: block;
  color: #203047;
  font-size: 36rpx;
  font-weight: 900;
}

.stat-label {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 22rpx;
}

.section {
  padding: 28rpx;
}

.feed-list {
  margin-top: 20rpx;
}

.feed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.feed-row:first-child {
  border-top: 0;
}

.feed-copy {
  min-width: 0;
  flex: 1;
}

.feed-name {
  display: block;
  color: #203047;
  font-size: 30rpx;
  font-weight: 850;
}

.feed-desc {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 25rpx;
  line-height: 1.45;
}

.feed-button {
  width: 132rpx;
  height: 68rpx;
  border-radius: 14rpx;
  background: #203047;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 800;
  line-height: 68rpx;
}

.feed-button[disabled] {
  background: #d8dfd8;
  color: #8a958c;
}
</style>
