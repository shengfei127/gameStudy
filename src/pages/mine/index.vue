<template>
  <view class="page">
    <view class="hero">
      <image class="hero-bg" src="/static/pets/lotusguard-adult.webp" mode="aspectFill" />
      <view class="hero-shade" />
      <view class="account">
        <view class="avatar">
          <text>{{ avatarInitial }}</text>
        </view>
        <view class="account-copy">
          <text class="eyebrow">MY ACCOUNT</text>
          <text class="username">{{ authStore.username || "未登录" }}</text>
          <text class="account-note">学习档案已绑定当前账号</text>
        </view>
      </view>
    </view>

    <view class="quick-grid">
      <view class="quick-card">
        <text class="quick-value">{{ petStore.progress?.points || 0 }}</text>
        <text class="quick-label">积分</text>
      </view>
      <view class="quick-card">
        <text class="quick-value">{{ petStore.progress?.streak || 0 }}</text>
        <text class="quick-label">连续天数</text>
      </view>
      <view class="quick-card">
        <text class="quick-value">{{ petStore.todayMinutes }}</text>
        <text class="quick-label">今日分钟</text>
      </view>
      <view class="quick-card">
        <text class="quick-value">{{ petStore.collectionCount }}</text>
        <text class="quick-label">收藏</text>
      </view>
    </view>

    <view class="menu-panel">
      <view class="menu-row" @tap="goProfile">
        <view class="menu-icon archive-icon">档</view>
        <view class="menu-copy">
          <text class="menu-title">成长档案</text>
          <text class="menu-desc">查看进化路线和学习记录</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-row" @tap="goCheckIn">
        <view class="menu-icon check-icon">学</view>
        <view class="menu-copy">
          <text class="menu-title">学习打卡</text>
          <text class="menu-desc">语文、数学、英语每日各一次</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-row" @tap="goShop">
        <view class="menu-icon shop-icon">藏</view>
        <view class="menu-copy">
          <text class="menu-title">伙伴商城</text>
          <text class="menu-desc">用积分收集装扮和房间装饰</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <button class="logout-button" :disabled="authStore.loading" @tap="confirmLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { usePetStore } from "@/stores/pet";

const authStore = useAuthStore();
const petStore = usePetStore();
const avatarInitial = computed(() => (authStore.username ? authStore.username.slice(0, 1).toUpperCase() : "我"));

function goProfile() {
  uni.switchTab({ url: "/pages/profile/index" });
}

function goCheckIn() {
  uni.switchTab({ url: "/pages/tools/index" });
}

function goShop() {
  uni.switchTab({ url: "/pages/shop/index" });
}

function confirmLogout() {
  uni.showModal({
    title: "退出登录？",
    content: "退出后需要重新登录才能查看当前账号的学习档案。",
    confirmText: "退出",
    confirmColor: "#c2410c",
    async success(result) {
      if (result.confirm) {
        try {
          await authStore.logout();
          petStore.clearState();
          uni.reLaunch({ url: "/pages/auth/index" });
        } catch (error) {
          uni.showToast({ title: error instanceof Error ? error.message : "退出失败", icon: "none" });
        }
      }
    },
  });
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 132rpx;
  background:
    radial-gradient(circle at 18% 0%, rgba(20, 184, 166, 0.12), transparent 34%),
    linear-gradient(180deg, #f5faf8, #eef6f2);
}

.hero {
  position: relative;
  overflow: hidden;
  min-height: 360rpx;
  border-radius: 32rpx;
  padding: 30rpx;
  background: #0b1b18;
  color: #ffffff;
  box-shadow: 0 26rpx 64rpx rgba(23, 67, 61, 0.22);
}

.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.66;
  filter: saturate(1.16) contrast(1.14) brightness(0.7);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 70% 38%, rgba(94, 234, 212, 0.38), transparent 34%),
    linear-gradient(90deg, rgba(9, 35, 31, 0.88), rgba(9, 35, 31, 0.32)),
    linear-gradient(180deg, transparent, rgba(6, 14, 13, 0.86));
}

.account {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 22rpx;
  min-height: 284rpx;
}

.avatar {
  display: flex;
  flex: none;
  width: 104rpx;
  height: 104rpx;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 42rpx;
  font-weight: 900;
  backdrop-filter: blur(12rpx);
}

.account-copy {
  min-width: 0;
  flex: 1;
}

.eyebrow {
  display: block;
  color: #8ae0d1;
  font-size: 21rpx;
  font-weight: 900;
}

.username {
  display: block;
  overflow: hidden;
  margin-top: 8rpx;
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-note {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 24rpx;
  font-weight: 800;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.quick-card {
  min-height: 126rpx;
  padding: 22rpx 10rpx;
  border: 1rpx solid rgba(20, 184, 166, 0.18);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  box-shadow: 0 14rpx 34rpx rgba(23, 67, 61, 0.08);
}

.quick-value {
  display: block;
  color: #17433d;
  font-size: 34rpx;
  font-weight: 900;
}

.quick-label {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 20rpx;
  font-weight: 800;
}

.menu-panel {
  margin-top: 20rpx;
  padding: 6rpx 24rpx;
  border: 1rpx solid rgba(20, 184, 166, 0.16);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 44rpx rgba(23, 67, 61, 0.08);
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.menu-row:first-child {
  border-top: 0;
}

.menu-icon {
  flex: none;
  width: 74rpx;
  height: 74rpx;
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 900;
  line-height: 74rpx;
  text-align: center;
}

.archive-icon {
  background: linear-gradient(135deg, #17433d, #14b8a6);
}

.check-icon {
  background: linear-gradient(135deg, #1f3149, #2f855a);
}

.shop-icon {
  background: linear-gradient(135deg, #7c2d12, #f97316);
}

.menu-copy {
  min-width: 0;
  flex: 1;
}

.menu-title {
  display: block;
  color: #203047;
  font-size: 29rpx;
  font-weight: 900;
}

.menu-desc {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 23rpx;
  line-height: 1.36;
}

.menu-arrow {
  color: #94a3b8;
  font-size: 42rpx;
  font-weight: 300;
}

.logout-button {
  height: 86rpx;
  margin-top: 24rpx;
  border: 1rpx solid #fecaca;
  border-radius: 20rpx;
  background: #fff5f5;
  color: #c2410c;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 86rpx;
}
</style>
