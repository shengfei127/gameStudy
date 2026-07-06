<template>
  <view class="pet-avatar" :class="[stageClass, size, motifClass]" :style="avatarStyle">
    <image
      v-if="preferImage && !imageFailed"
      class="pet-image"
      :src="assetSrc"
      mode="aspectFit"
      @error="handleImageError"
    />

    <view class="aura">
      <view class="aura-ring ring-a" />
      <view class="aura-ring ring-b" />
    </view>

    <view v-if="stageClass === 'egg'" class="egg-art">
      <view class="egg-shadow" />
      <view class="egg-shell">
        <view class="egg-shine" />
        <view class="egg-band" />
        <text class="egg-symbol">{{ egg.iconLabel }}</text>
      </view>
    </view>

    <view v-else class="adult-art">
      <view class="tail-shape" />
      <view class="wing left" />
      <view class="wing right" />
      <view class="ear left" />
      <view class="ear right" />
      <view class="body">
        <view class="crest" />
        <view class="face">
          <view class="eye" />
          <view class="eye" />
        </view>
        <view class="nose" />
        <view class="mouth" />
        <text class="chest-emblem">{{ egg.iconLabel }}</text>
      </view>
      <view class="orb orb-a" />
      <view class="orb orb-b" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { EGG_OPTIONS, getPetAssetPath, getPetEggCutoutPath } from "@/domain/pet";
import type { EggId, EvolutionStage } from "@/domain/pet";

const props = withDefaults(
  defineProps<{
    eggId?: EggId;
    stageId?: EvolutionStage["id"];
    size?: "tiny" | "small" | "large";
    preferImage?: boolean;
  }>(),
  {
    eggId: "zodiac_dragon",
    stageId: "egg",
    size: "large",
    preferImage: true,
  },
);

const egg = computed(() => EGG_OPTIONS.find((item) => item.id === props.eggId) || EGG_OPTIONS[0]);
const stageClass = computed(() => props.stageId);
const motifClass = computed(() => `motif-${egg.value.motif}`);
const imageFailed = ref(false);
const assetSrc = computed(() =>
  props.stageId === "egg" ? getPetEggCutoutPath(egg.value.id) : getPetAssetPath(egg.value.id, "adult"),
);
const avatarStyle = computed(
  () =>
    [
      `--shell-color:${egg.value.palette.shell}`,
      `--accent-color:${egg.value.palette.accent}`,
      `--body-color:${egg.value.palette.body}`,
      `--glow-color:${egg.value.palette.glow}`,
      `--ink-color:${egg.value.palette.ink}`,
    ].join(";"),
);

watch(
  () => [props.eggId, props.stageId],
  () => {
    imageFailed.value = false;
  },
);

function handleImageError() {
  imageFailed.value = true;
}
</script>

<style>
.pet-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.pet-image {
  position: absolute;
  inset: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 22rpx 34rpx rgba(32, 48, 71, 0.2));
}

.pet-avatar.large {
  width: 320rpx;
  height: 320rpx;
}

.pet-avatar.small {
  width: 138rpx;
  height: 138rpx;
}

.pet-avatar.tiny {
  width: 86rpx;
  height: 86rpx;
}

.aura {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 36% 30%, rgba(255, 255, 255, 0.95), transparent 24%),
    radial-gradient(circle at 52% 58%, var(--glow-color), transparent 66%);
  z-index: -2;
}

.aura-ring {
  position: absolute;
  border: 2rpx solid var(--accent-color);
  border-radius: 42% 58% 48% 52%;
  opacity: 0.24;
}

.ring-a {
  inset: 14%;
  transform: rotate(-16deg);
}

.ring-b {
  inset: 24%;
  transform: rotate(22deg);
}

.egg-art,
.adult-art {
  position: relative;
  width: 100%;
  height: 100%;
}

.egg-shadow {
  position: absolute;
  right: 20%;
  bottom: 9%;
  left: 20%;
  height: 12%;
  border-radius: 50%;
  background: rgba(27, 47, 82, 0.16);
  filter: blur(6rpx);
}

.egg-shell {
  position: absolute;
  top: 8%;
  left: 17%;
  width: 66%;
  height: 80%;
  overflow: hidden;
  border: 7rpx solid rgba(255, 255, 255, 0.78);
  border-radius: 52% 52% 45% 45%;
  background:
    linear-gradient(150deg, rgba(255, 255, 255, 0.72), transparent 36%),
    var(--shell-color);
  box-shadow:
    inset -20rpx -26rpx 34rpx rgba(0, 0, 0, 0.08),
    0 24rpx 42rpx rgba(27, 47, 82, 0.18);
}

.egg-shine {
  position: absolute;
  top: 16%;
  left: 22%;
  width: 22%;
  height: 34%;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.58);
  transform: rotate(18deg);
}

.egg-band {
  position: absolute;
  right: -18%;
  bottom: 25%;
  left: -18%;
  height: 27%;
  background:
    linear-gradient(90deg, transparent 0 8%, rgba(255, 255, 255, 0.28) 8% 18%, transparent 18% 100%),
    var(--accent-color);
  opacity: 0.9;
  transform: rotate(-8deg);
}

.egg-symbol {
  position: absolute;
  right: 17%;
  bottom: 30%;
  z-index: 2;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 900;
}

.tiny .egg-symbol {
  font-size: 20rpx;
}

.adult-art {
  transform: translateY(2%);
}

