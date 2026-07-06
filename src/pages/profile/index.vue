<template>
  <view class="page">
    <view v-if="!progress" class="empty">
      <text class="empty-title">还没有成长档案</text>
      <text class="empty-copy">选择宠物蛋后，这里会记录学习分钟、积分和进化历程。</text>
      <button class="primary-button" @tap="goHome">去开始</button>
    </view>

    <view v-else class="content">
      <view class="profile-card">
        <PetAvatar :egg-id="progress.eggId" :stage-id="petStore.stage.id" size="small" />
        <view class="profile-copy">
          <text class="profile-name">{{ progress.petName }}</text>
          <text class="profile-stage">{{ petStore.stage.title }} · {{ petStore.stage.name }}</text>
        </view>
      </view>

      <view class="stats">
        <view class="stat">
          <text class="stat-value">{{ progress.points }}</text>
          <text class="stat-label">可用积分</text>
        </view>
        <view class="stat">
          <text class="stat-value">{{ progress.growth }}</text>
          <text class="stat-label">成长值</text>
        </view>
        <view class="stat">
          <text class="stat-value">{{ progress.streak }}</text>
          <text class="stat-label">连续天数</text>
        </view>
        <view class="stat">
          <text class="stat-value">{{ totalHours }}</text>
          <text class="stat-label">累计小时</text>
        </view>
      </view>

      <view class="panel">
        <text class="panel-title">进化路线</text>
        <view v-for="stage in evolutionStages" :key="stage.id" class="stage-row" :class="{ active: progress.growth >= stage.threshold }">
          <view class="stage-dot" />
          <view class="stage-copy">
            <text class="stage-name">{{ stage.name }}</text>
            <text class="stage-desc">{{ stage.threshold }} 成长值 · {{ stage.description }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <text class="panel-title">学习记录</text>
        <view v-if="progress.studyLogs.length === 0" class="empty-log">暂无记录</view>
        <view v-for="log in progress.studyLogs.slice(0, 12)" :key="log.id" class="history-row">
          <image v-if="log.photoPath" class="history-photo" :src="log.photoPath" mode="aspectFill" />
          <view>
            <text class="history-title">{{ log.subject }} · {{ log.minutes }} 分钟</text>
            <text class="history-note">{{ log.note || "完成了一次学习打卡" }}</text>
          </view>
          <text class="history-score">+{{ log.reward }}</text>
        </view>
      </view>

      <button class="danger-button" @tap="confirmReset">重新开始</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PetAvatar from "@/components/PetAvatar.vue";
import { EVOLUTION_STAGES } from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const progress = computed(() => petStore.progress);
const evolutionStages = EVOLUTION_STAGES;
const totalHours = computed(() => (progress.value ? Math.round((progress.value.totalStudyMinutes / 60) * 10) / 10 : 0));

function goHome() {
  uni.switchTab({ url: "/pages/home/index" });
}

function confirmReset() {
  uni.showModal({
    title: "重新开始？",
    content: "当前宠物、积分和学习记录都会清空。",
    confirmText: "清空",
    confirmColor: "#c2410c",
    success(result) {
      if (result.confirm) {
        petStore.resetProgress();
        uni.showToast({ title: "已重置", icon: "none" });
      }
    },
  });
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 32rpx;
}

.content,
.empty {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty {
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.empty-title {
  color: #203047;
  font-size: 42rpx;
  font-weight: 900;
}

.empty-copy {
  color: #687487;
  font-size: 28rpx;
  line-height: 1.5;
}

.primary-button,
.danger-button {
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 850;
  line-height: 88rpx;
}

.primary-button {
  background: #2f855a;
  color: #ffffff;
}

.danger-button {
  border: 1rpx solid #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}

.profile-card,
.panel {
  border: 1rpx solid #dfe8df;
  border-radius: 18rpx;
  background: #ffffff;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 28rpx;
}

.profile-copy {
  min-width: 0;
  flex: 1;
}

.profile-name {
  display: block;
  color: #203047;
  font-size: 38rpx;
  font-weight: 900;
}

.profile-stage {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 26rpx;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.stat {
  padding: 24rpx;
  border: 1rpx solid #dfe8df;
  border-radius: 18rpx;
  background: #ffffff;
}

.stat-value {
  display: block;
  color: #203047;
  font-size: 38rpx;
  font-weight: 900;
}

.stat-label {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 24rpx;
}

.panel {
  padding: 28rpx;
}

.panel-title {
  display: block;
  margin-bottom: 18rpx;
  color: #203047;
  font-size: 30rpx;
  font-weight: 850;
}

.stage-row,
.history-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.stage-row:first-of-type,
.history-row:first-of-type {
  border-top: 0;
}

.stage-dot {
  width: 24rpx;
  height: 24rpx;
  margin-top: 8rpx;
  border-radius: 999rpx;
  background: #d8dfd8;
}

.stage-row.active .stage-dot {
  background: #2f855a;
}

.stage-copy,
.history-row view {
  min-width: 0;
  flex: 1;
}

.history-photo {
  flex: none;
  width: 72rpx;
  height: 72rpx;
  border-radius: 14rpx;
  background: #e8efe9;
}

.stage-name,
.history-title {
  display: block;
  color: #203047;
  font-size: 28rpx;
  font-weight: 850;
}

.stage-desc,
.history-note,
.empty-log {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 24rpx;
  line-height: 1.4;
}

.history-score {
  color: #2f855a;
  font-size: 28rpx;
  font-weight: 900;
}
</style>
