<template>
  <view class="page" :style="pageStyle">
    <view v-if="!progress" class="empty">
      <view class="empty-stage">
        <image class="empty-bg" src="/static/pets/windfire-adult.webp" mode="aspectFill" />
        <view class="empty-shade" />
        <view class="empty-copy">
          <text class="eyebrow">COLLECTION SHOP</text>
          <text class="empty-title">先拥有学习伙伴</text>
          <text class="empty-text">选择宠物蛋后，积分就能换装扮和房间装饰。</text>
          <button class="empty-button" @tap="goHome">去选择伙伴</button>
        </view>
      </view>
    </view>

    <scroll-view v-else class="content" scroll-y enhanced :show-scrollbar="false">
      <view class="hero">
        <view class="hero-top">
          <view>
            <text class="eyebrow">COLLECTION SHOP</text>
            <text class="hero-title">伙伴收藏馆</text>
          </view>
          <view class="points-card">
            <text class="points-value">{{ progress.points }}</text>
            <text class="points-label">可用积分</text>
          </view>
        </view>

        <view class="preview-stage" :style="previewStyle">
          <view class="room-wall" />
          <view class="window-piece room-piece" :class="{ active: Boolean(equippedBySlot.window) }">
            <image v-if="equippedBySlot.window" class="room-piece-image window-image" :src="getItemAsset(equippedBySlot.window)" mode="aspectFit" />
            <text v-else>窗</text>
          </view>
          <view class="room-shelf room-piece" :class="{ active: Boolean(equippedBySlot.decor) }">
            <image v-if="equippedBySlot.decor" class="room-piece-image shelf-image" :src="getItemAsset(equippedBySlot.decor)" mode="aspectFit" />
            <text v-else>奖</text>
          </view>
          <view class="room-desk room-piece" :class="{ active: Boolean(equippedBySlot.desk) }">
            <image v-if="equippedBySlot.desk" class="room-piece-image desk-image" :src="getItemAsset(equippedBySlot.desk)" mode="aspectFit" />
            <text v-else>桌</text>
          </view>
          <view class="room-lamp room-piece" :class="{ active: Boolean(equippedBySlot.lamp) }">
            <image v-if="equippedBySlot.lamp" class="room-piece-image lamp-image" :src="getItemAsset(equippedBySlot.lamp)" mode="aspectFit" />
            <text v-else>灯</text>
          </view>
          <view class="pet-light" />
          <view v-if="equippedBySlot.aura" class="equip-aura" />
          <view v-if="equippedBySlot.effect" class="equip-sparks">
            <text>{{ getItemIcon(equippedBySlot.effect) }}</text>
            <text>{{ getItemIcon(equippedBySlot.effect) }}</text>
            <text>{{ getItemIcon(equippedBySlot.effect) }}</text>
          </view>
          <PetAvatar :egg-id="progress.eggId" :stage-id="petStore.stage.id" size="large" />
          <view class="floor-piece" :class="{ active: Boolean(equippedBySlot.floor) }" />
        </view>

        <view class="equipped-strip">
          <view v-for="slot in visibleSlots" :key="slot.key" class="equip-chip" :class="{ active: Boolean(equippedBySlot[slot.key]) }">
            <text class="equip-chip-label">{{ slot.label }}</text>
            <text class="equip-chip-value">{{ getEquippedName(slot.key) }}</text>
          </view>
        </view>
      </view>

      <view class="collection-summary">
        <view class="summary-item">
          <text class="summary-value">{{ petStore.collectionCount }}</text>
          <text class="summary-label">已收集</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ petStore.outfitCollectionCount }}</text>
          <text class="summary-label">装扮</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ petStore.roomCollectionCount }}</text>
          <text class="summary-label">房间</text>
        </view>
      </view>

      <view class="tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ selected: activeCategory === tab.key }"
          @tap="activeCategory = tab.key"
        >
          <text class="tab-title">{{ tab.title }}</text>
          <text class="tab-count">{{ tab.count }}</text>
        </view>
      </view>

      <view class="shop-list">
        <view v-for="item in visibleItems" :key="item.id" class="item-card" :style="itemStyle(item)">
          <view class="item-orb">
            <image class="item-image" :src="getItemAsset(item.id)" mode="aspectFit" />
            <text class="item-fallback">{{ item.icon }}</text>
          </view>
          <view class="item-copy">
            <view class="item-line">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-rarity" :class="item.rarity">{{ rarityLabel(item.rarity) }}</text>
            </view>
            <text class="item-desc">{{ item.description }}</text>
            <view class="item-meta">
              <text>{{ slotLabel(item.slot) }}</text>
              <text>{{ item.cost }} 积分</text>
            </view>
          </view>
          <button
            class="item-button"
            :class="{ owned: isOwned(item.id), equipped: isEquipped(item) }"
            :disabled="petStore.loading || (!isOwned(item.id) && !canBuy(item.cost)) || isEquipped(item)"
            @tap="handleItemTap(item)"
          >
            {{ buttonLabel(item) }}
          </button>
        </view>
      </view>

      <view class="bottom-space" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import PetAvatar from "@/components/PetAvatar.vue";