.body {
  position: absolute;
  right: 17%;
  bottom: 7%;
  left: 17%;
  height: 68%;
  border: 7rpx solid rgba(255, 255, 255, 0.82);
  border-radius: 42% 42% 36% 36%;
  background:
    radial-gradient(circle at 36% 28%, rgba(255, 255, 255, 0.72), transparent 17%),
    linear-gradient(160deg, var(--glow-color), var(--body-color) 55%);
  box-shadow:
    inset -18rpx -22rpx 28rpx rgba(0, 0, 0, 0.08),
    0 24rpx 48rpx rgba(27, 47, 82, 0.18);
}

.face {
  position: absolute;
  top: 35%;
  left: 50%;
  display: flex;
  width: 42%;
  justify-content: space-between;
  transform: translateX(-50%);
}

.eye {
  width: 18rpx;
  height: 24rpx;
  border-radius: 999rpx;
  background: var(--ink-color);
  box-shadow: inset 4rpx 4rpx 0 rgba(255, 255, 255, 0.35);
}

.nose {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--ink-color);
  opacity: 0.76;
  transform: translateX(-50%);
}

.mouth {
  position: absolute;
  top: 59%;
  left: 50%;
  width: 34rpx;
  height: 14rpx;
  border-bottom: 4rpx solid var(--ink-color);
  border-radius: 50%;
  opacity: 0.5;
  transform: translateX(-50%);
}

.chest-emblem {
  position: absolute;
  right: 31%;
  bottom: 14%;
  left: 31%;
  height: 34rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.66);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.34);
  color: var(--ink-color);
  font-size: 21rpx;
  font-weight: 900;
  line-height: 34rpx;
  text-align: center;
}

.ear {
  position: absolute;
  top: 15%;
  width: 25%;
  height: 30%;
  border: 6rpx solid rgba(255, 255, 255, 0.74);
  border-radius: 54% 54% 20% 54%;
  background: var(--accent-color);
  box-shadow: inset -10rpx -10rpx 18rpx rgba(0, 0, 0, 0.08);
}

.ear.left {
  left: 19%;
  transform: rotate(-24deg);
}

.ear.right {
  right: 19%;
  transform: scaleX(-1) rotate(-24deg);
}

.tail-shape {
  position: absolute;
  right: 8%;
  bottom: 22%;
  width: 30%;
  height: 26%;
  border: 6rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 999rpx 999rpx 999rpx 24rpx;
  background: var(--accent-color);
  transform: rotate(18deg);
  z-index: -1;
}

.crest {
  position: absolute;
  top: -16%;
  left: 50%;
  width: 28%;
  height: 25%;
  border-radius: 50% 50% 34% 34%;
  background: var(--accent-color);
  transform: translateX(-50%);
}

.wing {
  position: absolute;
  top: 31%;
  width: 28%;
  height: 33%;
  border-radius: 70% 28% 70% 30%;
  background: var(--accent-color);
  opacity: 0.72;
  z-index: -1;
}

.wing.left {
  left: 8%;
  transform: rotate(-22deg);
}

.wing.right {
  right: 8%;
  transform: scaleX(-1) rotate(-22deg);
}

.orb {
  position: absolute;
  width: 15%;
  height: 15%;
  border: 4rpx solid rgba(255, 255, 255, 0.86);
  border-radius: 50%;
  background: var(--accent-color);
}

.orb-a {
  top: 18%;
  right: 11%;
}

.orb-b {
  bottom: 11%;
  left: 12%;
  transform: scale(0.72);
  opacity: 0.72;
}

.tiny .body,
.tiny .ear,
.tiny .tail-shape,
.tiny .wing {
  border-width: 3rpx;
}

.tiny .eye {
  width: 8rpx;
  height: 11rpx;
}

.tiny .chest-emblem {
  height: 18rpx;
  font-size: 12rpx;
  line-height: 18rpx;
}

.small .chest-emblem {
  height: 24rpx;
  font-size: 15rpx;
  line-height: 24rpx;
}

.hatchling .wing,
.student .wing {
  opacity: 0.34;
}

.hatchling .crest {
  transform: translateX(-50%) scale(0.72);
}

.scholar .body,
.guardian .body {
  height: 72%;
}

.guardian .aura-ring {
  opacity: 0.72;
}

.motif-horn .ear {
  height: 20%;
  border-radius: 50% 50% 8% 8%;
}

.motif-horn .crest,
.motif-crest .crest {
  clip-path: polygon(50% 0, 66% 34%, 100% 38%, 72% 62%, 80% 100%, 50% 76%, 20% 100%, 28% 62%, 0 38%, 34% 34%);
}

.motif-stripe .body::before,
.motif-lion .body::before {
  position: absolute;
  top: 22%;
  right: 20%;
  left: 20%;
  height: 8%;
  border-radius: 999rpx;
  background: var(--accent-color);
  content: "";
  opacity: 0.56;
}

.motif-moon .crest,
.motif-lunar .crest {
  border-radius: 50%;
  background: transparent;
  box-shadow: 16rpx 0 0 var(--accent-color);
}

.motif-serpent .tail-shape {
  right: 4%;
  width: 43%;
  height: 18%;
  border-radius: 999rpx;
}

.motif-mane .crest,
.motif-crown .crest,
.motif-lion .crest {
  top: -20%;
  width: 44%;
  clip-path: polygon(0 100%, 15% 18%, 34% 78%, 50% 0, 66% 78%, 85% 18%, 100% 100%);
}

.motif-cloud .wing {
  border-radius: 50%;
}

.motif-spark .orb {
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}

.motif-flame .crest {
  top: -22%;
  height: 34%;
  border-radius: 70% 18% 68% 36%;
  transform: translateX(-50%) rotate(22deg);
}

.motif-lotus .crest {
  width: 38%;
  border-radius: 80% 20% 80% 20%;
  transform: translateX(-50%) rotate(45deg);
}
</style>
