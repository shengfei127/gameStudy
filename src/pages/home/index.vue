<template>
  <view class="page" :style="pageStyle">
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
                <image class="card-egg-image" :src="getPetEggCutoutPath(egg.id)" mode="aspectFit" />
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
        <button class="primary-button themed-button" :disabled="petStore.loading" @tap="startJourney">
          {{ startButtonLabel }}
        </button>
      </view>
    </view>

    <view v-else class="dashboard">
      <view class="pet-scene" :style="activeStyle">
        <image
          v-if="activeEgg"
          class="scene-backdrop"
          :src="getPetAssetPath(activeEgg.id, 'adult')"
          mode="aspectFill"
        />
        <view class="scene-shade" />

        <view class="scene-head">
          <view class="stage-chip">
            <text class="scene-label">{{ activeStage.name }}</text>
          </view>
          <view class="points-pill">
            <text class="points-value">{{ progress.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>

        <view class="scene-title-block">
          <text class="scene-title">{{ displayName }}</text>
          <text class="stage-description">{{ activeStage.description }}</text>
        </view>

        <view class="avatar-stage" :class="{ 'avatar-stage-egg': activeStage.id === 'egg' }">
          <view class="avatar-halo" />
          <view class="avatar-crystal">
            <image
              v-if="activeStage.id === 'egg'"
              class="stage-egg-image"
              :src="getPetEggCutoutPath(progress.eggId)"
              mode="aspectFit"
            />
            <PetAvatar v-else :egg-id="progress.eggId" :stage-id="activeStage.id" size="large" />
          </view>
          <view class="avatar-base" />
        </view>

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
          <text class="section-note">积分换成长</text>
        </view>
        <view class="feed-list">
          <view v-for="item in feedItems" :key="item.id" class="feed-row">
            <view class="feed-copy">
              <text class="feed-name">{{ item.name }}</text>
              <text class="feed-desc">{{ item.description }}</text>
              <text class="feed-meta">消耗 {{ item.cost }} 积分，成长 +{{ item.growth }}</text>
            </view>
            <button class="feed-button" :disabled="petStore.loading || !canFeed(item.cost)" @tap="handleFeed(item.id)">
              喂养
            </button>
          </view>
        </view>
      </view>

      <view class="section collection-section">
        <view class="section-heading">
          <text class="section-title">收藏装备</text>
          <text class="section-note">{{ petStore.collectionCount }}/{{ shopItemCount }} 已收集</text>
        </view>
        <view class="collection-preview">
          <view v-for="slot in collectionSlots" :key="slot.key" class="collection-chip" :class="{ active: Boolean(equippedBySlot[slot.key]) }">
            <text class="collection-label">{{ slot.label }}</text>
            <text class="collection-value">{{ getEquippedName(slot.key) }}</text>
          </view>
        </view>
        <button class="shop-button" @tap="goShop">去商城收集</button>
      </view>

      <button class="primary-button themed-button" @tap="goCheckIn">去学习打卡</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PetAvatar from "@/components/PetAvatar.vue";
import { EGG_OPTIONS, FEED_ITEMS, SHOP_ITEMS, getEggOption, getPetAssetPath, getPetEggCutoutPath, getShopItem } from "@/domain/pet";
import type { EggId, EggOption, FeedItem, ShopItemSlot } from "@/domain/pet";
import { usePetStore } from "@/stores/pet";
import { getEggTheme, hexToRgb } from "@/utils/pet-theme";

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
const selectedEggAsset = computed(() => getPetEggCutoutPath(selectedEgg.value.id));
const displayName = computed(() =>
  activeEgg.value && activeStage.value.id === "guardian" ? activeEgg.value.adultName : progress.value?.petName,
);
const selectedStyle = computed(() => panelStyle(selectedEgg.value));
const activeStyle = computed(() => (activeEgg.value ? panelStyle(activeEgg.value) : ""));
const pageEgg = computed(() => activeEgg.value || selectedEgg.value);
const pageStyle = computed(() => themeStyle(pageEgg.value));
const startButtonLabel = computed(() => (petStore.loading ? "正在同步..." : `选择 ${selectedEgg.value.name}，开始孵化`));
const shopItemCount = SHOP_ITEMS.length;
const equippedBySlot = computed(() => progress.value?.equippedItems || {});
const collectionSlots: Array<{ key: ShopItemSlot; label: string }> = [
  { key: "head", label: "头饰" },
  { key: "aura", label: "光环" },
  { key: "wall", label: "房间" },
  { key: "lamp", label: "台灯" },
];

function selectEgg(eggId: EggId) {
  selectedEggId.value = eggId;
}

async function startJourney() {
  try {
    await petStore.chooseEgg(selectedEggId.value);
    uni.showToast({ title: "伙伴已孵化", icon: "none" });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : "孵化失败", icon: "none" });
  }
}

