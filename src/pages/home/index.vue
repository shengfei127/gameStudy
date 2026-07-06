<template>
  <view class="page">
    <view class="hero">
      <text class="eyebrow">UNI-APP ANDROID STARTER</text>
      <text class="title">{{ appConfig.name }}</text>
      <text class="subtitle">Vue 3, TypeScript, Pinia, and App-Plus are ready.</text>
    </view>

    <AppCard>
      <view class="metric-row">
        <view class="metric">
          <text class="metric-value">{{ appStore.launchCount }}</text>
          <text class="metric-label">Launches</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ appStore.platform }}</text>
          <text class="metric-label">Platform</text>
        </view>
      </view>
    </AppCard>

    <AppCard>
      <view class="section-title">Device</view>
      <view v-for="item in deviceInfo" :key="item.label" class="info-row">
        <text class="info-label">{{ item.label }}</text>
        <text class="info-value">{{ item.value }}</text>
      </view>
    </AppCard>
  </view>
</template>

<script setup lang="ts">
import AppCard from "@/components/AppCard.vue";
import { appConfig } from "@/config";
import { useAppStore } from "@/stores/app";
import { getDeviceInfo } from "@/utils/system";

const appStore = useAppStore();
const deviceInfo = getDeviceInfo();
</script>

<style>
.page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx;
}

.hero {
  display: flex;
  min-height: 280rpx;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14rpx;
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #12213b 0%, #2563eb 58%, #13b8a6 100%);
  color: #ffffff;
}

.eyebrow {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0;
  opacity: 0.72;
}

.title {
  font-size: 52rpx;
  font-weight: 800;
  line-height: 1.1;
}

.subtitle {
  max-width: 560rpx;
  font-size: 28rpx;
  line-height: 1.45;
  opacity: 0.86;
}

.metric-row {
  display: flex;
  gap: 20rpx;
}

.metric {
  flex: 1;
  min-width: 0;
}

.metric-value {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-label {
  display: block;
  margin-top: 6rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.section-title {
  margin-bottom: 16rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid #edf1f7;
}

.info-row:first-of-type {
  border-top: 0;
}

.info-label {
  color: #6b7280;
  font-size: 26rpx;
}

.info-value {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: #1f2937;
  font-size: 26rpx;
  font-weight: 600;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
