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
          <view class="stage-arch" />
          <view class="room-wall">
            <image
              v-if="equippedBySlot.wall"
              class="wall-art"
              :src="getItemAsset(equippedBySlot.wall)"
              mode="aspectFill"
            />
          </view>
          <view class="stage-haze" />
          <view class="gallery-rim" />
          <view class="stage-crest" />

          <view v-if="equippedBySlot.window" class="stage-prop window-piece active">
            <image
              v-if="equippedBySlot.window"
              class="prop-image window-image"
              :src="getItemAsset(equippedBySlot.window)"
              mode="aspectFit"
            />
            <text v-else class="prop-empty">窗</text>
          </view>
          <view v-if="equippedBySlot.decor" class="stage-prop room-shelf active">
            <image
              v-if="equippedBySlot.decor"
              class="prop-image shelf-image"
              :src="getItemAsset(equippedBySlot.decor)"
              mode="aspectFit"
            />
            <text v-else class="prop-empty">奖</text>
          </view>

          <view class="floor-piece" :class="{ active: Boolean(equippedBySlot.floor) }">
            <image
              v-if="equippedBySlot.floor"
              class="floor-image"
              :src="getItemAsset(equippedBySlot.floor)"
              mode="aspectFit"
            />
          </view>
          <view v-if="equippedBySlot.desk" class="stage-prop room-desk active">
            <image
              v-if="equippedBySlot.desk"
              class="prop-image desk-image"
              :src="getItemAsset(equippedBySlot.desk)"
              mode="aspectFit"
            />
            <text v-else class="prop-empty">桌</text>
          </view>
          <view v-if="equippedBySlot.lamp" class="stage-prop room-lamp active">
            <image
              v-if="equippedBySlot.lamp"
              class="prop-image lamp-image"
              :src="getItemAsset(equippedBySlot.lamp)"
              mode="aspectFit"
            />
            <text v-else class="prop-empty">灯</text>
          </view>

          <view class="pet-light" />
          <view v-if="equippedBySlot.back" class="outfit-anchor outfit-back">
            <view class="anchor-glass">
              <image class="outfit-image" :src="getItemAsset(equippedBySlot.back)" mode="aspectFit" />
            </view>
            <text class="anchor-label">背饰</text>
          </view>
          <view v-if="equippedBySlot.aura" class="equip-aura">
            <image class="aura-image" :src="getItemAsset(equippedBySlot.aura)" mode="aspectFit" />
          </view>
          <view class="pet-showcase" :class="{ egg: isEggStage }">
            <view class="pet-showcase-halo" />
            <view class="pet-showcase-glow" />
            <view class="pet-showcase-cutout">
              <view class="portrait-vignette" />
              <image class="pet-portrait-image" :src="petPortraitSrc" mode="aspectFit" />
            </view>
            <view class="pet-showcase-shadow" />
          </view>
          <view v-if="equippedBySlot.head" class="outfit-anchor outfit-head">
            <view class="anchor-glass">
              <image class="outfit-image" :src="getItemAsset(equippedBySlot.head)" mode="aspectFit" />
            </view>
            <text class="anchor-label">头饰</text>
          </view>
          <view v-if="equippedBySlot.hand" class="outfit-anchor outfit-hand">
            <view class="anchor-glass">
              <image class="outfit-image" :src="getItemAsset(equippedBySlot.hand)" mode="aspectFit" />
            </view>
            <text class="anchor-label">手持</text>
          </view>
          <view v-if="equippedBySlot.effect" class="effect-orbit">
            <image class="effect-image effect-a" :src="getItemAsset(equippedBySlot.effect)" mode="aspectFit" />
            <image class="effect-image effect-b" :src="getItemAsset(equippedBySlot.effect)" mode="aspectFit" />
            <image class="effect-image effect-c" :src="getItemAsset(equippedBySlot.effect)" mode="aspectFit" />
          </view>
          <view
            v-for="column in stageOutfitColumns"
            :key="column.side"
            class="equip-rail"
            :class="`equip-rail-${column.side}`"
          >
            <view
              v-for="slot in column.slots"
              :key="slot.key"
              class="stage-slot"
              :class="{ active: Boolean(equippedBySlot[slot.key]) }"
            >
              <view class="stage-slot-orb">
                <image
                  v-if="equippedBySlot[slot.key]"
                  class="stage-slot-image"
                  :src="getEquippedAsset(slot.key)"
                  mode="aspectFit"
                />
                <text v-else class="stage-slot-empty">+</text>
              </view>
              <text class="stage-slot-label">{{ slot.label }}</text>
            </view>
          </view>
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
import {
  getEggOption,
  getShopItem,
  getShopItemAssetPath,
  getPetStageAssetPath,
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
const isEggStage = computed(() => petStore.stage.id === "egg");
const petPortraitSrc = computed(() =>
  progress.value ? getPetStageAssetPath(progress.value.eggId, petStore.stage.id) : "/static/pets/windfire-egg-cutout.webp",
);
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
  { key: "effect", label: "特效" },
  { key: "wall", label: "背景" },
  { key: "window", label: "窗景" },
  { key: "desk", label: "书桌" },
  { key: "lamp", label: "灯光" },
  { key: "floor", label: "地面" },
];
const stageOutfitColumns: Array<{
  side: "left" | "right";
  slots: Array<{ key: ShopItemSlot; label: string }>;
}> = [
  {
    side: "left",
    slots: [
      { key: "head", label: "头饰" },
      { key: "back", label: "背饰" },
      { key: "aura", label: "光环" },
    ],
  },
  {
    side: "right",
    slots: [
      { key: "hand", label: "手持" },
      { key: "effect", label: "特效" },
    ],
  },
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
  const lamp = getEquippedItem("lamp");

  return [
    `--room-wall:${wall?.theme || activeEgg.value?.palette.ink || "#10231d"}`,
    `--room-wall-accent:${wall?.accent || activeEgg.value?.palette.accent || "#2f855a"}`,
    `--room-floor:${floor?.theme || "#243148"}`,
    `--room-floor-accent:${floor?.accent || activeEgg.value?.palette.glow || "#eef5ff"}`,
    `--room-light:${aura?.accent || activeEgg.value?.palette.glow || "#ffffff"}`,
    `--room-lamp:${lamp?.accent || "#fef3c7"}`,
  ].join(";");
});