function canFeed(cost: number) {
  return Boolean(progress.value && progress.value.points >= cost);
}

async function handleFeed(itemId: FeedItem["id"]) {
  try {
    const result = await petStore.feed(itemId);
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

function goShop() {
  uni.switchTab({ url: "/pages/shop/index" });
}

function getEquippedName(slot: ShopItemSlot) {
  const itemId = equippedBySlot.value[slot];
  return itemId ? getShopItem(itemId).shortName : "未装";
}

function panelStyle(egg: EggOption) {
  const theme = getEggTheme(egg);

  return [
    `--panel-shell:${egg.palette.shell}`,
    `--panel-accent:${egg.palette.accent}`,
    `--panel-glow:${egg.palette.glow}`,
    `--panel-ink:${egg.palette.ink}`,
    `--theme-dark:${theme.dark}`,
    `--theme-deep:${theme.deep}`,
    `--theme-mid:${theme.mid}`,
    `--theme-light:${theme.light}`,
    `--theme-hot:${theme.hot}`,
    `--theme-soft:${theme.soft}`,
    `--theme-dark-rgb:${hexToRgb(theme.dark)}`,
    `--theme-deep-rgb:${hexToRgb(theme.deep)}`,
    `--theme-hot-rgb:${hexToRgb(theme.hot)}`,
  ].join(";");
}

function cardStyle(egg: EggOption) {
  const theme = getEggTheme(egg);

  return [
    `--card-shell:${egg.palette.shell}`,
    `--card-accent:${egg.palette.accent}`,
    `--card-glow:${egg.palette.glow}`,
    `--card-ink:${egg.palette.ink}`,
    `--card-dark:${theme.dark}`,
    `--card-hot:${theme.hot}`,
    `--card-hot-rgb:${hexToRgb(theme.hot)}`,
  ].join(";");
}

function themeStyle(egg: EggOption) {
  const theme = getEggTheme(egg);

  return [
    `--app-bg:${theme.soft}`,
    `--app-bg-deep:${theme.light}`,
    `--button-start:${theme.deep}`,
    `--button-end:${theme.mid}`,
    `--button-glow:${theme.hot}`,
    `--button-glow-rgb:${hexToRgb(theme.hot)}`,
    `--surface-border-rgb:${hexToRgb(theme.mid)}`,
    `--surface-tint:${theme.light}`,
  ].join(";");
}
</script>

<style>
.page {
  box-sizing: border-box;
  width: 100%;
  max-width: 760rpx;
  min-height: 100vh;
  overflow-x: hidden;
  margin: 0 auto;
  padding: 18rpx 24rpx 0;
  background:
    radial-gradient(circle at 24% 0%, var(--app-bg-deep, #f2f6f3), transparent 38%),
    linear-gradient(180deg, var(--app-bg, #f2f6f3), #f7faf8 56%, var(--app-bg, #f2f6f3));
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
  gap: 18rpx;
  padding-bottom: 112rpx;
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
    radial-gradient(circle at 84% 78%, var(--theme-hot), transparent 34%),
    linear-gradient(150deg, var(--theme-light) 0%, var(--panel-shell) 47%, var(--theme-soft) 100%);
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
  opacity: 1;
  transform: scale(1.06);
  filter: saturate(1.18) contrast(1.12) brightness(0.92);
}

.hero-vignette {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.36) 34%, rgba(16, 27, 42, 0.1) 70%, rgba(var(--theme-dark-rgb), 0.42) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(16, 27, 42, 0.06) 42%, rgba(var(--theme-dark-rgb), 0.46) 100%),
    radial-gradient(circle at 66% 35%, rgba(255, 255, 255, 0), rgba(var(--theme-deep-rgb), 0.48) 88%);
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
    0 14rpx 30rpx rgba(var(--theme-hot-rgb), 0.18);
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
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.section-title {
  display: block;
  color: #203047;
  font-size: 30rpx;
  font-weight: 900;
}

.section-note {
  min-width: 0;
  flex: 1;
  color: #7a8494;
  font-size: 21rpx;
  line-height: 1.35;
  text-align: right;
  white-space: nowrap;
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
    radial-gradient(circle at 86% 16%, var(--card-hot), transparent 34%),
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
  background: linear-gradient(135deg, var(--button-start, #203047), var(--button-end, #203047));
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 92rpx;
  box-shadow: 0 18rpx 38rpx rgba(var(--button-glow-rgb), 0.32);
}

.pet-scene {
  position: relative;
  overflow: hidden;
  min-height: 724rpx;
  padding: 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 76% 24%, rgba(255, 255, 255, 0.28), transparent 24%),
    linear-gradient(150deg, var(--theme-deep) 0%, var(--theme-dark) 46%, #070a10 100%);
  box-shadow: 0 28rpx 70rpx rgba(var(--theme-dark-rgb), 0.38);
  color: #ffffff;
  isolation: isolate;
}

.scene-backdrop {
  position: absolute;
  inset: 0;
  z-index: -3;
  width: 100%;
  height: 100%;
  opacity: 0.66;
  transform: scale(1.08);
  filter: saturate(1.28) contrast(1.24) brightness(0.64);
}

.scene-shade {
  position: absolute;
  z-index: -2;
  inset: 0;
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.16), transparent 24%),
    radial-gradient(circle at 50% 58%, rgba(var(--theme-hot-rgb), 0.66), transparent 35%),
    linear-gradient(180deg, rgba(5, 8, 14, 0.38), rgba(5, 8, 14, 0.94) 78%, rgba(2, 4, 8, 0.98));
  opacity: 0.92;
}

.pet-scene::before {
  position: absolute;
  right: -120rpx;
  bottom: -150rpx;
  z-index: -1;
  width: 520rpx;
  height: 520rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 50%;
  content: "";
}

.pet-scene::after {
  position: absolute;
  top: 166rpx;
  left: 50%;
  z-index: -1;
  width: 560rpx;
  height: 560rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--theme-hot-rgb), 0.24), rgba(255, 255, 255, 0.08) 34%, transparent 70%);
  content: "";
  transform: translateX(-50%);
}

.scene-head,
.progress-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.stage-chip {
  padding: 10rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.26);
  border-radius: 999rpx;
  background: rgba(var(--theme-hot-rgb), 0.24);
  backdrop-filter: blur(12rpx);
}

.scene-label {
  display: block;
  color: var(--theme-light);
  font-size: 24rpx;
  font-weight: 900;
}

.scene-title-block {
  position: relative;
  z-index: 1;
  max-width: 420rpx;
  margin-top: 28rpx;
}

.scene-title {
  display: block;
  color: #ffffff;
  font-size: 54rpx;
  font-weight: 900;
  line-height: 1.05;
  text-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.28);
}

