<template>
  <view class="page" :style="pageStyle">
    <view v-if="!progress" class="empty">
      <image class="empty-backdrop" src="/static/tools/checkin-initial-bg.webp" mode="aspectFill" />
      <view class="empty-shade" />
      <view class="empty-copywrap">
        <text class="empty-title">先选择宠物蛋</text>
        <text class="empty-copy">有了学习伙伴后，每次真实学习都能转化为积分。</text>
        <button class="check-action-button ready empty-button" @tap="goHome">去选择</button>
      </view>
    </view>

    <view v-else class="content">
      <view class="check-hero-card">
        <view class="check-hero-shade" />

        <view class="check-hero-head">
          <view class="check-hero-avatar">
            <image class="check-hero-avatar-image" :src="activePetAsset" mode="aspectFit" />
          </view>
          <view class="check-hero-copy">
            <text class="check-hero-kicker">{{ activeStage.name }} · {{ activeEgg.studyStyle }}</text>
            <text class="check-hero-name">{{ displayName }}</text>
          </view>
        </view>

        <text class="check-hero-title">完成今天的学习打卡</text>
        <text class="check-hero-desc">上传真实学习照片，固定记录 30 分钟，伙伴获得 30 积分能量。</text>
      </view>

      <view class="check-hero-stats">
        <view class="check-hero-stat">
          <text class="check-hero-stat-value">{{ petStore.todayMinutes }}</text>
          <text class="check-hero-stat-label">今日分钟</text>
        </view>
        <view class="check-hero-stat">
          <text class="check-hero-stat-value">{{ remainingSubjects }}</text>
          <text class="check-hero-stat-label">待完成科目</text>
        </view>
        <view class="check-hero-stat check-reward-stat">
          <text class="check-hero-stat-value">+{{ STUDY_CHECK_IN_REWARD }}</text>
          <text class="check-hero-stat-label">本次积分</text>
        </view>
      </view>

      <view class="check-panel">
        <view class="field">
          <view class="field-head">
            <view>
              <text class="field-title">学习科目</text>
              <text class="field-subtitle">今日已完成 {{ checkedSubjectsToday.length }}/{{ subjects.length }} 科</text>
            </view>
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
        </view>

        <view class="field">
          <view class="field-head">
            <view>
              <text class="field-title">打卡照片</text>
              <text class="field-subtitle">照片会成为伙伴成长档案的一部分</text>
            </view>
            <text class="required">必传</text>
          </view>

          <view v-if="photoPath" class="proof-strip">
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

          <view v-else class="upload-dropzone" @tap="choosePhoto">
            <view class="upload-icon-wrap">
              <view class="upload-icon" />
            </view>
            <view class="upload-copy">
              <text class="upload-title">上传学习照片</text>
              <text class="upload-hint">拍照或从相册选择</text>
            </view>
            <text class="upload-reward">+{{ STUDY_CHECK_IN_REWARD }}</text>
          </view>
        </view>

        <view class="field">
          <textarea v-model="note" class="note-input" maxlength="60" placeholder="备注（可选）" />
        </view>
      </view>

      <button class="check-action-button" :class="{ ready: canSubmit }" :disabled="!canSubmit" @tap="submitCheckIn">
        {{ submitLabel }}
      </button>

      <view class="recent-panel">
        <view class="field-head">
          <view>
            <text class="field-title">最近打卡</text>
            <text class="field-subtitle">{{ displayName }} 会记住你的连续努力</text>
          </view>
          <text class="field-hint">{{ recentLogs.length }} 条</text>
        </view>

        <view v-if="recentLogs.length === 0" class="empty-log">还没有打卡记录</view>
        <view v-for="log in recentLogs" :key="log.id" class="log-row">
          <image v-if="log.photoPath" class="log-photo" :src="log.photoPath" mode="aspectFill" />
          <view v-else class="log-photo log-photo-fallback">
            <text class="log-plus">+</text>
          </view>
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
import {
  STUDY_CHECK_IN_MINUTES,
  STUDY_CHECK_IN_REWARD,
  getEggOption,
  getPetStageAssetPath,
  type EggOption,
} from "@/domain/pet";
import { usePetStore } from "@/stores/pet";
import { getEggTheme, hexToRgb } from "@/utils/pet-theme";

