<template>
  <view class="page">
    <view v-if="!petStore.progress" class="empty">
      <text class="empty-title">先选择宠物蛋</text>
      <text class="empty-copy">有了学习伙伴后，每次打卡都会转化为积分。</text>
      <button class="primary-button" @tap="goHome">去选择</button>
    </view>

    <view v-else class="content">
      <view class="summary">
        <text class="summary-title">今日学习 {{ petStore.todayMinutes }} 分钟</text>
        <text class="summary-copy">完成一次真实学习，就给伙伴准备一份能量。</text>
      </view>

      <view class="panel">
        <text class="panel-title">学习科目</text>
        <view class="subject-grid">
          <view
            v-for="item in subjects"
            :key="item"
            class="subject-chip"
            :class="{ selected: subject === item }"
            @tap="selectSubject(item)"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view class="panel">
        <text class="panel-title">学习时长</text>
        <view class="duration-row">
          <button class="step-button" @tap="adjustMinutes(-5)">-</button>
          <view class="duration-box">
            <input v-model.number="minutes" class="duration-input" type="number" />
            <text class="duration-unit">分钟</text>
          </view>
          <button class="step-button" @tap="adjustMinutes(5)">+</button>
        </view>
      </view>

      <view class="panel">
        <text class="panel-title">专注程度</text>
        <view class="focus-list">
          <view
            v-for="item in focusOptions"
            :key="item.level"
            class="focus-item"
            :class="{ selected: focusLevel === item.level }"
            @tap="focusLevel = item.level"
          >
            <text class="focus-name">{{ item.name }}</text>
            <text class="focus-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <text class="panel-title">学习备注</text>
        <textarea v-model="note" class="note-input" maxlength="80" placeholder="例如：完成一套数学错题，整理了 3 个易错点" />
      </view>

      <button class="primary-button" @tap="submitCheckIn">完成打卡，领取积分</button>

      <view class="panel">
        <text class="panel-title">最近打卡</text>
        <view v-if="recentLogs.length === 0" class="empty-log">还没有打卡记录</view>
        <view v-for="log in recentLogs" :key="log.id" class="log-row">
          <view>
            <text class="log-subject">{{ log.subject }}</text>
            <text class="log-date">{{ log.dateKey }} · {{ log.minutes }} 分钟</text>
          </view>
          <text class="log-reward">+{{ log.reward }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { FocusLevel } from "@/domain/pet";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const subjects = ["数学", "语文", "英语", "科学", "自习", "阅读"];
const focusOptions: Array<{ level: FocusLevel; name: string; desc: string }> = [
  { level: 1, name: "普通", desc: "完成了，但中途有分心" },
  { level: 2, name: "稳定", desc: "大部分时间保持专注" },
  { level: 3, name: "高效", desc: "进入状态，收获明显" },
];

const subject = ref("数学");
const minutes = ref(25);
const focusLevel = ref<FocusLevel>(2);
const note = ref("");
const recentLogs = computed(() => petStore.recentStudyLogs);

function selectSubject(value: string) {
  subject.value = value;
}

function adjustMinutes(step: number) {
  minutes.value = Math.min(240, Math.max(5, Number(minutes.value || 0) + step));
}

function submitCheckIn() {
  try {
    const result = petStore.checkIn({
      subject: subject.value,
      minutes: Number(minutes.value),
      focusLevel: focusLevel.value,
      note: note.value,
    });
    note.value = "";
    uni.showToast({ title: `获得 ${result.reward} 积分`, icon: "none" });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : "打卡失败", icon: "none" });
  }
}

function goHome() {
  uni.switchTab({ url: "/pages/home/index" });
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 32rpx;
}

.content,
.empty {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty {
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.empty-title {
  color: #203047;
  font-size: 42rpx;
  font-weight: 900;
}

.empty-copy {
  color: #687487;
  font-size: 28rpx;
  line-height: 1.5;
}

.summary {
  padding: 34rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #203047 0%, #2f855a 100%);
  color: #ffffff;
}

.summary-title {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
}

.summary-copy {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.45;
  opacity: 0.82;
}

.panel {
  padding: 28rpx;
  border: 1rpx solid #dfe8df;
  border-radius: 18rpx;
  background: #ffffff;
}

.panel-title {
  display: block;
  margin-bottom: 18rpx;
  color: #203047;
  font-size: 30rpx;
  font-weight: 850;
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
}

.subject-chip,
.focus-item {
  border: 2rpx solid #e2e9e2;
  border-radius: 16rpx;
  background: #f8fbf8;
}

.subject-chip {
  height: 76rpx;
  color: #526073;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 76rpx;
  text-align: center;
}

.subject-chip.selected,
.focus-item.selected {
  border-color: #2f855a;
  background: #e9f7ef;
  color: #2f855a;
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.step-button {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: #203047;
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 88rpx;
}

.duration-box {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: #f8fbf8;
}

.duration-input {
  width: 130rpx;
  color: #203047;
  font-size: 36rpx;
  font-weight: 900;
  text-align: center;
}

.duration-unit {
  color: #687487;
  font-size: 26rpx;
}

.focus-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.focus-item {
  padding: 22rpx;
}

.focus-name {
  display: block;
  color: #203047;
  font-size: 28rpx;
  font-weight: 850;
}

.focus-desc,
.log-date {
  display: block;
  margin-top: 6rpx;
  color: #687487;
  font-size: 24rpx;
}

.note-input {
  width: 100%;
  min-height: 150rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f8fbf8;
  color: #203047;
  font-size: 27rpx;
  line-height: 1.45;
}

.primary-button {
  height: 88rpx;
  border-radius: 16rpx;
  background: #2f855a;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 850;
  line-height: 88rpx;
}

.empty-log {
  color: #879188;
  font-size: 26rpx;
}

.log-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.log-row:first-of-type {
  border-top: 0;
}

.log-subject {
  display: block;
  color: #203047;
  font-size: 28rpx;
  font-weight: 800;
}

.log-reward {
  color: #2f855a;
  font-size: 30rpx;
  font-weight: 900;
}
</style>