.points-pill {
  min-width: 126rpx;
  padding: 14rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.14);
  text-align: center;
  backdrop-filter: blur(14rpx);
}

.points-value {
  display: block;
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 900;
}

.points-label,
.progress-label {
  color: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
}

.feed-meta {
  color: #708093;
  font-size: 22rpx;
}

.avatar-stage {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 430rpx;
  margin-top: 4rpx;
  padding: 10rpx 0 0;
}

.avatar-stage::before {
  position: absolute;
  bottom: 22rpx;
  left: 50%;
  width: 520rpx;
  height: 132rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(var(--theme-hot-rgb), 0.48), rgba(var(--theme-hot-rgb), 0.16) 46%, transparent 72%);
  content: "";
  transform: translateX(-50%);
}

.avatar-stage::after {
  position: absolute;
  top: 6rpx;
  left: 50%;
  width: 260rpx;
  height: 430rpx;
  border-radius: 44% 44% 52% 52%;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(var(--theme-hot-rgb), 0.28) 38%, transparent 82%);
  content: "";
  filter: blur(4rpx);
  transform: translateX(-50%);
}

.avatar-halo {
  position: absolute;
  top: 10rpx;
  left: 50%;
  width: 438rpx;
  height: 438rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  background:
    radial-gradient(circle at 48% 34%, rgba(255, 255, 255, 0.22), transparent 32%),
    radial-gradient(circle at center, rgba(var(--theme-hot-rgb), 0.3), transparent 64%);
  box-shadow:
    inset 0 0 0 28rpx rgba(255, 255, 255, 0.018),
    0 0 64rpx rgba(var(--theme-hot-rgb), 0.22);
  transform: translateX(-50%);
}

