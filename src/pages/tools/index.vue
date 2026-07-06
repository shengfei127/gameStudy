<template>
  <view class="page">
    <AppCard>
      <view class="section-title">Runtime</view>
      <view class="info-row">
        <text class="info-label">API Base</text>
        <text class="info-value">{{ apiBaseUrl }}</text>
      </view>
      <button class="primary-button" @tap="refreshDeviceInfo">Refresh Device Info</button>
    </AppCard>

    <AppCard>
      <view class="section-title">Storage</view>
      <button class="ghost-button" @tap="clearLocalState">Reset Local State</button>
    </AppCard>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import AppCard from "@/components/AppCard.vue";
import { appConfig } from "@/config";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const apiBaseUrl = computed(() => appConfig.apiBaseUrl || "not configured");

function refreshDeviceInfo() {
  const systemInfo = uni.getSystemInfoSync();
  appStore.platform = systemInfo.platform || "unknown";
  appStore.persist();
  uni.showToast({ title: "Updated", icon: "success" });
}

function clearLocalState() {
  uni.clearStorageSync();
  appStore.launchCount = 0;
  appStore.platform = "unknown";
  appStore.persist();
  uni.showToast({ title: "Reset", icon: "success" });
}
</script>

<style>
.page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  gap: 24rpx;
  padding: 32rpx;
}

.section-title {
  margin-bottom: 20rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding-bottom: 24rpx;
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

.primary-button,
.ghost-button {
  height: 84rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 84rpx;
}

.ghost-button {
  border: 1rpx solid #d5dce8;
  background: #ffffff;
  color: #1f2937;
}
</style>