function getEquippedItem(slot: ShopItemSlot) {
  const itemId = equippedBySlot.value[slot];
  return itemId ? getShopItem(itemId) : null;
}

function getEquippedName(slot: ShopItemSlot) {
  return getEquippedItem(slot)?.shortName || "未装";
}

function getEquippedAsset(slot: ShopItemSlot) {
  const itemId = equippedBySlot.value[slot];
  return itemId ? getItemAsset(itemId) : "";
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
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 34rpx;
  background:
    radial-gradient(circle at 78% 12%, rgba(255, 255, 255, 0.2), transparent 28%),
    radial-gradient(circle at 18% 104%, rgba(var(--egg-accent-rgb, 47, 133, 90), 0.32), transparent 36%),
    linear-gradient(155deg, #121722 0%, #1b1f2c 48%, #3a261c 100%);
  box-shadow: 0 28rpx 72rpx rgba(31, 35, 47, 0.24);
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
  height: 560rpx;
  margin-top: 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.26);
  border-radius: 30rpx;
  background:
    linear-gradient(180deg, rgba(203, 232, 229, 0.7) 0%, rgba(53, 87, 98, 0.72) 46%, rgba(31, 24, 29, 0.94) 100%),
    linear-gradient(135deg, var(--room-wall), #12151d 76%);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.44),
    inset 0 -58rpx 88rpx rgba(27, 16, 13, 0.34),
    0 18rpx 36rpx rgba(0, 0, 0, 0.14);
  isolation: isolate;
}

.preview-stage::before {
  position: absolute;
  right: -90rpx;
  bottom: -96rpx;
  left: -90rpx;
  z-index: 2;
  height: 184rpx;
  border-radius: 54% 46% 0 0 / 78% 78% 0 0;
  background:
    radial-gradient(ellipse at 50% 10%, rgba(255, 255, 255, 0.28), transparent 46%),
    linear-gradient(115deg, rgba(80, 93, 132, 0.74), rgba(124, 139, 184, 0.86) 52%, rgba(60, 44, 38, 0.86) 100%);
  content: "";
}

.preview-stage::after {
  position: absolute;
  right: 28rpx;
  bottom: 24rpx;
  left: 28rpx;
  z-index: 10;
  height: 72rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18), transparent 68%);
  content: "";
  pointer-events: none;
}