import {
  getEggOption,
  getShopItem,
  getShopItemAssetPath,
  SHOP_ITEMS,
  type ShopItem,
  type ShopItemCategory,
  type ShopItemId,
  type ShopItemRarity,
  type ShopItemSlot,
} from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const activeCategory = ref<ShopItemCategory>("outfit");
const progress = computed(() => petStore.progress);
const activeEgg = computed(() => (progress.value ? getEggOption(progress.value.eggId) : null));
const ownedSet = computed(() => new Set(progress.value?.ownedItemIds || []));
const equippedBySlot = computed(() => progress.value?.equippedItems || {});
const visibleItems = computed(() => SHOP_ITEMS.filter((item) => item.category === activeCategory.value));
const tabs = computed(() => [
  {
    key: "outfit" as const,
    title: "伙伴装扮",
    count: `${petStore.outfitCollectionCount}/10`,
  },
  {
    key: "room" as const,
    title: "房间装饰",
    count: `${petStore.roomCollectionCount}/10`,
  },
]);
const visibleSlots: Array<{ key: ShopItemSlot; label: string }> = [
  { key: "head", label: "头饰" },
  { key: "back", label: "背饰" },
  { key: "hand", label: "手持" },
  { key: "aura", label: "光环" },
  { key: "wall", label: "背景" },
  { key: "lamp", label: "台灯" },
];
const pageStyle = computed(() => {
  const egg = activeEgg.value;
  if (!egg) {
    return "";
  }

  return [
    `--egg-accent:${egg.palette.accent}`,
    `--egg-accent-rgb:${hexToRgb(egg.palette.accent)}`,
    `--egg-ink:${egg.palette.ink}`,
    `--egg-shell:${egg.palette.shell}`,
    `--egg-glow:${egg.palette.glow}`,
  ].join(";");
});
const previewStyle = computed(() => {
  const wall = getEquippedItem("wall");
  const floor = getEquippedItem("floor");
  const aura = getEquippedItem("aura");

  return [
    `--room-wall:${wall?.theme || activeEgg.value?.palette.ink || "#10231d"}`,
    `--room-wall-accent:${wall?.accent || activeEgg.value?.palette.accent || "#2f855a"}`,
    `--room-floor:${floor?.theme || "#243148"}`,
    `--room-floor-accent:${floor?.accent || activeEgg.value?.palette.glow || "#eef5ff"}`,
    `--room-light:${aura?.accent || activeEgg.value?.palette.glow || "#ffffff"}`,
  ].join(";");
});

function getEquippedItem(slot: ShopItemSlot) {
  const itemId = equippedBySlot.value[slot];
  return itemId ? getShopItem(itemId) : null;
}

function getEquippedName(slot: ShopItemSlot) {
  return getEquippedItem(slot)?.shortName || "未装";
}

function getItemIcon(itemId: ShopItemId) {
  return getShopItem(itemId).icon;
}

function getItemAsset(itemId: ShopItemId) {
  return getShopItemAssetPath(itemId);
}

function isOwned(itemId: ShopItemId) {
  return ownedSet.value.has(itemId);
}

function isEquipped(item: ShopItem) {
  return equippedBySlot.value[item.slot] === item.id;
}

function canBuy(cost: number) {
  return Boolean(progress.value && progress.value.points >= cost);
}

