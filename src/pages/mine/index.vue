<template>
  <view class="mine-page" :style="pageStyle">
    <view class="mine-hero-card">
      <view class="mine-hero-shade" />
      <view class="mine-hero-spark mine-hero-spark-a" />
      <view class="mine-hero-spark mine-hero-spark-b" />

      <view class="mine-account-row">
        <view
          class="mine-avatar"
          :class="{ 'mine-avatar-with-image': Boolean(accountAvatarPath) }"
          hover-class="mine-avatar-press"
          @tap="chooseAvatar"
        >
          <image
            v-if="accountAvatarPath"
            class="mine-avatar-image"
            :src="accountAvatarPath"
            mode="aspectFill"
            @error="handleAvatarLoadError"
          />
          <text v-else>{{ avatarInitial }}</text>
        </view>
        <view class="mine-account-copy">
          <text class="mine-eyebrow">MY ACCOUNT</text>
          <text class="mine-username">{{ authStore.username || "未登录" }}</text>
          <text class="mine-account-note">{{ accountNote }}</text>
        </view>
      </view>

      <view class="mine-partner-row">
        <view class="mine-partner-copy">
          <text class="mine-partner-kicker">{{ activeStage.name }} · {{ activeEgg.studyStyle }}</text>
          <text class="mine-partner-name">{{ displayPetName }}</text>
        </view>
        <view class="mine-pet-frame">
          <image class="mine-pet-image" :src="activePetAsset" mode="aspectFit" />
        </view>
      </view>
    </view>

    <view class="mine-quick-grid">
      <view class="mine-quick-card">
        <text class="mine-quick-value">{{ petStore.progress?.points || 0 }}</text>
        <text class="mine-quick-label">积分</text>
      </view>
      <view class="mine-quick-card">
        <text class="mine-quick-value">{{ petStore.progress?.streak || 0 }}</text>
        <text class="mine-quick-label">连续天数</text>
      </view>
      <view class="mine-quick-card">
        <text class="mine-quick-value">{{ petStore.todayMinutes }}</text>
        <text class="mine-quick-label">今日分钟</text>
      </view>
      <view class="mine-quick-card">
        <text class="mine-quick-value">{{ petStore.collectionCount }}</text>
        <text class="mine-quick-label">收藏</text>
      </view>
    </view>

    <view class="mine-menu-panel">
      <view class="mine-menu-row" @tap="goProfile">
        <view class="mine-menu-icon mine-archive-icon">档</view>
        <view class="mine-menu-copy">
          <text class="mine-menu-title">成长档案</text>
          <text class="mine-menu-desc">查看进化路线和学习记录</text>
        </view>
        <text class="mine-menu-arrow">›</text>
      </view>
      <view class="mine-menu-row" @tap="goCheckIn">
        <view class="mine-menu-icon mine-check-icon">学</view>
        <view class="mine-menu-copy">
          <text class="mine-menu-title">学习打卡</text>
          <text class="mine-menu-desc">语文、数学、英语每日各一次</text>
        </view>
        <text class="mine-menu-arrow">›</text>
      </view>
      <view class="mine-menu-row" @tap="goShop">
        <view class="mine-menu-icon mine-shop-icon">藏</view>
        <view class="mine-menu-copy">
          <text class="mine-menu-title">伙伴商城</text>
          <text class="mine-menu-desc">用积分收集装扮和房间装饰</text>
        </view>
        <text class="mine-menu-arrow">›</text>
      </view>
      <view class="mine-menu-row" :class="{ disabled: checkingUpdate }" @tap="handleCheckUpdate">
        <view class="mine-menu-icon mine-update-icon">版</view>
        <view class="mine-menu-copy">
          <text class="mine-menu-title">检查更新</text>
          <text class="mine-menu-desc">{{ updateDescription }}</text>
        </view>
        <text class="mine-menu-arrow">›</text>
      </view>
    </view>

    <button class="mine-logout-button" :disabled="authStore.loading" @tap="confirmLogout">退出登录</button>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { appConfig } from "@/config";
