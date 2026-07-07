<template>
  <view class="page">
    <image class="hero-pet" src="/static/pets/windfire-adult.webp" mode="aspectFill" />
    <image class="support-pet" src="/static/pets/zodiac_dragon-adult.webp" mode="aspectFill" />
    <view class="aura-ring aura-ring-one" />
    <view class="aura-ring aura-ring-two" />
    <view class="shade" />

    <view class="brand">
      <view class="brand-mark">
        <text class="brand-dot">火</text>
        <text class="brand-kicker">STUDY PET</text>
      </view>
      <text class="brand-title">自律伙伴</text>
      <text class="brand-copy">登录后同步宠物成长、学习打卡和积分进度。</text>
    </view>

    <view class="auth-panel">
      <view class="panel-head">
        <view>
          <text class="panel-kicker">{{ mode === "login" ? "WELCOME BACK" : "NEW PARTNER" }}</text>
          <text class="panel-title">{{ mode === "login" ? "继续你的学习契约" : "创建新的学习契约" }}</text>
        </view>
        <view class="mini-emblem">
          <image class="mini-egg" src="/static/pets/windfire-egg-cutout.webp" mode="aspectFit" />
        </view>
      </view>

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'login' }" @tap="mode = 'login'">
          <text>登录</text>
        </view>
        <view class="mode-tab" :class="{ active: mode === 'register' }" @tap="mode = 'register'">
          <text>注册</text>
        </view>
      </view>

      <view class="field">
        <view class="field-head">
          <text class="field-label">用户名</text>
          <text class="field-meta">3-20 个字符</text>
        </view>
        <input
          v-model="username"
          class="input"
          maxlength="20"
          placeholder="输入学习账号"
          placeholder-class="placeholder"
        />
      </view>

      <view class="field">
        <view class="field-head">
          <text class="field-label">密码</text>
          <text class="field-meta">6-32 位</text>
        </view>
        <input
          v-model="password"
          class="input"
          password
          maxlength="32"
          placeholder="输入账号密码"
          placeholder-class="placeholder"
        />
      </view>

      <button class="submit-button" :disabled="!canSubmit || authStore.loading" @tap="submit">
        {{ submitLabel }}
      </button>

      <text v-if="errorMessage" class="error-text">{{ errorMessage }}</text>

      <view class="promise-row">
        <view class="promise-item">
          <text class="promise-value">3</text>
          <text class="promise-label">科每日打卡</text>
        </view>
        <view class="promise-divider" />
        <view class="promise-item">
          <text class="promise-value">5</text>
          <text class="promise-label">阶段进化</text>
        </view>
        <view class="promise-divider" />
        <view class="promise-item">
          <text class="promise-value">云</text>
          <text class="promise-label">账号同步</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useAuthStore } from "@/stores/auth";
import { usePetStore } from "@/stores/pet";

type AuthMode = "login" | "register";

const authStore = useAuthStore();
const petStore = usePetStore();
const mode = ref<AuthMode>("login");
const username = ref("");
const password = ref("");
const errorMessage = ref("");

const canSubmit = computed(() => username.value.trim().length >= 3 && password.value.length >= 6);
const submitLabel = computed(() => {
  if (authStore.loading || petStore.loading) {
    return mode.value === "login" ? "正在登录..." : "正在注册...";
  }

  return mode.value === "login" ? "登录并继续" : "注册并开始";
});

onShow(() => {
  if (authStore.isLoggedIn) {
    uni.switchTab({ url: "/pages/home/index" });
  }
});

async function submit() {
  if (!canSubmit.value) {
    errorMessage.value = "请输入有效的用户名和密码";
    return;
  }

  errorMessage.value = "";
  uni.showLoading({ title: mode.value === "login" ? "正在登录" : "正在注册", mask: true });

  try {
    if (mode.value === "login") {
      await authStore.login({
        username: username.value,
        password: password.value,
      });
    } else {
      await authStore.register({
        username: username.value,
        password: password.value,
      });
    }

    await petStore.hydrate();
    uni.switchTab({ url: "/pages/home/index" });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "账号操作失败";
  } finally {
    uni.hideLoading();
  }
}
</script>

<style>
.page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  padding: 68rpx 34rpx 36rpx;
  background:
    radial-gradient(circle at 18% 10%, rgba(255, 201, 113, 0.2), transparent 28%),
    radial-gradient(circle at 100% 66%, rgba(239, 68, 68, 0.22), transparent 34%),
    linear-gradient(165deg, #0a0d13 0%, #18120f 42%, #070a10 100%);
  color: #ffffff;
}

.hero-pet {
  position: absolute;
  right: -176rpx;
  bottom: -34rpx;
  width: 810rpx;
  height: 990rpx;
  opacity: 0.94;
  filter: saturate(1.22) contrast(1.14) brightness(0.74);
  transform: rotate(-2deg);
}

.support-pet {
  position: absolute;
  top: 36rpx;
  right: -286rpx;
  width: 660rpx;
  height: 760rpx;
  opacity: 0.2;
  filter: saturate(1.05) contrast(1.1) brightness(0.64);
}

.aura-ring {
  position: absolute;
  border: 2rpx solid rgba(255, 194, 120, 0.2);
  border-radius: 50%;
  transform: rotate(-18deg);
}

.aura-ring-one {
  right: -128rpx;
  bottom: 118rpx;
  width: 590rpx;
  height: 590rpx;
  box-shadow: inset 0 0 80rpx rgba(239, 68, 68, 0.08);
}