function buttonLabel(item: ShopItem) {
  if (isEquipped(item)) {
    return "已应用";
  }

  if (isOwned(item.id)) {
    return "应用";
  }

  return canBuy(item.cost) ? "购买" : "积分不足";
}

async function handleItemTap(item: ShopItem) {
  if (isEquipped(item)) {
    return;
  }

  try {
    if (!isOwned(item.id)) {
      await petStore.buyShopItem(item.id);
      uni.showToast({ title: `已收集${item.name}`, icon: "none" });
      return;
    }

    await petStore.equipShopItem(item.id);
    uni.showToast({ title: `${item.shortName}已应用`, icon: "none" });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : "操作失败", icon: "none" });
  }
}

function rarityLabel(rarity: ShopItemRarity) {
  const labels: Record<ShopItemRarity, string> = {
    common: "普通",
    rare: "稀有",
    epic: "史诗",
  };
  return labels[rarity];
}

function slotLabel(slot: ShopItemSlot) {
  const labels: Record<ShopItemSlot, string> = {
    head: "头饰",
    back: "背饰",
    hand: "手持",
    aura: "光环",
    effect: "特效",
    wall: "背景",
    window: "窗景",
    desk: "桌面",
    lamp: "灯光",
    decor: "摆件",
    floor: "地面",
  };
  return labels[slot];
}

function itemStyle(item: ShopItem) {
  return [`--item-theme:${item.theme}`, `--item-accent:${item.accent}`, `--item-theme-rgb:${hexToRgb(item.theme)}`].join(";");
}

function goHome() {
  uni.switchTab({ url: "/pages/home/index" });
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((item) => item + item)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);

  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}
</script>

<style>
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 16% 0%, rgba(var(--egg-accent-rgb, 47, 133, 90), 0.18), transparent 34%),
    linear-gradient(180deg, var(--egg-glow, #f5faf8) 0%, #f8fbf8 48%, var(--egg-shell, #eef6f2) 100%);
}

.content {
  box-sizing: border-box;
  height: 100vh;
  padding: 22rpx 26rpx 0;
}

.empty {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 28rpx;
}

.empty-stage {
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 56rpx);
  border-radius: 34rpx;
  background: #0b1018;
  box-shadow: 0 28rpx 70rpx rgba(17, 24, 39, 0.18);
}

.empty-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.56;
  filter: saturate(1.15) brightness(0.68);
}

.empty-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(8, 12, 18, 0.92), rgba(8, 12, 18, 0.36));
}

.empty-copy {
  position: relative;
  z-index: 1;
  max-width: 530rpx;
  padding: 78rpx 40rpx;
}

.eyebrow {
  display: block;
  color: var(--egg-accent, #14b8a6);
  font-size: 21rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.empty-title,
.hero-title {
  display: block;
  color: #ffffff;
  font-size: 50rpx;
  font-weight: 900;
  line-height: 1.06;
}

.empty-title {
  margin-top: 16rpx;
}

.empty-text {
  display: block;
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 27rpx;
  font-weight: 700;
  line-height: 1.48;
}

.empty-button {
  width: 240rpx;
  height: 80rpx;
  margin-top: 28rpx;
  border-radius: 18rpx;
  background: #ffffff;
  color: #10231d;
  font-size: 27rpx;
  font-weight: 900;
  line-height: 80rpx;
}

.hero {
  overflow: hidden;
  padding: 28rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 74% 18%, rgba(255, 255, 255, 0.18), transparent 26%),
    linear-gradient(150deg, #111827, var(--egg-ink, #17433d));
  box-shadow: 0 26rpx 64rpx rgba(var(--egg-accent-rgb, 47, 133, 90), 0.2);
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 22rpx;
}

.hero-title {
  margin-top: 10rpx;
  font-size: 46rpx;
}

.points-card {
  flex: none;
  min-width: 144rpx;
  padding: 14rpx 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.14);
  text-align: center;
  backdrop-filter: blur(12rpx);
}

.points-value {
  display: block;
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 900;
}

.points-label {
  display: block;
  color: rgba(255, 255, 255, 0.72);
  font-size: 21rpx;
  font-weight: 800;
}

.preview-stage {
  position: relative;
  overflow: hidden;
  height: 520rpx;
  margin-top: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.2), transparent 30%),
    linear-gradient(180deg, var(--room-wall), #080b10 72%);
}