.avatar-crystal {
  position: relative;
  z-index: 1;
  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  width: 348rpx;
  height: 348rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.34);
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 16%, rgba(255, 255, 255, 0.42), transparent 22%),
    radial-gradient(circle at 50% 78%, rgba(var(--theme-hot-rgb), 0.32), transparent 62%),
    rgba(255, 255, 255, 0.06);
  box-shadow:
    inset 0 0 36rpx rgba(255, 255, 255, 0.14),
    inset 0 -26rpx 42rpx rgba(0, 0, 0, 0.28),
    0 28rpx 58rpx rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(4rpx);
}

.avatar-crystal::before {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    radial-gradient(ellipse at 32% 14%, rgba(255, 255, 255, 0.34), transparent 24%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.14), transparent 36%, rgba(0, 0, 0, 0.12) 100%),
    linear-gradient(180deg, transparent 62%, rgba(0, 0, 0, 0.28) 100%);
  content: "";
  pointer-events: none;
}

.avatar-crystal::after {
  position: absolute;
  z-index: 3;
  top: 20rpx;
  left: 58rpx;
  width: 86rpx;
  height: 168rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), transparent);
  content: "";
  transform: rotate(18deg);
}

.avatar-stage-egg .avatar-crystal {
  width: 360rpx;
  height: 450rpx;
  border-color: rgba(255, 255, 255, 0.42);
  border-radius: 48% 48% 43% 43% / 55% 55% 44% 44%;
  background:
    radial-gradient(ellipse at 34% 12%, rgba(255, 255, 255, 0.52), transparent 24%),
    radial-gradient(ellipse at 50% 78%, rgba(var(--theme-hot-rgb), 0.34), transparent 68%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(var(--theme-hot-rgb), 0.12) 48%, rgba(0, 0, 0, 0.22));
  box-shadow:
    inset 0 0 44rpx rgba(255, 255, 255, 0.17),
    inset 0 -42rpx 58rpx rgba(0, 0, 0, 0.32),
    0 34rpx 70rpx rgba(0, 0, 0, 0.42),
    0 0 76rpx rgba(var(--theme-hot-rgb), 0.24);
}

.avatar-stage-egg .avatar-halo {
  top: 18rpx;
  width: 470rpx;
  height: 470rpx;
}

.stage-egg-image {
  position: relative;
  z-index: 1;
  width: 116%;
  height: 116%;
  filter: saturate(1.12) contrast(1.1) drop-shadow(0 28rpx 34rpx rgba(0, 0, 0, 0.28));
  transform: translateY(-1%);
}

.avatar-crystal .pet-avatar {
  z-index: 1;
}

.avatar-crystal .pet-avatar.large {
  width: 100%;
  height: 100%;
}

.avatar-stage-egg .pet-avatar.large {
  width: 360rpx;
  height: 418rpx;
}

.avatar-base {
  position: absolute;
  bottom: 6rpx;
  left: 50%;
  z-index: 0;
  width: 430rpx;
  height: 82rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3), rgba(var(--theme-hot-rgb), 0.24) 42%, rgba(0, 0, 0, 0.28) 100%);
  box-shadow:
    0 18rpx 34rpx rgba(0, 0, 0, 0.3),
    0 0 42rpx rgba(var(--theme-hot-rgb), 0.22);
  transform: translateX(-50%);
}