.stage-arch {
  display: none;
}

.gallery-rim {
  display: none;
}

.room-wall {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.18), transparent 22%),
    radial-gradient(circle at 84% 2%, rgba(255, 255, 255, 0.14), transparent 24%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 42%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1rpx, transparent 1rpx);
  background-size: auto, auto, auto, 94rpx 100%;
  opacity: 0.95;
}

.wall-art {
  position: absolute;
  top: 30rpx;
  left: 50%;
  width: 560rpx;
  height: 350rpx;
  border-radius: 30rpx;
  opacity: 0.26;
  filter: saturate(1.04) contrast(1.02) brightness(0.82);
  transform: translateX(-50%);
}

.stage-haze {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.22), transparent 28%),
    linear-gradient(180deg, transparent 30%, rgba(6, 9, 14, 0.08) 64%, rgba(6, 9, 14, 0.28) 100%);
  pointer-events: none;
}

.stage-prop {
  position: absolute;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  color: rgba(255, 255, 255, 0.46);
  font-size: 22rpx;
  font-weight: 900;
}

.stage-prop::before {
  position: absolute;
  inset: 12rpx;
  z-index: -1;
  border-radius: 999rpx;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.18), transparent 64%);
  filter: blur(10rpx);
  content: "";
  opacity: 0;
}

.stage-prop.active::before {
  opacity: 1;
}

.prop-empty {
  min-width: 52rpx;
  height: 52rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.11);
  line-height: 52rpx;
  text-align: center;
  backdrop-filter: blur(8rpx);
}

.prop-image {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 14rpx 18rpx rgba(0, 0, 0, 0.28));
}

.window-image {
  width: 104rpx;
  height: 118rpx;
  opacity: 0.94;
}

.shelf-image {
  width: 136rpx;
  height: 78rpx;
  opacity: 0.82;
}

.desk-image {
  width: 156rpx;
  height: 112rpx;
}

.lamp-image {
  width: 86rpx;
  height: 118rpx;
}

.window-piece {
  top: 62rpx;
  right: 56rpx;
  width: 116rpx;
  height: 118rpx;
  opacity: 0.78;
}

.room-shelf {
  top: 204rpx;
  left: 62rpx;
  width: 142rpx;
  height: 74rpx;
  opacity: 0.62;
}

.room-desk {
  right: 56rpx;
  bottom: 92rpx;
  z-index: 8;
  width: 160rpx;
  height: 108rpx;
  opacity: 0.9;
  transform: rotate(-2deg);
}

.room-lamp {
  right: 144rpx;
  bottom: 178rpx;
  z-index: 8;
  width: 84rpx;
  height: 118rpx;
  opacity: 0.92;
  transform: rotate(3deg);
}

.room-lamp.active {
  filter: drop-shadow(0 0 26rpx var(--room-lamp));
}

.pet-light {
  position: absolute;
  left: 50%;
  bottom: 104rpx;
  z-index: 4;
  width: 430rpx;
  height: 230rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.34), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.22) 42%, transparent 72%);
  transform: translateX(-50%);
}

.pet-showcase {
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 88rpx;
  overflow: hidden;
  width: 444rpx;
  height: 344rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.46);
  border-radius: 26rpx;
  background:
    radial-gradient(circle at 72% 10%, rgba(255, 255, 255, 0.68), transparent 28%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.34), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.1) 42%, rgba(17, 24, 39, 0.12)),
    rgba(255, 255, 255, 0.18);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.48),
    inset 0 -28rpx 48rpx rgba(12, 18, 28, 0.14),
    0 28rpx 46rpx rgba(0, 0, 0, 0.24);
  transform: translateX(-50%);
  pointer-events: none;
}

.pet-showcase::before {
  position: absolute;
  top: 0;
  left: -30%;
  z-index: 4;
  width: 54%;
  height: 100%;
  background: linear-gradient(105deg, rgba(255, 255, 255, 0.3), transparent 60%);
  content: "";
  opacity: 0.55;
  transform: skewX(-12deg);
}

