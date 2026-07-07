<template>
  <view class="page">
    <view v-if="!petStore.progress" class="empty">
      <text class="empty-title">先选择宠物蛋</text>
      <text class="empty-copy">有了学习伙伴后，每次真实学习都能转化为积分。</text>
      <button class="primary-button ready" @tap="goHome">去选择</button>
    </view>

    <view v-else class="content">
      <view class="summary">
        <view>
          <text class="summary-kicker">今日学习</text>
          <text class="summary-title">{{ petStore.todayMinutes }} 分钟</text>
        </view>
        <text class="summary-copy">上传一次真实学习照片，伙伴获得能量。</text>
      </view>

      <view class="check-card">
        <view class="field">
          <view class="field-head">
            <text class="field-title">学习科目</text>
            <text class="field-value">{{ subject }}</text>
          </view>
          <view class="subject-tabs">
            <view
              v-for="item in subjects"
              :key="item"
              class="subject-tab"
              :class="{ selected: subject === item, completed: isSubjectChecked(item) }"
              @tap="selectSubject(item)"
            >
              <text class="subject-name">{{ item }}</text>
              <text v-if="isSubjectChecked(item)" class="subject-state">已完成</text>
            </view>
          </view>
          <text class="subject-progress">今日已完成 {{ checkedSubjectsToday.length }}/{{ subjects.length }} 科</text>
        </view>

        <view class="field compact-field">
          <view class="field-copy">
            <text class="field-title">学习时长</text>
            <text class="field-hint">5-240 分钟</text>
          </view>
          <view class="duration-control">
            <button class="step-button" @tap="adjustMinutes(-5)">-</button>
            <view class="duration-box">
              <input
                v-model.number="minutes"
                class="duration-input"
                type="number"
                @blur="normalizeMinutes"
              />
              <text class="duration-unit">分钟</text>
            </view>
            <button class="step-button" @tap="adjustMinutes(5)">+</button>
          </view>
        </view>

        <view class="field">
          <view class="field-head">
            <text class="field-title">打卡照片</text>
            <text class="required">必传</text>
          </view>

          <view v-if="photoPath" class="proof-card">
            <image class="proof-image" :src="photoPath" mode="aspectFill" @tap="previewPhoto" />
            <view class="proof-info">
              <text class="proof-title">照片已添加</text>
              <text class="proof-hint">点击图片可预览</text>
            </view>
            <view class="proof-actions">
              <button class="ghost-button" @tap.stop="choosePhoto">重选</button>
              <button class="ghost-button danger" @tap.stop="removePhoto">移除</button>
            </view>
          </view>

          <view v-else class="upload-card" @tap="choosePhoto">
            <text class="upload-icon">+</text>
            <view class="upload-copy">
              <text class="upload-title">上传学习照片</text>
              <text class="upload-hint">拍照或从相册选择</text>
            </view>
          </view>
        </view>

        <view class="field">
          <textarea
            v-model="note"
            class="note-input"
            maxlength="60"
            placeholder="备注（可选）"
          />
        </view>
      </view>

      <button class="primary-button" :class="{ ready: canSubmit }" :disabled="!canSubmit" @tap="submitCheckIn">
        {{ submitLabel }}
      </button>

      <view class="recent-card">
        <view class="field-head">
          <text class="field-title">最近打卡</text>
          <text class="field-hint">{{ recentLogs.length }} 条</text>
        </view>

        <view v-if="recentLogs.length === 0" class="empty-log">还没有打卡记录</view>
        <view v-for="log in recentLogs" :key="log.id" class="log-row">
          <image v-if="log.photoPath" class="log-photo" :src="log.photoPath" mode="aspectFill" />
          <view class="log-copy">
            <text class="log-subject">{{ log.subject }} · {{ log.minutes }} 分钟</text>
            <text class="log-date">{{ log.dateKey }}</text>
          </view>
          <text class="log-reward">+{{ log.reward }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePetStore } from "@/stores/pet";

const petStore = usePetStore();
const subjects = ["语文", "数学", "英语"] as const;
type StudySubject = (typeof subjects)[number];

const subject = ref<StudySubject>("数学");
const minutes = ref(25);
const note = ref("");
const photoPath = ref("");
const recentLogs = computed(() => petStore.recentStudyLogs);
const checkedSubjectsToday = computed(() => petStore.checkedSubjectsToday);
const checkedSubjectSet = computed(() => new Set(checkedSubjectsToday.value));
const selectedSubjectChecked = computed(() => checkedSubjectSet.value.has(subject.value));
const canSubmit = computed(() => Boolean(photoPath.value) && !selectedSubjectChecked.value && !petStore.loading);
const submitLabel = computed(() => {
  if (petStore.loading) {
    return "正在提交...";
  }

  if (selectedSubjectChecked.value) {
    return `今日${subject.value}已完成`;
  }

  return canSubmit.value ? "完成打卡，领取积分" : "上传照片后打卡";
});