.aura-ring-two {
  right: -56rpx;
  bottom: 202rpx;
  width: 420rpx;
  height: 420rpx;
  border-color: rgba(255, 255, 255, 0.08);
}

.shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(7, 10, 16, 0.94), rgba(8, 10, 15, 0.72) 42%, rgba(8, 10, 15, 0.24)),
    linear-gradient(180deg, rgba(7, 10, 16, 0.04), rgba(7, 10, 16, 0.24) 38%, rgba(5, 7, 12, 0.9) 100%),
    radial-gradient(circle at 70% 45%, rgba(255, 119, 53, 0.18), transparent 32%);
}

.brand,
.auth-panel {
  position: relative;
  z-index: 1;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  max-width: 570rpx;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.brand-dot {
  width: 44rpx;
  height: 44rpx;
  border: 1rpx solid rgba(255, 203, 128, 0.5);
  border-radius: 50%;
  background: rgba(255, 124, 72, 0.16);
  color: #ffd8a8;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 44rpx;
  text-align: center;
  box-shadow: 0 0 28rpx rgba(239, 68, 68, 0.24);
}

.brand-kicker {
  color: #ffca83;
  font-size: 22rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.brand-title {
  color: #ffffff;
  font-size: 68rpx;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.34);
}

.brand-copy {
  max-width: 520rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 26rpx;
  font-weight: 800;
  line-height: 1.42;
}

.auth-panel {
  overflow: hidden;
  margin-top: 36rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 236, 210, 0.3);
  border-radius: 30rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 247, 239, 0.82)),
    rgba(255, 255, 255, 0.82);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.94),
    0 34rpx 90rpx rgba(0, 0, 0, 0.34),
    0 0 0 1rpx rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(22rpx);
}

.auth-panel::before {
  position: absolute;
  top: 0;
  right: 26rpx;
  left: 26rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, transparent, #ffb35c, #ef4444, transparent);
  content: "";
  opacity: 0.78;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 18rpx;
}

.panel-kicker {
  display: block;
  color: #a8482f;
  font-size: 19rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.panel-title {
  display: block;
  margin-top: 6rpx;
  color: #261813;
  font-size: 31rpx;
  font-weight: 900;
  line-height: 1.2;
}

.mini-emblem {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border: 1rpx solid rgba(239, 68, 68, 0.24);
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 38% 20%, #fff7eb, transparent 34%),
    linear-gradient(145deg, #ffe6c8, #ffd2b2);
  box-shadow: 0 12rpx 26rpx rgba(168, 72, 47, 0.16);
}

.mini-egg {
  width: 64rpx;
  height: 64rpx;
}

.mode-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10rpx;
  padding: 6rpx;
  border: 1rpx solid #eadccd;
  border-radius: 20rpx;
  background: rgba(236, 226, 216, 0.82);
}

.mode-tab {
  height: 68rpx;
  border-radius: 16rpx;
  color: #705f51;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 68rpx;
  text-align: center;
}

.mode-tab.active {
  background:
    radial-gradient(circle at 24% 10%, rgba(255, 255, 255, 0.28), transparent 28%),
    linear-gradient(135deg, #641d14, #e23e3e);
  color: #ffffff;
  box-shadow:
    0 14rpx 28rpx rgba(226, 62, 62, 0.26),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.22);
}

.field {
  margin-top: 20rpx;
}

.field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.field-label {
  display: block;
  color: #2f241d;
  font-size: 25rpx;
  font-weight: 900;
}

.field-meta {
  color: #9b8372;
  font-size: 21rpx;
  font-weight: 800;
}

.input {
  height: 82rpx;
  padding: 0 24rpx;
  border: 1rpx solid #dfcfbe;
  border-radius: 18rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 250, 244, 0.92));
  color: #211915;
  font-size: 30rpx;
  font-weight: 800;
  box-shadow:
    inset 0 2rpx 8rpx rgba(93, 58, 36, 0.04),
    0 10rpx 22rpx rgba(72, 45, 31, 0.06);
}

.placeholder {
  color: #b09f90;
  font-weight: 700;
}

.submit-button {
  height: 84rpx;
  margin-top: 26rpx;
  border-radius: 20rpx;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 255, 255, 0.24), transparent 28%),
    linear-gradient(135deg, #211916, #8a2418 50%, #ef4444);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 84rpx;
  box-shadow:
    0 18rpx 38rpx rgba(226, 62, 62, 0.32),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
}

.submit-button[disabled] {
  background: linear-gradient(135deg, #b9afa7, #9f958e);
  color: rgba(255, 255, 255, 0.72);
  box-shadow: none;
}

.error-text {
  display: block;
  margin-top: 18rpx;
  color: #b42318;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.4;
  text-align: center;
}

.promise-row {
  display: grid;
  grid-template-columns: 1fr 1rpx 1fr 1rpx 1fr;
  align-items: center;
  margin-top: 20rpx;
  padding: 12rpx 10rpx 2rpx;
}

.promise-item {
  text-align: center;
}

.promise-value {
  display: block;
  color: #7a2318;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 1;
}

.promise-label {
  display: block;
  margin-top: 7rpx;
  color: #8b7b6e;
  font-size: 20rpx;
  font-weight: 800;
  line-height: 1.2;
}

.promise-divider {
  width: 1rpx;
  height: 42rpx;
  background: #e4d5c7;
}
</style>