const petStore = usePetStore();
const subjects = ["语文", "数学", "英语"] as const;
type StudySubject = (typeof subjects)[number];

const subject = ref<StudySubject>("数学");
const note = ref("");
const photoPath = ref("");
const progress = computed(() => petStore.progress);
const activeStage = computed(() => petStore.stage);
const activeEgg = computed(() => (progress.value ? getEggOption(progress.value.eggId) : getEggOption("windfire")));
const activePetAsset = computed(() =>
  progress.value ? getPetStageAssetPath(progress.value.eggId, activeStage.value.id) : "/static/tools/checkin-initial-bg.webp",
);
const displayName = computed(() =>
  progress.value && activeStage.value.id === "guardian" ? activeEgg.value.adultName : progress.value?.petName || activeEgg.value.petName,
);
const recentLogs = computed(() => petStore.recentStudyLogs);
const checkedSubjectsToday = computed(() => petStore.checkedSubjectsToday);
const checkedSubjectSet = computed(() => new Set(checkedSubjectsToday.value));
const selectedSubjectChecked = computed(() => checkedSubjectSet.value.has(subject.value));
const remainingSubjects = computed(() => Math.max(0, subjects.length - checkedSubjectsToday.value.length));
const canSubmit = computed(() => Boolean(photoPath.value) && !selectedSubjectChecked.value && !petStore.loading);
const pageStyle = computed(() => themeStyle(activeEgg.value));
const submitLabel = computed(() => {
  if (petStore.loading) {
    return "正在提交...";
  }

  if (selectedSubjectChecked.value) {
    return `今日${subject.value}已完成`;
  }

  return canSubmit.value ? `完成打卡，领取${STUDY_CHECK_IN_REWARD}积分` : "上传照片后打卡";
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
      minutes: STUDY_CHECK_IN_MINUTES,
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

function themeStyle(egg: EggOption) {
  const theme = getEggTheme(egg);

  return [
    `--app-bg:${theme.soft}`,
    `--app-bg-deep:${theme.light}`,
    `--theme-dark:${theme.dark}`,
    `--theme-deep:${theme.deep}`,
    `--theme-mid:${theme.mid}`,
    `--theme-light:${theme.light}`,
    `--theme-hot:${theme.hot}`,
    `--theme-soft:${theme.soft}`,
    `--theme-dark-rgb:${hexToRgb(theme.dark)}`,
    `--theme-deep-rgb:${hexToRgb(theme.deep)}`,
    `--theme-mid-rgb:${hexToRgb(theme.mid)}`,
    `--theme-hot-rgb:${hexToRgb(theme.hot)}`,
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
  padding: 20rpx 24rpx 132rpx;
  background:
    radial-gradient(circle at 18% -4%, rgba(var(--theme-hot-rgb), 0.26), transparent 34%),
    radial-gradient(circle at 92% 12%, rgba(var(--theme-mid-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, var(--app-bg-deep, #f4fbf6) 0%, #fbfcfb 46%, var(--app-bg, #f4fbf6) 100%);
}

.content,
.empty {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  justify-content: center;
  min-height: calc(100vh - var(--window-bottom) - 56rpx);
  padding: 58rpx 42rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.22);
  border-radius: 32rpx;
  background: var(--app-bg, #f4fbf6);
  text-align: center;
  box-shadow: 0 24rpx 62rpx rgba(var(--theme-mid-rgb), 0.14);
}

.empty-backdrop {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  filter: saturate(1.04) contrast(1.02) brightness(1.02);
}

.empty-shade {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.5) 28%, transparent 48%),
    linear-gradient(180deg, rgba(248, 255, 251, 0.62), rgba(248, 255, 251, 0.16) 42%, rgba(248, 255, 251, 0.52));
}

.empty-copywrap {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  transform: translateY(-18rpx);
}

.empty-title {
  color: #17233a;
  font-size: 42rpx;
  font-weight: 900;
}

.empty-copy {
  max-width: 520rpx;
  color: #66758a;
  font-size: 28rpx;
  line-height: 1.5;
}

.empty-button {
  width: 250rpx;
  margin-top: 46rpx;
}

.check-hero-card {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.64);
  border-radius: 26rpx;
  background:
    radial-gradient(circle at 88% 10%, rgba(var(--theme-hot-rgb), 0.28), transparent 30%),
    radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.2), transparent 26%),
    linear-gradient(145deg, var(--theme-deep) 0%, var(--theme-dark) 48%, #05070d 100%);
  box-shadow: 0 18rpx 42rpx rgba(var(--theme-dark-rgb), 0.2);
  color: #ffffff;
  isolation: isolate;
}

.check-hero-shade {
  position: absolute;
  z-index: -1;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(4, 7, 14, 0.38) 0%, rgba(4, 7, 14, 0.18) 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(1, 4, 8, 0.2));
}

.check-hero-head {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.check-hero-avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
  background:
    radial-gradient(circle at 38% 20%, rgba(255, 255, 255, 0.38), transparent 32%),
    rgba(255, 255, 255, 0.14);
}

.check-hero-avatar-image {
  width: 86rpx;
  height: 86rpx;
  filter: drop-shadow(0 12rpx 18rpx rgba(0, 0, 0, 0.26));
}

.check-hero-copy {
  min-width: 0;
  flex: 1;
}

.check-hero-kicker {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8rpx 14rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.12);
  color: var(--theme-light);
  font-size: 20rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-hero-name,
.check-hero-title,
.check-hero-desc {
  display: block;
  position: relative;
  z-index: 2;
}

.check-hero-name {
  max-width: 100%;
  overflow: hidden;
  margin-top: 8rpx;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 900;
  line-height: 1.14;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-hero-title {
  margin-top: 26rpx;
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1.18;
}

.check-hero-desc {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.82);
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.45;
}

.check-hero-stats {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  padding: 14rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.18);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.88),
    0 14rpx 32rpx rgba(var(--theme-mid-rgb), 0.1);
}