.pet-showcase-halo {
  position: absolute;
  top: 28rpx;
  left: 50%;
  width: 372rpx;
  height: 240rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 50% 44%, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.14) 42%, transparent 70%),
    radial-gradient(ellipse at 50% 62%, rgba(var(--egg-accent-rgb, 47, 133, 90), 0.34), transparent 72%);
  filter: blur(2rpx);
  opacity: 0.92;
  transform: translateX(-50%);
}

.pet-showcase-glow {
  position: absolute;
  right: 40rpx;
  bottom: 10rpx;
  left: 40rpx;
  z-index: 1;
  height: 92rpx;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.26), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.22) 42%, transparent 72%);
  filter: blur(5rpx);
}

.pet-showcase-cutout {
  position: absolute;
  inset: 14rpx;
  z-index: 2;
  overflow: hidden;
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 76% 16%, rgba(255, 255, 255, 0.42), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(20, 24, 32, 0.08));
}

.pet-showcase-cutout::after {
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: 32rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent 18%, transparent 78%, rgba(8, 11, 16, 0.14)),
    radial-gradient(ellipse at 50% 52%, transparent 64%, rgba(8, 11, 16, 0.1) 86%, rgba(8, 11, 16, 0.18) 100%);
  content: "";
  pointer-events: none;
}

.portrait-vignette {
  position: absolute;
  inset: 0;
  z-index: 3;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 28%, rgba(12, 18, 28, 0.16) 100%),
    radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(9, 11, 18, 0.2) 100%);
  pointer-events: none;
}

.pet-portrait-image {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  border-radius: 22rpx;
  filter: drop-shadow(0 24rpx 28rpx rgba(0, 0, 0, 0.26)) saturate(1.08) contrast(1.04);
}

.pet-showcase-shadow {
  position: absolute;
  right: 82rpx;
  bottom: 4rpx;
  left: 82rpx;
  z-index: 1;
  height: 38rpx;
  border-radius: 50%;
  background: rgba(8, 11, 16, 0.36);
  filter: blur(12rpx);
}

.pet-showcase.egg {
  bottom: 112rpx;
  width: 328rpx;
  height: 370rpx;
  border-radius: 38rpx;
}

.pet-showcase.egg .pet-showcase-halo {
  top: 34rpx;
  width: 288rpx;
  height: 288rpx;
}

.pet-showcase.egg .pet-showcase-glow {
  right: 28rpx;
  bottom: 2rpx;
  left: 28rpx;
  height: 72rpx;
}

.pet-showcase.egg .pet-showcase-cutout {
  inset: 0;
}

.pet-showcase.egg .pet-showcase-cutout::after {
  display: none;
}

.pet-showcase.egg .pet-portrait-image {
  border-radius: 0;
  filter: drop-shadow(0 22rpx 28rpx rgba(0, 0, 0, 0.3));
  -webkit-mask-image: none;
  mask-image: none;
}

.equip-aura {
  position: absolute;
  z-index: 6;
  left: 50%;
  bottom: 104rpx;
  width: 392rpx;
  height: 300rpx;
  border-radius: 50%;
  box-shadow:
    inset 0 0 44rpx rgba(255, 255, 255, 0.12),
    0 0 64rpx var(--room-light);
  opacity: 0.32;
  transform: translateX(-50%);
  pointer-events: none;
}

.aura-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.48;
  filter: blur(0.8rpx) saturate(1.1);
}

.outfit-anchor {
  position: absolute;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.outfit-anchor::after {
  position: absolute;
  inset: auto 18rpx 8rpx;
  z-index: -1;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.18);
  filter: blur(10rpx);
  content: "";
}

.anchor-glass {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.52);
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 32% 18%, rgba(255, 255, 255, 0.74), transparent 27%),
    radial-gradient(circle at 52% 62%, rgba(var(--egg-accent-rgb, 47, 133, 90), 0.18), transparent 64%),
    rgba(255, 255, 255, 0.44);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.76),
    inset 0 -18rpx 28rpx rgba(31, 41, 55, 0.08),
    0 20rpx 34rpx rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(14rpx);
}

.anchor-label {
  position: absolute;
  right: 12rpx;
  bottom: -9rpx;
  left: 12rpx;
  z-index: 4;
  padding: 5rpx 0;
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  border-radius: 999rpx;
  background: rgba(18, 23, 34, 0.82);
  color: rgba(255, 255, 255, 0.92);
  font-size: 16rpx;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.18);
}