import { getEggOption, getPetStageAssetPath, type EggOption } from "@/domain/pet";
import { checkAppUpdate, downloadAndInstallUpdate, type AvailableAppUpdate } from "@/services/app-update";
import { createProfileAvatarStorage, getAccountAvatarPath, saveAccountAvatarPath } from "@/services/profile-avatar";
import { useAuthStore } from "@/stores/auth";
import { usePetStore } from "@/stores/pet";
import { getEggTheme, hexToRgb } from "@/utils/pet-theme";

const authStore = useAuthStore();
const petStore = usePetStore();
const checkingUpdate = ref(false);
const choosingAvatar = ref(false);
const accountAvatarPath = ref("");
const avatarStorage = createProfileAvatarStorage();
const accountAvatarKey = computed(() => authStore.session?.userId || authStore.username || "guest");
const avatarInitial = computed(() => (authStore.username ? authStore.username.slice(0, 1).toUpperCase() : "我"));
const updateDescription = computed(() => `当前版本 ${appConfig.version}，点击检查新版本`);
const progress = computed(() => petStore.progress);
const activeStage = computed(() => petStore.stage);
const activeEgg = computed(() => (progress.value ? getEggOption(progress.value.eggId) : getEggOption("lotusguard")));
const activePetAsset = computed(() =>
  progress.value ? getPetStageAssetPath(progress.value.eggId, activeStage.value.id) : getPetStageAssetPath("lotusguard", "egg"),
);
const displayPetName = computed(() =>
  progress.value && activeStage.value.id === "guardian" ? activeEgg.value.adultName : progress.value?.petName || activeEgg.value.petName,
);
const accountNote = computed(() => (progress.value ? "学习档案已绑定当前账号" : "先选择伙伴后同步成长档案"));
const pageStyle = computed(() => themeStyle(activeEgg.value));

watch(accountAvatarKey, loadAccountAvatar, { immediate: true });
onShow(loadAccountAvatar);

function loadAccountAvatar() {
  accountAvatarPath.value = getAccountAvatarPath(avatarStorage, accountAvatarKey.value);
}

function handleAvatarLoadError() {
  if (!accountAvatarPath.value) {
    return;
  }

  accountAvatarPath.value = saveAccountAvatarPath(avatarStorage, accountAvatarKey.value, "");
}

function chooseAvatar() {
  if (choosingAvatar.value) {
    return;
  }

  choosingAvatar.value = true;

  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    async success(result) {
      const tempFilePath = result.tempFilePaths[0];

      if (!tempFilePath) {
        choosingAvatar.value = false;
        return;
      }

      try {
        const savedPath = await persistAvatarFile(tempFilePath);
        accountAvatarPath.value = saveAccountAvatarPath(avatarStorage, accountAvatarKey.value, savedPath);
        uni.showToast({ title: "头像已更新", icon: "none" });
      } catch (error) {
        uni.showToast({ title: error instanceof Error ? error.message : "头像更新失败", icon: "none" });
      } finally {
        choosingAvatar.value = false;
      }
    },
    fail(error) {
      choosingAvatar.value = false;

      if (!String(error.errMsg || "").toLowerCase().includes("cancel")) {
        uni.showToast({ title: "头像选择失败", icon: "none" });
      }
    },
  });
}

function persistAvatarFile(tempFilePath: string) {
  if (isH5Runtime()) {
    return persistAvatarForH5(tempFilePath);
  }

  return persistAvatarWithSaveFile(tempFilePath);
}

function persistAvatarWithSaveFile(tempFilePath: string) {
  return new Promise<string>((resolve) => {
    const saveFile = (uni as unknown as { saveFile?: typeof uni.saveFile }).saveFile;

    if (!saveFile) {
      resolve(tempFilePath);
      return;
    }

    saveFile({
      tempFilePath,
      success(result) {
        resolve(result.savedFilePath || tempFilePath);
      },
      fail() {
        resolve(tempFilePath);
      },
    });
  });
}