.check-hero-stat {
  min-width: 0;
  padding: 16rpx 8rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.16);
  border-radius: 18rpx;
  background: linear-gradient(180deg, #ffffff, rgba(var(--theme-mid-rgb), 0.07));
  text-align: center;
}

.check-reward-stat {
  border-color: rgba(var(--theme-hot-rgb), 0.24);
  background: linear-gradient(180deg, #ffffff, rgba(var(--theme-hot-rgb), 0.16));
}

.check-hero-stat-value,
.check-hero-stat-label {
  display: block;
}

.check-hero-stat-value {
  overflow: hidden;
  color: var(--theme-deep);
  font-size: 30rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-hero-stat-label {
  margin-top: 4rpx;
  color: #6d7b8d;
  font-size: 20rpx;
  font-weight: 800;
}

.check-panel,
.recent-panel {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 28rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.24);
  border-radius: 26rpx;
  background:
    radial-gradient(circle at 0% 0%, rgba(var(--theme-hot-rgb), 0.16), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.9));
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.92),
    0 18rpx 44rpx rgba(var(--theme-mid-rgb), 0.13);
}

.check-panel {
  display: flex;
  flex-direction: column;
  gap: 26rpx;
}

.check-panel::before,
.recent-panel::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 6rpx;
  background: linear-gradient(90deg, var(--theme-deep), var(--theme-hot), var(--theme-mid));
  content: "";
  opacity: 0.82;
}

.field {
  min-width: 0;
}

.field-head,
.log-row,
.proof-strip,
.upload-dropzone {
  display: flex;
  align-items: center;
}

.field-head {
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 16rpx;
}

.field-title {
  display: block;
  color: #17233a;
  font-size: 30rpx;
  font-weight: 900;
}

.field-subtitle {
  display: block;
  margin-top: 6rpx;
  color: #6d7b8d;
  font-size: 22rpx;
  line-height: 1.3;
}

.field-value,
.field-hint,
.required {
  flex: none;
  color: #6d7b8d;
  font-size: 23rpx;
  font-weight: 800;
}

.required {
  padding: 7rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(var(--theme-hot-rgb), 0.18);
  color: var(--theme-deep);
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
  min-width: 0;
  height: 82rpx;
  border: 2rpx solid rgba(var(--theme-mid-rgb), 0.2);
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.74);
  color: #42536b;
  font-size: 28rpx;
  font-weight: 900;
  text-align: center;
}

