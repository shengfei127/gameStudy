<template>
  <view class="page">
    <AppCard>
      <view class="avatar">{{ initials }}</view>
      <text class="name">{{ appConfig.name }}</text>
      <text class="caption">Version {{ appConfig.version }}</text>
    </AppCard>

    <AppCard>
      <view class="info-row">
        <text class="info-label">Package</text>
        <text class="info-value">com.example.gamestudy</text>
      </view>
      <view class="info-row">
        <text class="info-label">AppID</text>
        <text class="info-value">set in manifest.json</text>
      </view>
    </AppCard>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppCard from "@/components/AppCard.vue";
import { appConfig } from "@/config";

const initials = computed(() =>
  appConfig.name
    .split(/\s|-/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
);
</script>

<style>
.page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx;
}

.avatar {
  display: flex;
  width: 112rpx;
  height: 112rpx;
  align-items: center;
  justify-content: center;
  border-radius: 28rpx;
  background: #2563eb;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 800;
}

.name {
  display: block;
  margin-top: 24rpx;
  color: #111827;
  font-size: 38rpx;
  font-weight: 800;
}

.caption {
  display: block;
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 26rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid #edf1f7;
}

.info-row:first-child {
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