.outfit-image {
  position: relative;
  z-index: 2;
  width: 118%;
  height: 118%;
  border-radius: 999rpx;
  filter: drop-shadow(0 12rpx 14rpx rgba(0, 0, 0, 0.24));
}

.outfit-head {
  top: 70rpx;
  left: 32rpx;
  width: 94rpx;
  height: 94rpx;
  transform: rotate(-4deg);
}

.outfit-back {
  top: 184rpx;
  left: 32rpx;
  width: 94rpx;
  height: 94rpx;
  transform: rotate(3deg);
}

.outfit-hand {
  top: 70rpx;
  right: 32rpx;
  width: 94rpx;
  height: 94rpx;
  transform: rotate(4deg);
}

.effect-orbit {
  position: absolute;
  inset: 82rpx 94rpx 124rpx;
  z-index: 7;
  pointer-events: none;
}

.effect-image {
  position: absolute;
  width: 78rpx;
  height: 78rpx;
  border-radius: 50%;
  opacity: 0.42;
  filter: drop-shadow(0 0 14rpx rgba(255, 255, 255, 0.32));
}

.effect-a {
  top: 20rpx;
  left: 24rpx;
  transform: rotate(-18deg) scale(0.8);
}

.effect-b {
  top: 86rpx;
  right: 26rpx;
  transform: rotate(22deg) scale(0.7);
}

.effect-c {
  right: 152rpx;
  bottom: 0;
  transform: rotate(8deg) scale(0.62);
}

.floor-piece {
  position: absolute;
  right: -70rpx;
  bottom: -72rpx;
  left: -70rpx;
  z-index: 4;
  overflow: hidden;
  height: 184rpx;
  border-radius: 50% 50% 0 0 / 62% 62% 0 0;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.22), transparent 46%),
    linear-gradient(135deg, var(--room-floor), var(--room-floor-accent));
  opacity: 0.72;
}

.floor-piece.active {
  opacity: 0.98;
}

.floor-image {
  position: absolute;
  left: 50%;
  bottom: 44rpx;
  width: 430rpx;
  height: 166rpx;
  opacity: 0.46;
  filter: saturate(1.14) contrast(1.04);
  transform: translateX(-50%) perspective(300rpx) rotateX(58deg);
}

.page {
  box-sizing: border-box;
  width: 100%;
  max-width: 760rpx;
  overflow-x: hidden;
  margin: 0 auto;
}

.content {
  padding: 22rpx 26rpx 120rpx;
}

.preview-stage {
  height: 612rpx;
  border-color: rgba(255, 255, 255, 0.42);
  border-radius: 32rpx;
  background:
    radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.3), transparent 24%),
    linear-gradient(180deg, rgba(226, 242, 235, 0.88) 0%, rgba(137, 173, 165, 0.78) 42%, rgba(70, 52, 43, 0.94) 100%),
    linear-gradient(135deg, var(--room-wall), #182028 78%);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.72),
    inset 0 -86rpx 92rpx rgba(42, 25, 18, 0.34),
    0 22rpx 42rpx rgba(15, 23, 42, 0.18);
}

.preview-stage::before {
  right: -34rpx;
  bottom: -54rpx;
  left: -34rpx;
  z-index: 3;
  height: 210rpx;
  border-radius: 48% 52% 0 0 / 54% 54% 0 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.34), transparent 46%),
    linear-gradient(135deg, rgba(87, 71, 61, 0.92), rgba(111, 92, 72, 0.9) 42%, rgba(58, 43, 38, 0.98));
}

.preview-stage::after {
  right: auto;
  bottom: 68rpx;
  left: 50%;
  z-index: 8;
  width: 306rpx;
  height: 70rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.32), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.2) 46%, rgba(23, 18, 16, 0.26) 100%);
  box-shadow: 0 20rpx 34rpx rgba(15, 23, 42, 0.2);
  transform: translateX(-50%);
}

.stage-arch {
  position: absolute;
  top: 26rpx;
  right: 118rpx;
  left: 118rpx;
  z-index: 1;
  display: block;
  height: 118rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
  border-bottom: 0;
  border-radius: 140rpx 140rpx 0 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent);
  opacity: 0.56;
}