.room-wall {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.14), transparent 20%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent 44%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1rpx, transparent 1rpx);
  background-size: auto, auto, 92rpx 100%;
  opacity: 0.78;
}

.window-piece,
.room-shelf,
.room-desk,
.room-lamp {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  font-weight: 900;
}

.window-piece.active,
.room-shelf.active,
.room-desk.active,
.room-lamp.active {
  border-color: rgba(255, 255, 255, 0.38);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.08));
  color: #ffffff;
  box-shadow: 0 0 28rpx rgba(255, 255, 255, 0.14);
}

.room-piece-image {
  position: relative;
  z-index: 2;
  width: 122rpx;
  height: 122rpx;
  filter: drop-shadow(0 14rpx 14rpx rgba(0, 0, 0, 0.26));
}

.window-image {
  width: 146rpx;
  height: 146rpx;
}

.shelf-image {
  width: 132rpx;
  height: 132rpx;
}

.desk-image {
  width: 174rpx;
  height: 174rpx;
}

.lamp-image {
  width: 118rpx;
  height: 118rpx;
}

.window-piece {
  top: 52rpx;
  right: 54rpx;
  width: 132rpx;
  height: 112rpx;
  border-radius: 24rpx;
}

.room-shelf {
  top: 180rpx;
  left: 48rpx;
  width: 150rpx;
  height: 58rpx;
  border-radius: 16rpx;
}

.room-desk {
  right: 56rpx;
  bottom: 98rpx;
  width: 170rpx;
  height: 70rpx;
  border-radius: 18rpx;
}

.room-lamp {
  right: 104rpx;
  bottom: 166rpx;
  width: 64rpx;
  height: 84rpx;
  border-radius: 999rpx 999rpx 18rpx 18rpx;
}

.room-lamp.active {
  box-shadow: 0 0 52rpx var(--room-light);
}

.pet-light {
  position: absolute;
  left: 50%;
  bottom: 72rpx;
  width: 460rpx;
  height: 240rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.22), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.18) 42%, transparent 72%);
  transform: translateX(-50%);
}

.preview-stage .pet-avatar {
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: 86rpx;
  transform: translateX(-50%);
}

.equip-aura {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 120rpx;
  width: 340rpx;
  height: 340rpx;
  border: 2rpx solid var(--room-light);
  border-radius: 50%;
  box-shadow:
    inset 0 0 44rpx rgba(255, 255, 255, 0.14),
    0 0 48rpx var(--room-light);
  transform: translateX(-50%);
}

.equip-sparks {
  position: absolute;
  z-index: 5;
  inset: 100rpx 112rpx 150rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 900;
}

.equip-sparks text {
  position: absolute;
}

.equip-sparks text:nth-child(1) {
  top: 20rpx;
  left: 18rpx;
}

.equip-sparks text:nth-child(2) {
  top: 78rpx;
  right: 24rpx;
}

.equip-sparks text:nth-child(3) {
  right: 112rpx;
  bottom: 18rpx;
}

.floor-piece {
  position: absolute;
  right: -60rpx;
  bottom: -76rpx;
  left: -60rpx;
  height: 190rpx;
  border-radius: 50% 50% 0 0;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18), transparent 44%),
    linear-gradient(135deg, var(--room-floor), var(--room-floor-accent));
  opacity: 0.72;
}

.floor-piece.active {
  opacity: 0.95;
}

.equipped-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  margin-top: 16rpx;
}

.equip-chip {
  min-width: 0;
  padding: 12rpx 10rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.16);
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.08);
}

.equip-chip.active {
  background: rgba(255, 255, 255, 0.18);
}

.equip-chip-label,
.equip-chip-value {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equip-chip-label {
  color: rgba(255, 255, 255, 0.54);
  font-size: 19rpx;
  font-weight: 800;
}

.equip-chip-value {
  margin-top: 4rpx;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 900;
}

.collection-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.summary-item {
  min-height: 112rpx;
  padding: 18rpx 8rpx;
  border: 1rpx solid rgba(var(--egg-accent-rgb, 47, 133, 90), 0.18);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.92);
  text-align: center;
}