function persistAvatarForH5(tempFilePath: string) {
  return new Promise<string>((resolve, reject) => {
    if (tempFilePath.startsWith("data:")) {
      resolve(tempFilePath);
      return;
    }

    if (typeof FileReader === "undefined") {
      resolve(tempFilePath);
      return;
    }

    fetch(tempFilePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("头像读取失败");
        }
        return response.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(typeof reader.result === "string" ? reader.result : tempFilePath);
        };
        reader.onerror = () => reject(new Error("头像读取失败"));
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
}

function isH5Runtime() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function goProfile() {
  uni.switchTab({ url: "/pages/profile/index" });
}

function goCheckIn() {
  uni.switchTab({ url: "/pages/tools/index" });
}

function goShop() {
  uni.switchTab({ url: "/pages/shop/index" });
}

async function handleCheckUpdate() {
  if (checkingUpdate.value) {
    return;
  }

  checkingUpdate.value = true;
  uni.showLoading({ title: "检查中", mask: true });

  try {
    const result = await checkAppUpdate();
    uni.hideLoading();

    if (result.status === "available") {
      showUpdateModal(result.update);
      return;
    }

    const messageMap = {
      "not-configured": "还没有配置更新地址，打包发布前请先设置 VITE_APP_UPDATE_MANIFEST_URL。",
      "unsupported-platform": "当前平台暂不支持应用内更新，请在 Android App 内检查。",
      "up-to-date": "已经是最新版本啦。",
    } as const;

    uni.showToast({ title: messageMap[result.status], icon: "none" });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: error instanceof Error ? error.message : "检查更新失败", icon: "none" });
  } finally {
    checkingUpdate.value = false;
  }
}

function showUpdateModal(update: AvailableAppUpdate) {
  const notes = update.notes.length ? `\n\n${update.notes.map((item) => `· ${item}`).join("\n")}` : "";

  uni.showModal({
    title: update.title,
    content: `发现版本 ${update.versionName}${notes}`,
    showCancel: !update.force,
    confirmText: update.force ? "立即更新" : "更新",
    success(result) {
      if (result.confirm) {
        installUpdate(update);
      }
    },
  });
}

async function installUpdate(update: AvailableAppUpdate) {
  uni.showLoading({ title: "下载中", mask: true });

  try {
    await downloadAndInstallUpdate(update);
    uni.hideLoading();
    uni.showToast({ title: "安装完成", icon: "none" });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: error instanceof Error ? error.message : "安装更新失败", icon: "none" });
  }
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

function themeStyle(egg: EggOption) {
  const theme = getEggTheme(egg);

  return [
    `--mine-bg:${theme.soft}`,
    `--mine-bg-deep:${theme.light}`,
    `--mine-dark:${theme.dark}`,
    `--mine-deep:${theme.deep}`,
    `--mine-mid:${theme.mid}`,
    `--mine-light:${theme.light}`,
    `--mine-hot:${theme.hot}`,
    `--mine-soft:${theme.soft}`,
    `--mine-dark-rgb:${hexToRgb(theme.dark)}`,
    `--mine-deep-rgb:${hexToRgb(theme.deep)}`,
    `--mine-mid-rgb:${hexToRgb(theme.mid)}`,
    `--mine-hot-rgb:${hexToRgb(theme.hot)}`,
  ].join(";");
}
</script>

<style>
.mine-page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 24rpx 28rpx 132rpx;
  background:
    radial-gradient(circle at 18% -4%, rgba(var(--mine-hot-rgb), 0.2), transparent 34%),
    radial-gradient(circle at 92% 12%, rgba(var(--mine-mid-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, var(--mine-bg-deep, #f4fbf6) 0%, #fbfcfb 48%, var(--mine-bg, #f4fbf6) 100%);
}

.mine-hero-card {
  position: relative;
  overflow: hidden;
  min-height: 350rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  border-radius: 30rpx;
  padding: 30rpx;
  background:
    radial-gradient(circle at 84% 20%, rgba(var(--mine-hot-rgb), 0.42), transparent 30%),
    radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.22), transparent 26%),
    linear-gradient(145deg, var(--mine-deep) 0%, var(--mine-dark) 50%, #05070d 100%);
  color: #ffffff;
  box-shadow: 0 24rpx 60rpx rgba(var(--mine-dark-rgb), 0.26);
  isolation: isolate;
}

.mine-hero-shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(4, 7, 14, 0.4) 0%, rgba(4, 7, 14, 0.12) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(1, 4, 8, 0.22));
}

.mine-hero-spark {
  position: absolute;
  z-index: 0;
  border: 2rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  pointer-events: none;
}

.mine-hero-spark-a {
  top: -126rpx;
  right: -150rpx;
  width: 370rpx;
  height: 370rpx;
}