function selectSubject(value: StudySubject) {
  subject.value = value;
  if (isSubjectChecked(value)) {
    uni.showToast({ title: `今天${value}已经打卡过了`, icon: "none" });
  }
}

function isSubjectChecked(value: StudySubject) {
  return checkedSubjectSet.value.has(value);
}

function selectFirstAvailableSubject() {
  const nextSubject = subjects.find((item) => !isSubjectChecked(item));
  if (nextSubject) {
    subject.value = nextSubject;
  }
}

function adjustMinutes(step: number) {
  minutes.value = clampMinutes(Number(minutes.value || 0) + step);
}

function normalizeMinutes() {
  minutes.value = clampMinutes(Number(minutes.value || 0));
}

function choosePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["camera", "album"],
    success(result) {
      const selectedPath = result.tempFilePaths[0];
      if (selectedPath) {
        photoPath.value = selectedPath;
      }
    },
    fail(error) {
      const message = String(error.errMsg || "");
      if (!message.toLowerCase().includes("cancel")) {
        uni.showToast({ title: "照片选择失败", icon: "none" });
      }
    },
  });
}

function removePhoto() {
  photoPath.value = "";
}

function previewPhoto() {
  if (!photoPath.value) {
    return;
  }

  uni.previewImage({
    current: photoPath.value,
    urls: [photoPath.value],
  });
}

async function submitCheckIn() {
  if (selectedSubjectChecked.value) {
    uni.showToast({ title: `今天${subject.value}已经打卡过了`, icon: "none" });
    return;
  }

  if (!photoPath.value) {
    uni.showToast({ title: "请先上传学习照片", icon: "none" });
    return;
  }

  uni.showLoading({ title: "正在提交", mask: true });
  let toastTitle = "";
  try {
    const uploadedPhotoPath = await petStore.uploadStudyPhoto(photoPath.value);
    const result = await petStore.checkIn({
      subject: subject.value,
      minutes: Number(minutes.value),
      focusLevel: 2,
      photoPath: uploadedPhotoPath,
      note: note.value,
    });
    note.value = "";
    photoPath.value = "";
    selectFirstAvailableSubject();
    toastTitle = `获得 ${result.reward} 积分`;
  } catch (error) {
    toastTitle = error instanceof Error ? error.message : "打卡失败";
  } finally {
    uni.hideLoading();
  }

  uni.showToast({ title: toastTitle, icon: "none" });
}

function goHome() {
  uni.switchTab({ url: "/pages/home/index" });
}

function clampMinutes(value: number) {
  return Math.min(240, Math.max(5, Math.round(value || 5)));
}
</script>

<style>
.page {
  min-height: 100vh;
  padding: 24rpx 28rpx 132rpx;
  background:
    radial-gradient(circle at 18% 0%, rgba(47, 133, 90, 0.12), transparent 34%),
    linear-gradient(180deg, #f5faf6 0%, #f8fbf8 100%);
}

.content,
.empty {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.empty {
  justify-content: center;
  min-height: 70vh;
  text-align: center;
}

.empty-title {
  color: #17233a;
  font-size: 42rpx;
  font-weight: 900;
}

.empty-copy {
  color: #66758a;
  font-size: 28rpx;
  line-height: 1.5;
}

.summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24rpx;
  padding: 30rpx;
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.2), transparent 26%),
    linear-gradient(135deg, #1f3149 0%, #2f855a 100%);
  color: #ffffff;
  box-shadow: 0 18rpx 42rpx rgba(31, 49, 73, 0.12);
}

.summary-kicker {
  display: block;
  color: rgba(255, 255, 255, 0.74);
  font-size: 22rpx;
  font-weight: 800;
}

.summary-title {
  display: block;
  margin-top: 6rpx;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1.05;
}

.summary-copy {
  width: 248rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 23rpx;
  font-weight: 700;
  line-height: 1.35;
  text-align: right;
}

.check-card,
.recent-card {
  box-sizing: border-box;
  padding: 26rpx;
  border: 1rpx solid #dce7df;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9),
    0 14rpx 34rpx rgba(31, 49, 73, 0.06);
}

.check-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.field {
  min-width: 0;
}

.field-head,
.compact-field,
.log-row,
.proof-card,
.upload-card {
  display: flex;
  align-items: center;
}