.gallery-rim {
  position: absolute;
  top: 126rpx;
  right: 112rpx;
  left: 112rpx;
  z-index: 2;
  display: block;
  height: 10rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.26);
  box-shadow: 0 10rpx 20rpx rgba(15, 23, 42, 0.12);
}

.stage-crest {
  position: absolute;
  top: 38rpx;
  left: 50%;
  z-index: 3;
  width: 62rpx;
  height: 34rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.28);
  border-radius: 999rpx;
  background:
    radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.72), transparent 34%),
    rgba(var(--egg-accent-rgb, 47, 133, 90), 0.22);
  box-shadow: 0 10rpx 22rpx rgba(15, 23, 42, 0.12);
  transform: translateX(-50%);
}

.room-wall {
  background:
    radial-gradient(circle at 24% 16%, rgba(255, 255, 255, 0.22), transparent 24%),
    radial-gradient(circle at 76% 12%, rgba(255, 255, 255, 0.16), transparent 22%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1rpx, transparent 1rpx),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 56%);
  background-size: auto, auto, 128rpx 100%, auto;
  opacity: 0.82;
}

.wall-art {
  top: 72rpx;
  width: 420rpx;
  height: 218rpx;
  border-radius: 28rpx;
  opacity: 0.18;
  filter: saturate(0.9) contrast(1) brightness(0.92);
}

.stage-haze {
  z-index: 4;
  background:
    radial-gradient(ellipse at 50% 44%, rgba(255, 255, 255, 0.24), transparent 34%),
    linear-gradient(180deg, transparent 36%, rgba(13, 18, 24, 0.08) 68%, rgba(13, 18, 24, 0.22) 100%);
}

.stage-prop {
  z-index: 5;
  opacity: 0.62;
}

.stage-prop::before,
.prop-empty {
  display: none;
}

.prop-image {
  filter: drop-shadow(0 10rpx 14rpx rgba(0, 0, 0, 0.22));
}

.window-piece {
  top: 116rpx;
  left: 104rpx;
  right: auto;
  width: 100rpx;
  height: 108rpx;
}

.window-image {
  width: 96rpx;
  height: 108rpx;
  opacity: 0.58;
}

.room-shelf {
  top: 122rpx;
  right: 104rpx;
  left: auto;
  width: 126rpx;
  height: 74rpx;
}

.shelf-image {
  width: 126rpx;
  height: 70rpx;
  opacity: 0.52;
}

.room-desk {
  right: 108rpx;
  bottom: 92rpx;
  z-index: 6;
  width: 124rpx;
  height: 90rpx;
  opacity: 0.64;
  transform: rotate(-1deg);
}

.desk-image {
  width: 124rpx;
  height: 90rpx;
}

.room-lamp {
  right: 190rpx;
  bottom: 164rpx;
  z-index: 6;
  width: 64rpx;
  height: 96rpx;
  opacity: 0.68;
  transform: none;
}

.lamp-image {
  width: 64rpx;
  height: 96rpx;
}

.room-lamp.active {
  filter: drop-shadow(0 0 18rpx rgba(254, 243, 199, 0.72));
}

.floor-piece {
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 4;
  height: 190rpx;
  border-radius: 0;
  background:
    radial-gradient(ellipse at 50% 18%, rgba(255, 255, 255, 0.24), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 24%),
    linear-gradient(135deg, rgba(75, 57, 48, 0.8), rgba(46, 34, 32, 0.96));
  opacity: 0.92;
}

.floor-image {
  bottom: 18rpx;
  z-index: 5;
  width: 360rpx;
  height: 132rpx;
  opacity: 0.4;
  transform: translateX(-50%) perspective(330rpx) rotateX(60deg);
}

.pet-light {
  bottom: 104rpx;
  z-index: 6;
  width: 340rpx;
  height: 184rpx;
  opacity: 0.78;
  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.38), rgba(var(--egg-accent-rgb, 47, 133, 90), 0.2) 45%, transparent 72%);
}

.pet-showcase {
  z-index: 9;
  bottom: 124rpx;
  width: 318rpx;
  height: 300rpx;
  border-color: rgba(255, 255, 255, 0.56);
  border-radius: 28rpx;
  background:
    radial-gradient(circle at 74% 12%, rgba(255, 255, 255, 0.7), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.12)),
    rgba(255, 255, 255, 0.22);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.66),
    inset 0 -22rpx 36rpx rgba(15, 23, 42, 0.12),
    0 22rpx 36rpx rgba(15, 23, 42, 0.24);
}