.mine-hero-spark-b {
  right: 78rpx;
  bottom: -116rpx;
  width: 250rpx;
  height: 250rpx;
  border-color: rgba(var(--mine-hot-rgb), 0.34);
}

.mine-account-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.mine-avatar {
  position: relative;
  overflow: hidden;
  display: flex;
  flex: none;
  width: 104rpx;
  height: 104rpx;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.42);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 42rpx;
  font-weight: 900;
  backdrop-filter: blur(12rpx);
}

.mine-avatar-with-image {
  border-color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.08);
}

.mine-avatar-press {
  opacity: 0.82;
  transform: scale(0.98);
}

.mine-avatar-image {
  width: 100%;
  height: 100%;
}

.mine-account-copy {
  min-width: 0;
  flex: 1;
}

.mine-eyebrow {
  display: block;
  color: var(--mine-light);
  font-size: 20rpx;
  font-weight: 900;
}

.mine-username {
  display: block;
  overflow: hidden;
  margin-top: 6rpx;
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-account-note {
  display: block;
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 23rpx;
  font-weight: 800;
}

.mine-partner-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 30rpx;
}

.mine-partner-copy {
  min-width: 0;
  flex: 1;
}

.mine-partner-kicker {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8rpx 14rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  color: var(--mine-light);
  font-size: 20rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-partner-name {
  display: block;
  overflow: hidden;
  margin-top: 14rpx;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1.12;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mine-pet-frame {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 150rpx;
  height: 150rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 34rpx;
  background:
    radial-gradient(circle at 36% 22%, rgba(255, 255, 255, 0.42), transparent 26%),
    radial-gradient(circle, rgba(var(--mine-hot-rgb), 0.44), rgba(var(--mine-mid-rgb), 0.18) 56%, transparent 74%);
  box-shadow: 0 0 56rpx rgba(var(--mine-hot-rgb), 0.24);
}

.mine-pet-image {
  width: 138rpx;
  height: 138rpx;
  filter: drop-shadow(0 18rpx 24rpx rgba(0, 0, 0, 0.34));
}

.mine-quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.mine-quick-card {
  min-height: 126rpx;
  padding: 22rpx 10rpx;
  border: 1rpx solid rgba(var(--mine-mid-rgb), 0.18);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
  box-shadow: 0 14rpx 34rpx rgba(var(--mine-mid-rgb), 0.08);
}

.mine-quick-value {
  display: block;
  color: var(--mine-deep);
  font-size: 34rpx;
  font-weight: 900;
}

.mine-quick-label {
  display: block;
  margin-top: 8rpx;
  color: #687487;
  font-size: 20rpx;
  font-weight: 800;
}

.mine-menu-panel {
  position: relative;
  overflow: hidden;
  margin-top: 20rpx;
  padding: 6rpx 24rpx;
  border: 1rpx solid rgba(var(--mine-mid-rgb), 0.18);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18rpx 44rpx rgba(var(--mine-mid-rgb), 0.08);
}

.mine-menu-panel::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 6rpx;
  background: linear-gradient(90deg, var(--mine-deep), var(--mine-hot), var(--mine-mid));
  content: "";
  opacity: 0.78;
}

.mine-menu-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx 0;
  border-top: 1rpx solid rgba(var(--mine-mid-rgb), 0.12);
}

.mine-menu-row:first-child {
  border-top: 0;
}

.mine-menu-row.disabled {
  opacity: 0.62;
}

.mine-menu-icon {
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

.mine-archive-icon {
  background: linear-gradient(135deg, var(--mine-deep), var(--mine-mid));
}

.mine-check-icon {
  background: linear-gradient(135deg, var(--mine-dark), var(--mine-deep));
}

.mine-shop-icon {
  background: linear-gradient(135deg, #7c2d12, var(--mine-hot));
}

.mine-update-icon {
  background: linear-gradient(135deg, var(--mine-deep), #22c55e);
}

.mine-menu-copy {
  min-width: 0;
  flex: 1;
}

.mine-menu-title {
  display: block;
  color: #203047;
  font-size: 29rpx;
  font-weight: 900;
}

.mine-menu-desc {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 23rpx;
  line-height: 1.36;
}

.mine-menu-arrow {
  color: #94a3b8;
  font-size: 42rpx;
  font-weight: 300;
}

.mine-logout-button {
  width: 100%;
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