.subject-tab.selected {
  border-color: var(--theme-mid);
  background: linear-gradient(180deg, #ffffff, rgba(var(--theme-hot-rgb), 0.16));
  color: var(--theme-deep);
  box-shadow: 0 12rpx 26rpx rgba(var(--theme-hot-rgb), 0.18);
}

.subject-tab.completed {
  border-color: rgba(var(--theme-mid-rgb), 0.14);
  background: rgba(var(--theme-mid-rgb), 0.08);
  color: #7b8a82;
}

.subject-tab.completed.selected {
  border-color: var(--theme-mid);
  background: linear-gradient(180deg, #ffffff, rgba(var(--theme-hot-rgb), 0.16));
  color: var(--theme-deep);
}

.subject-name {
  max-width: 100%;
  overflow: hidden;
  font-size: 28rpx;
  line-height: 1.05;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject-state {
  color: inherit;
  font-size: 18rpx;
  font-weight: 900;
  line-height: 1;
}

.upload-dropzone {
  gap: 18rpx;
  min-height: 136rpx;
  padding: 22rpx;
  border: 2rpx dashed rgba(var(--theme-mid-rgb), 0.4);
  border-radius: 22rpx;
  background:
    radial-gradient(circle at 88% 20%, rgba(var(--theme-hot-rgb), 0.2), transparent 30%),
    rgba(255, 255, 255, 0.68);
}

.upload-icon-wrap {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, var(--theme-deep), var(--theme-mid));
  box-shadow: 0 14rpx 28rpx rgba(var(--theme-hot-rgb), 0.24);
}

.upload-icon {
  position: relative;
  width: 30rpx;
  height: 30rpx;
}

.upload-icon::before,
.upload-icon::after {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 999rpx;
  background: #ffffff;
  content: "";
  transform: translate(-50%, -50%);
}

.upload-icon::before {
  width: 30rpx;
  height: 8rpx;
}

.upload-icon::after {
  width: 8rpx;
  height: 30rpx;
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
  overflow: hidden;
  color: #17233a;
  font-size: 27rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.upload-reward {
  flex: none;
  color: var(--theme-deep);
  font-size: 28rpx;
  font-weight: 900;
}

.proof-strip {
  gap: 16rpx;
  min-height: 132rpx;
  padding: 14rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.2);
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.72);
}

.proof-image {
  flex: none;
  width: 112rpx;
  height: 112rpx;
  border-radius: 18rpx;
  background: rgba(var(--theme-mid-rgb), 0.1);
}

.proof-actions {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 10rpx;
}

.ghost-button {
  width: 94rpx;
  height: 44rpx;
  border: 1rpx solid rgba(var(--theme-mid-rgb), 0.28);
  border-radius: 999rpx;
  background: #ffffff;
  color: var(--theme-deep);
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
  min-height: 112rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.62)),
    rgba(var(--theme-mid-rgb), 0.06);
  color: #17233a;
  font-size: 26rpx;
  line-height: 1.42;
}

.check-action-button {
  width: 100%;
  height: 90rpx;
  border-radius: 20rpx;
  background: rgba(39, 53, 73, 0.16);
  color: #68778c;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 90rpx;
  box-shadow: none;
}

.check-action-button.ready {
  background: linear-gradient(135deg, var(--theme-deep), var(--theme-mid));
  color: #ffffff;
  box-shadow: 0 18rpx 38rpx rgba(var(--theme-hot-rgb), 0.28);
}

.recent-panel {
  padding-bottom: 14rpx;
}

.log-row {
  gap: 16rpx;
  padding: 18rpx 0;
  border-top: 1rpx solid rgba(var(--theme-mid-rgb), 0.12);
}

.log-row:first-of-type {
  border-top: 0;
}

.log-photo {
  flex: none;
  width: 70rpx;
  height: 70rpx;
  border-radius: 16rpx;
  background: rgba(var(--theme-mid-rgb), 0.12);
}

.log-photo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--theme-deep), var(--theme-mid));
}

.log-plus {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
}

.log-reward {
  flex: none;
  color: var(--theme-deep);
  font-size: 28rpx;
  font-weight: 900;
}
</style>