.pet-showcase-halo {
  top: 32rpx;
  width: 280rpx;
  height: 210rpx;
  opacity: 0.76;
}

.pet-showcase-glow {
  right: 32rpx;
  bottom: 6rpx;
  left: 32rpx;
  height: 68rpx;
  opacity: 0.72;
}

.pet-showcase-cutout {
  inset: 12rpx;
  border-radius: 22rpx;
}

.pet-showcase-cutout::after {
  border-radius: 24rpx;
}

.pet-portrait-image {
  border-radius: 20rpx;
}

.pet-showcase-shadow {
  right: 62rpx;
  bottom: 2rpx;
  left: 62rpx;
  height: 30rpx;
  opacity: 0.72;
}

.pet-showcase.egg {
  bottom: 124rpx;
  width: 260rpx;
  height: 310rpx;
  border-radius: 34rpx;
}

.pet-showcase.egg .pet-showcase-halo {
  width: 226rpx;
  height: 226rpx;
}

.equip-aura {
  z-index: 8;
  bottom: 132rpx;
  width: 304rpx;
  height: 226rpx;
  opacity: 0.2;
  box-shadow:
    inset 0 0 34rpx rgba(255, 255, 255, 0.12),
    0 0 42rpx var(--room-light);
}

.aura-image {
  opacity: 0.4;
}

.effect-orbit {
  inset: 132rpx 152rpx 176rpx;
  z-index: 10;
}

.effect-image {
  width: 52rpx;
  height: 52rpx;
  opacity: 0.24;
}

.effect-b {
  top: 68rpx;
}

.effect-c {
  right: 120rpx;
  bottom: 12rpx;
}

.outfit-anchor {
  display: none;
}

.equip-rail {
  position: absolute;
  top: 90rpx;
  bottom: 126rpx;
  z-index: 13;
  display: flex;
  width: 94rpx;
  flex-direction: column;
  justify-content: center;
  gap: 14rpx;
  pointer-events: none;
}

.equip-rail-left {
  left: 20rpx;
}

.equip-rail-right {
  right: 20rpx;
}

.stage-slot {
  display: flex;
  min-height: 96rpx;
  align-items: center;
  flex-direction: column;
  gap: 5rpx;
}

.stage-slot-orb {
  display: flex;
  width: 72rpx;
  height: 72rpx;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.32);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.76), transparent 30%),
    rgba(255, 255, 255, 0.2);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.48),
    0 12rpx 22rpx rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(10rpx);
}

.stage-slot.active .stage-slot-orb {
  border-color: rgba(255, 255, 255, 0.58);
  background:
    radial-gradient(circle at 32% 18%, rgba(255, 255, 255, 0.86), transparent 28%),
    radial-gradient(circle at 50% 62%, rgba(var(--egg-accent-rgb, 47, 133, 90), 0.2), transparent 68%),
    rgba(255, 255, 255, 0.34);
}

.stage-slot-image {
  width: 64rpx;
  height: 64rpx;
  filter: drop-shadow(0 8rpx 10rpx rgba(0, 0, 0, 0.24));
}

.stage-slot-empty {
  display: block;
  max-width: 54rpx;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16rpx;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
}

.stage-slot-label {
  display: block;
  max-width: 82rpx;
  overflow: hidden;
  padding: 5rpx 10rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.22);
  border-radius: 999rpx;
  background: rgba(20, 24, 32, 0.58);
  color: rgba(255, 255, 255, 0.9);
  font-size: 16rpx;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equipped-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8rpx;
  margin-top: 18rpx;
}

.equip-chip {
  min-width: 0;
  padding: 10rpx 6rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.09);
}

.equip-chip.active {
  border-color: rgba(255, 255, 255, 0.34);
  background:
    radial-gradient(circle at 24% 12%, rgba(255, 255, 255, 0.26), transparent 42%),
    rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.22);
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
  font-size: 18rpx;
  font-weight: 800;
}

.equip-chip-value {
  margin-top: 5rpx;
  color: #ffffff;
  font-size: 21rpx;
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
