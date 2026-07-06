<template>
  <view class="page">
    <view v-if="!progress" class="onboarding">
      <view class="intro">
        <text class="kicker">学习会被看见</text>
        <text class="title">选择一颗宠物蛋，开始你的自律养成</text>
        <text class="subtitle">每天完成学习打卡获得积分，再把积分喂给伙伴。成长值达到阶段目标后，宠物会进化。</text>
      </view>

      <view class="egg-list">
        <view
          v-for="egg in eggOptions"
          :key="egg.id"
          class="egg-card"
          :class="{ selected: selectedEggId === egg.id }"
          @tap="selectEgg(egg.id)"
        >
          <PetAvatar :egg-id="egg.id" stage-id="egg" size="small" />
          <view class="egg-copy">
            <text class="egg-name">{{ egg.name }}</text>
            <text class="egg-trait">{{ egg.trait }}</text>
          </view>
        </view>
      </view>

      <button class="primary-button" @tap="startJourney">孵化我的学习伙伴</button>
    </view>

    <view v-else class="dashboard">
      <view class="pet-scene">
        <view class="topline">
          <view>
            <text class="scene-label">{{ activeStage.name }}</text>
            <text class="scene-title">{{ progress.petName }}</text>
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
import { EGG_OPTIONS, FEED_ITEMS, type EggId, type FeedItem } from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const selectedEggId = ref<EggId>("aurora");

const eggOptions = EGG_OPTIONS;
const feedItems = FEED_ITEMS;
const progress = computed(() => petStore.progress);
const activeStage = computed(() => petStore.stage);
const nextStage = computed(() => petStore.nextStage);

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
</script>

<style>
.page {
  min-height: 100vh;
  padding: 32rpx;
}

.onboarding,
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.intro {
  display: flex;
  min-height: 360rpx;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 40rpx 34rpx;
  border-radius: 24rpx;
  background: linear-gradient(140deg, #e8f8ef 0%, #d8eefc 55%, #fff3d8 100%);
}

.kicker {
  color: #2f855a;
  font-size: 24rpx;
  font-weight: 800;
}

.title {
  color: #203047;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.18;
}

.subtitle {
  color: #526073;
  font-size: 28rpx;
  line-height: 1.5;
}

.egg-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.egg-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 24rpx;
  border: 2rpx solid #dfe8df;
  border-radius: 18rpx;
  background: #ffffff;
}

.egg-card.selected {
  border-color: #2f855a;
  box-shadow: 0 16rpx 36rpx rgba(47, 133, 90, 0.12);
}

.egg-copy {
  min-width: 0;
  flex: 1;
}

.egg-name,
.feed-name,
.section-title {
  display: block;
  color: #203047;
  font-size: 30rpx;
  font-weight: 850;
}

.egg-trait,
.feed-desc,
.section-note,
.stage-description {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 25rpx;
  line-height: 1.45;
}

.primary-button {
  height: 88rpx;
  border-radius: 16rpx;
  background: #2f855a;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 850;
  line-height: 88rpx;
}

.pet-scene {
  overflow: hidden;
  padding: 30rpx;
  border-radius: 26rpx;
  background: linear-gradient(160deg, #f7fff9 0%, #e4f3ff 62%, #fff7e8 100%);
}

.topline,
.progress-line,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.scene-label {
  display: block;
  color: #2f855a;
  font-size: 24rpx;
  font-weight: 800;
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