.field-head {
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 14rpx;
}

.field-title {
  color: #17233a;
  font-size: 29rpx;
  font-weight: 900;
}

.field-value,
.field-hint,
.required {
  color: #6d7b8d;
  font-size: 23rpx;
  font-weight: 800;
}

.required {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #ecf7ef;
  color: #2f855a;
}

.subject-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.subject-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  height: 78rpx;
  border: 2rpx solid #e0e9e2;
  border-radius: 16rpx;
  background: #f8fbf8;
  color: #42536b;
  font-size: 28rpx;
  font-weight: 900;
  text-align: center;
}

.subject-tab.selected {
  border-color: #2f855a;
  background: #eaf7ef;
  color: #2f855a;
}

.subject-tab.completed {
  border-color: #d6e4dc;
  background: #f1f6f3;
  color: #7b8a82;
}

.subject-tab.completed.selected {
  border-color: #2f855a;
  background: #eaf7ef;
  color: #2f855a;
}

.subject-name {
  font-size: 28rpx;
  line-height: 1.05;
}

.subject-state {
  color: inherit;
  font-size: 18rpx;
  font-weight: 900;
  line-height: 1;
}

.subject-progress {
  display: block;
  margin-top: 12rpx;
  color: #6d7b8d;
  font-size: 22rpx;
  font-weight: 700;
}

.compact-field {
  justify-content: space-between;
  gap: 18rpx;
}

.field-copy {
  min-width: 128rpx;
}

.field-copy .field-title,
.field-copy .field-hint {
  display: block;
}

.field-copy .field-hint {
  margin-top: 6rpx;
}

.duration-control {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 12rpx;
}

.step-button {
  flex: none;
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #1f3149;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 72rpx;
}

.duration-box {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: #f6faf7;
}

.duration-input {
  width: 92rpx;
  color: #17233a;
  font-size: 34rpx;
  font-weight: 900;
  text-align: center;
}

.duration-unit {
  color: #6d7b8d;
  font-size: 24rpx;
  font-weight: 700;
}

.upload-card {
  gap: 18rpx;
  min-height: 132rpx;
  padding: 22rpx;
  border: 2rpx dashed #b8d8c5;
  border-radius: 18rpx;
  background: #f5fbf7;
}

.upload-icon {
  flex: none;
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: #2f855a;
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 700;
  line-height: 68rpx;
  text-align: center;
}

.upload-copy,
.proof-info,
.log-copy {
  min-width: 0;
  flex: 1;
}

.upload-title,
.proof-title,
.log-subject {
  display: block;
  color: #17233a;
  font-size: 27rpx;
  font-weight: 900;
}

.upload-hint,
.proof-hint,
.log-date,
.empty-log {
  display: block;
  margin-top: 6rpx;
  color: #6d7b8d;
  font-size: 23rpx;
  line-height: 1.35;
}

.proof-card {
  gap: 16rpx;
  min-height: 132rpx;
  padding: 14rpx;
  border: 1rpx solid #dce7df;
  border-radius: 18rpx;
  background: #f8fbf8;
}

.proof-image {
  flex: none;
  width: 112rpx;
  height: 112rpx;
  border-radius: 16rpx;
  background: #e8efe9;
}

.proof-actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 10rpx;
}

.ghost-button {
  width: 92rpx;
  height: 44rpx;
  border: 1rpx solid #cfe0d4;
  border-radius: 999rpx;
  background: #ffffff;
  color: #2f855a;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 44rpx;
}

.ghost-button.danger {
  border-color: #f2d2c8;
  color: #c2410c;
}

.note-input {
  box-sizing: border-box;
  width: 100%;
  min-height: 104rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  background: #f6faf7;
  color: #17233a;
  font-size: 26rpx;
  line-height: 1.42;
}

.primary-button {
  height: 88rpx;
  border-radius: 18rpx;
  background: #94a3b8;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 88rpx;
  box-shadow: none;
}

.primary-button.ready {
  background: linear-gradient(135deg, #1f3149, #2f855a);
  box-shadow: 0 16rpx 34rpx rgba(47, 133, 90, 0.2);
}

.recent-card {
  padding-bottom: 14rpx;
}

.log-row {
  gap: 16rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid #edf2ee;
}

.log-row:first-of-type {
  border-top: 0;
}

.log-photo {
  flex: none;
  width: 68rpx;
  height: 68rpx;
  border-radius: 14rpx;
  background: #e8efe9;
}

.log-reward {
  flex: none;
  color: #2f855a;
  font-size: 28rpx;
  font-weight: 900;
}
</style>
