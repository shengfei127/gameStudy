<template>
  <view class="pet-avatar" :class="[stageClass, size]" :style="avatarStyle">
    <view v-if="stageClass === 'egg'" class="egg">
      <view class="egg-shine" />
      <view class="egg-band" />
    </view>
    <view v-else class="creature">
      <view class="ear left" />
      <view class="ear right" />
      <view class="body">
        <view class="face">
          <view class="eye" />
          <view class="eye" />
        </view>
        <view class="mark" />
      </view>
      <view class="tail" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { EGG_OPTIONS, type EggId, type EvolutionStage } from "@/domain/pet";

const props = withDefaults(
  defineProps<{
    eggId?: EggId;
    stageId?: EvolutionStage["id"];
    size?: "small" | "large";
  }>(),
  {
    eggId: "aurora",
    stageId: "egg",
    size: "large",
  },
);

const egg = computed(() => EGG_OPTIONS.find((item) => item.id === props.eggId) || EGG_OPTIONS[0]);
const stageClass = computed(() => props.stageId);
const avatarStyle = computed(
  () =>
    `--shell-color:${egg.value.palette.shell};--accent-color:${egg.value.palette.accent};--body-color:${egg.value.palette.body};`,
);
</script>

<style>
.pet-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-avatar.large {
  width: 300rpx;
  height: 300rpx;
}

.pet-avatar.small {
  width: 132rpx;
  height: 132rpx;
}

.egg {
  position: relative;
  width: 72%;
  height: 86%;
  overflow: hidden;
  border: 8rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 52% 52% 45% 45%;
  background: var(--shell-color);
  box-shadow: 0 28rpx 52rpx rgba(27, 47, 82, 0.18);
}

.egg-shine {
  position: absolute;
  top: 44rpx;
  left: 52rpx;
  width: 54rpx;
  height: 94rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.48);
  transform: rotate(18deg);
}

.egg-band {
  position: absolute;
  right: -18rpx;
  bottom: 52rpx;
  left: -18rpx;
  height: 70rpx;
  background: var(--accent-color);
  opacity: 0.86;
  transform: rotate(-8deg);
}

.creature {
  position: relative;
  width: 78%;
  height: 76%;
}

.body {
  position: absolute;
  right: 12%;
  bottom: 2%;
  left: 12%;
  height: 78%;
  border: 8rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 46% 46% 40% 40%;
  background: var(--body-color);
  box-shadow: 0 28rpx 52rpx rgba(27, 47, 82, 0.18);
}

.face {
  position: absolute;
  top: 36%;
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
  background: #203047;
}

.mark {
  position: absolute;
  right: 30%;
  bottom: 18%;
  left: 30%;
  height: 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.5);
}

.ear {
  position: absolute;
  top: 6%;
  width: 28%;
  height: 36%;
  border-radius: 48% 48% 18% 48%;
  background: var(--accent-color);
}

.ear.left {
  left: 16%;
  transform: rotate(-24deg);
}

.ear.right {
  right: 16%;
  transform: scaleX(-1) rotate(-24deg);
}

.tail {
  position: absolute;
  right: 0;
  bottom: 22%;
  width: 30%;
  height: 30%;
  border-radius: 999rpx;
  background: var(--accent-color);
}

.student .body,
.scholar .body,
.guardian .body {
  height: 82%;
}

.scholar .mark,
.guardian .mark {
  background: #ffffff;
}
</style>