.stage-description {
  display: block;
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.76);
  font-size: 26rpx;
  line-height: 1.45;
}

.progress-block {
  margin-top: 18rpx;
}

.bar {
  overflow: hidden;
  height: 16rpx;
  margin-top: 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
}

.bar-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, var(--theme-hot), var(--theme-mid));
  box-shadow: 0 0 24rpx rgba(var(--theme-hot-rgb), 0.54);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
}

.stat-card,
.section {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 10% -10%, rgba(var(--button-glow-rgb), 0.3), transparent 42%),
    radial-gradient(circle at 92% 0%, rgba(var(--surface-border-rgb), 0.18), transparent 38%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.86)),
    var(--surface-tint, #ffffff);
}

.stat-card {
  min-height: 120rpx;
  border: 1rpx solid rgba(var(--surface-border-rgb), 0.34);
  border-radius: 16rpx;
  padding: 18rpx 10rpx 16rpx;
  text-align: center;
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9),
    0 14rpx 34rpx rgba(var(--surface-border-rgb), 0.14);
}

.stat-card::before {
  position: absolute;
  top: 0;
  right: 18rpx;
  left: 18rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, transparent, var(--button-glow), transparent);
  content: "";
}

.stat-value {
  display: block;
  color: var(--button-start, #203047);
  font-size: 32rpx;
  font-weight: 900;
}

.stat-label {
  display: block;
  margin-top: 4rpx;
  color: #687487;
  font-size: 21rpx;
}

.section {
  border: 1rpx solid rgba(var(--surface-border-rgb), 0.34);
  border-radius: 18rpx;
  padding: 24rpx 26rpx;
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.92),
    0 18rpx 42rpx rgba(var(--surface-border-rgb), 0.16);
}

.section::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 6rpx;
  background: linear-gradient(90deg, var(--button-start), var(--button-glow), var(--button-end));
  content: "";
  opacity: 0.78;
}

.feed-list {
  margin-top: 12rpx;
}

.feed-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 0 20rpx 24rpx;
  border-top: 1rpx solid rgba(var(--surface-border-rgb), 0.16);
}

.feed-row:first-child {
  border-top: 0;
}

.feed-row::before {
  position: absolute;
  top: 28rpx;
  bottom: 28rpx;
  left: 0;
  width: 7rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, var(--button-glow), var(--button-end));
  content: "";
  opacity: 0.86;
}

.feed-copy {
  min-width: 0;
  flex: 1;
}

.feed-name {
  display: block;
  color: #203047;
  font-size: 28rpx;
  font-weight: 850;
}

.feed-desc {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 23rpx;
  line-height: 1.38;
}

.feed-button {
  width: 118rpx;
  height: 60rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, var(--button-start, #203047), var(--button-end, #203047));
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 60rpx;
  box-shadow: 0 10rpx 22rpx rgba(var(--button-glow-rgb), 0.24);
}

.feed-button[disabled] {
  border: 1rpx solid rgba(var(--surface-border-rgb), 0.16);
  background: rgba(var(--surface-border-rgb), 0.1);
  color: rgba(32, 48, 71, 0.42);
  box-shadow: none;
}

.collection-preview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin-top: 18rpx;
}

.collection-chip {
  min-height: 94rpx;
  padding: 14rpx 8rpx;
  border: 1rpx solid rgba(var(--surface-border-rgb), 0.18);
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
}

.collection-chip.active {
  background: linear-gradient(180deg, #ffffff, rgba(var(--button-glow-rgb), 0.16));
  box-shadow: inset 0 0 0 2rpx rgba(var(--surface-border-rgb), 0.1);
}

.collection-label,
.collection-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-label {
  color: #7a8494;
  font-size: 19rpx;
  font-weight: 800;
}

.collection-value {
  margin-top: 8rpx;
  color: #203047;
  font-size: 23rpx;
  font-weight: 900;
}

.shop-button {
  height: 72rpx;
  margin-top: 18rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, var(--button-start, #203047), var(--button-end, #203047));
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 900;
  line-height: 72rpx;
  box-shadow: 0 12rpx 28rpx rgba(var(--button-glow-rgb), 0.18);
}
</style>