.summary-value {
  display: block;
  color: var(--egg-ink, #17433d);
  font-size: 34rpx;
  font-weight: 900;
}

.summary-label {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 22rpx;
  font-weight: 800;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
  padding: 8rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.7);
}

.tab {
  height: 84rpx;
  border-radius: 16rpx;
  text-align: center;
}

.tab.selected {
  background: linear-gradient(135deg, var(--egg-ink, #17433d), var(--egg-accent, #14b8a6));
  box-shadow: 0 12rpx 26rpx rgba(var(--egg-accent-rgb, 47, 133, 90), 0.22);
}

.tab-title,
.tab-count {
  display: block;
}

.tab-title {
  padding-top: 12rpx;
  color: #42536b;
  font-size: 25rpx;
  font-weight: 900;
}

.tab-count {
  margin-top: 4rpx;
  color: #7b8797;
  font-size: 19rpx;
  font-weight: 900;
}

.tab.selected .tab-title,
.tab.selected .tab-count {
  color: #ffffff;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 18rpx;
}

.item-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 176rpx;
  padding: 18rpx;
  border: 1rpx solid rgba(var(--item-theme-rgb), 0.2);
  border-radius: 22rpx;
  background:
    radial-gradient(circle at 10% 8%, rgba(var(--item-theme-rgb), 0.16), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.9));
  box-shadow:
    0 14rpx 34rpx rgba(var(--item-theme-rgb), 0.08),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88);
}

.item-orb {
  position: relative;
  display: flex;
  flex: none;
  width: 118rpx;
  height: 118rpx;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border: 1rpx solid rgba(255, 255, 255, 0.82);
  border-radius: 48% 52% 46% 54%;
  background:
    radial-gradient(circle at 34% 18%, rgba(255, 255, 255, 0.82), transparent 25%),
    radial-gradient(circle at 50% 70%, rgba(var(--item-theme-rgb), 0.16), transparent 48%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(var(--item-theme-rgb), 0.1));
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 900;
  box-shadow:
    0 18rpx 34rpx rgba(var(--item-theme-rgb), 0.16),
    inset 0 -10rpx 18rpx rgba(var(--item-theme-rgb), 0.08);
}

.item-orb::after {
  position: absolute;
  right: 16rpx;
  bottom: -10rpx;
  left: 16rpx;
  height: 18rpx;
  border-radius: 50%;
  background: rgba(var(--item-theme-rgb), 0.18);
  filter: blur(8rpx);
  content: "";
}

.item-image {
  position: relative;
  z-index: 2;
  width: 136rpx;
  height: 136rpx;
  filter: drop-shadow(0 14rpx 12rpx rgba(15, 23, 42, 0.2));
}

.item-fallback {
  display: none;
}

.item-copy {
  min-width: 0;
  flex: 1;
}

.item-line {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.item-name {
  color: #203047;
  font-size: 28rpx;
  font-weight: 900;
}

.item-rarity {
  flex: none;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
  background: #eef2f7;
  color: #64748b;
  font-size: 18rpx;
  font-weight: 900;
}

.item-rarity.rare {
  background: #e0f2fe;
  color: #0369a1;
}

.item-rarity.epic {
  background: #fef3c7;
  color: #b45309;
}

.item-desc {
  display: block;
  margin-top: 8rpx;
  color: #66758a;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.36;
}

.item-meta {
  display: flex;
  gap: 14rpx;
  margin-top: 8rpx;
  color: #344256;
  font-size: 21rpx;
  font-weight: 900;
}

.item-button {
  flex: none;
  width: 136rpx;
  height: 62rpx;
  padding: 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #1f3149, var(--item-theme));
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 900;
  line-height: 62rpx;
  white-space: nowrap;
}

.item-button.owned {
  background: #ffffff;
  color: var(--item-theme);
  border: 1rpx solid rgba(var(--item-theme-rgb), 0.32);
}

.item-button.equipped {
  background: rgba(var(--item-theme-rgb), 0.1);
  color: rgba(32, 48, 71, 0.5);
}

.item-button[disabled] {
  background: #edf2f7;
  color: #94a3b8;
  box-shadow: none;
}

.bottom-space {
  height: 150rpx;
}
</style>
