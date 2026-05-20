<template>
  <div class="practice-page">
    <Transition name="practice-view" mode="out-in">
      <LevelSelect
        v-if="!selectedLevel"
        key="level-select"
        @select-level="handleSelectLevel"
        @go-home="goHome"
      />
      <QuestionCard
        v-else-if="!isFinished"
        :display-content="currentDisplayContent"
        :title="currentQuestionTitle"
        :current-index="currentQuestionIndex"
        :total-questions="sessionQuestions.length"
        :selected-level="selectedLevel"
        :is-answer-revealed="isCurrentAnswerRevealed"
        :timer-label="timerLabel"
        :total-practice-seconds="selectedPracticeMinutes * 60"
        @end-session="endSession"
        @toggle-answer="toggleAnswerReveal"
        @go-next="goNext"
      />
      <ResultScreen
        v-else
        key="result-screen"
        :selected-level="selectedLevel"
        :total-questions="sessionQuestions.length"
        @restart-level="restartLevel"
        @change-level="changeLevel"
        @go-home="goHome"
      />
    </Transition>
    <ConfirmDialog
      :show="isPracticeOrderConfirmOpen"
      title="පුහුණව ඇරඹීමට පෙර"
      message="පහත සකසනයන් භාවිතයෙන් වඩාත් සාර්ථක ලෙස පුහුණුවෙහි යෙදිය හැක."
      confirm-label="ආරම්භ කරන්න"
      cancel-label="අවලංගු කරන්න"
      is-large-height="true"
      :dismiss-emits-cancel="false"
      @confirm="startPendingLevel"
      @cancel="closePracticeOrderConfirm"
      @dismiss="closePracticeOrderConfirm"
    >
      <div class="practice-start-settings">
        <!-- Question 1 -->
        <div class="setting-block">
          <p class="setting-question">
            <span class="timer-icon-wrapper">
              <img
                class="shuffle-icon"
                :src="getIcon(`icons/shuffle.png`)"
                alt=""
            /></span>
            <br />
            ප්‍රත්‍යයන් අහඹු ලෙස දිස්වන්න අවශ්‍යද?
          </p>
          <div class="radio-group">
            <button
              type="button"
              class="radio-option"
              :class="{ active: isPendingRandomOrder }"
              @click="isPendingRandomOrder = true"
            >
              <span class="radio-circle"></span>
              ඔව්
            </button>
            <button
              type="button"
              class="radio-option"
              :class="{ active: !isPendingRandomOrder }"
              @click="isPendingRandomOrder = false"
            >
              <span class="radio-circle"></span>
              නැත
            </button>
          </div>
        </div>
        <!-- Question 2 -->
        <div class="setting-block">
          <p class="setting-question">
            <span class="timer-icon-wrapper">
              <img
                class="timer-icon"
                :src="getIcon(`icons/timer.png`)"
                alt=""
              />
            </span>
            <br />
            ටයිමරය සැකසීමට අවශ්‍යද?
          </p>
          <div class="radio-group">
            <button
              type="button"
              class="radio-option"
              :class="{ active: isPendingTimedPractice }"
              @click="isPendingTimedPractice = true"
            >
              <span class="radio-circle"></span>
              ඔව්
            </button>
            <button
              type="button"
              class="radio-option"
              :class="{ active: !isPendingTimedPractice }"
              @click="isPendingTimedPractice = false"
            >
              <span class="radio-circle"></span>
              නැත
            </button>
          </div>
          <!-- Timer -->
          <Transition name="timer-fade">
            <div v-if="isPendingTimedPractice" class="time-select">
              <span class="time-select-title">
                අවශ්‍ය කාලය (මිනිත්තු වලින්) තෝරාගන්න.
              </span>
              <div
                class="time-wheel"
                role="listbox"
                tabindex="0"
                aria-label="කාලය"
                @wheel.prevent="handleTimeWheel"
                @keydown.left.prevent="shiftPracticeMinutes(-1)"
                @keydown.right.prevent="shiftPracticeMinutes(1)"
                @touchstart.passive="handleTimeTouchStart"
                @touchend="handleTimeTouchEnd"
              >
                <button
                  v-for="option in visiblePracticeMinuteOptions"
                  :key="`${option.offset}-${option.minutes}`"
                  class="time-wheel-option"
                  :class="{
                    selected: option.offset === 0,
                    near: Math.abs(option.offset) === 1,
                  }"
                  type="button"
                  @click="selectedPracticeMinutes = option.minutes"
                >
                  {{ option.minutes }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </ConfirmDialog>
    <ConfirmDialog
      :show="isEndSessionConfirmOpen"
      title="පුහුණුව නැවත අරඹන්න?"
      message="වත්මන් පුහුණුවේ ප්‍රගතිය මැකී යනු ඇත.<br>අපහසුතා මට්ටම වෙනස් කිරීම හෝ නැවත මුල සිට ඇරඹිය හැක."
      confirm-label="ඔව්"
      cancel-label="නැත"
      @confirm="confirmEndSession"
      @cancel="closeEndSessionConfirm"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ConfirmDialog from "../ConfirmDialog.vue";
import LevelSelect from "./LevelSelect.vue";
import QuestionCard from "./QuestionCard.vue";
import ResultScreen from "./ResultScreen.vue";
import { versesData } from "@/data/questionData";
import { getAssetUrl } from "../../utils/assets";

const router = useRouter();

const selectedLevel = ref("");
const currentQuestionIndex = ref(0);
const isFinished = ref(false);
const isCurrentAnswerRevealed = ref(false);
const isEndSessionConfirmOpen = ref(false);
const isPracticeOrderConfirmOpen = ref(false);
const pendingLevel = ref("");
const isPendingRandomOrder = ref(true);
const isPendingTimedPractice = ref(true);
const isSessionRandomOrder = ref(false);
const isSessionTimedPractice = ref(false);
const selectedPracticeMinutes = ref(60);
const remainingSeconds = ref(0);
const timerEndsAt = ref(0);
const timerIntervalId = ref(null);
const timeTouchStartX = ref(null);
const lastTimeWheelAt = ref(0);
const sessionQuestions = ref([]);
const practiceSessionStorageKey = "practice-mode-session-v1";
const practiceSettingsStorageKey = "practice-start-settings-v1";
const practiceMinuteOptions = [
  90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 1,
];

const difficultyRanges = {
  easy: [0.2, 0.25],
  medium: [0.5, 0.6],
  hard: [0.87, 0.99],
};

const currentQuestion = computed(() => {
  return sessionQuestions.value[currentQuestionIndex.value] || null;
});

const currentQuestionTitle = computed(() => {
  return currentQuestion.value?.title || "Fill in your mind";
});

const currentDisplayContent = computed(() => {
  if (!currentQuestion.value) {
    return "";
  }
  return isCurrentAnswerRevealed.value
    ? currentQuestion.value.content
    : currentQuestion.value.maskedContent;
});

const timerLabel = computed(() => {
  return isSessionTimedPractice.value
    ? formatTimer(remainingSeconds.value)
    : "";
});
const selectedPracticeMinuteIndex = computed(() => {
  const optionIndex = practiceMinuteOptions.indexOf(
    selectedPracticeMinutes.value,
  );
  return optionIndex === -1 ? 0 : optionIndex;
});
const visiblePracticeMinuteOptions = computed(() => {
  return [-2, -1, 0, 1, 2].map((offset) => {
    const optionIndex = loopIndex(
      selectedPracticeMinuteIndex.value + offset,
      practiceMinuteOptions.length,
    );
    return {
      minutes: practiceMinuteOptions[optionIndex],
      offset,
    };
  });
});
const getIcon = (icon) => {
  return getAssetUrl(icon);
};
function handleSelectLevel(level) {
  pendingLevel.value = level;
  isPracticeOrderConfirmOpen.value = true;
}

function startPendingLevel() {
  startPracticeSession(isPendingRandomOrder.value);
}

function startPracticeSession(useRandomOrder) {
  if (!pendingLevel.value) {
    return;
  }
  const level = pendingLevel.value;
  isPracticeOrderConfirmOpen.value = false;
  pendingLevel.value = "";
  isSessionRandomOrder.value = useRandomOrder;
  isSessionTimedPractice.value = isPendingTimedPractice.value;
  selectedLevel.value = level;
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  sessionQuestions.value = buildSessionQuestions(level, useRandomOrder);
  if (isSessionTimedPractice.value) {
    startSessionTimer(selectedPracticeMinutes.value);
  } else {
    stopSessionTimer();
  }
}

function closePracticeOrderConfirm() {
  isPracticeOrderConfirmOpen.value = false;
  pendingLevel.value = "";
}

function endSession() {
  isEndSessionConfirmOpen.value = true;
}

function confirmEndSession() {
  isEndSessionConfirmOpen.value = false;
  stopSessionTimer();
  clearSessionState();
  selectedLevel.value = "";
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  isSessionRandomOrder.value = false;
  isSessionTimedPractice.value = false;
  sessionQuestions.value = [];
}

function closeEndSessionConfirm() {
  isEndSessionConfirmOpen.value = false;
}

function handleTimeWheel(event) {
  const now = Date.now();
  if (now - lastTimeWheelAt.value < 180) {
    return;
  }
  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
  if (Math.abs(delta) < 8) {
    return;
  }
  lastTimeWheelAt.value = now;
  shiftPracticeMinutes(delta > 0 ? 1 : -1);
}

function handleTimeTouchStart(event) {
  timeTouchStartX.value = event.changedTouches[0]?.clientX ?? null;
}

function handleTimeTouchEnd(event) {
  if (timeTouchStartX.value === null) {
    return;
  }
  const endX = event.changedTouches[0]?.clientX ?? timeTouchStartX.value;
  const distance = timeTouchStartX.value - endX;
  timeTouchStartX.value = null;
  if (Math.abs(distance) < 18) {
    return;
  }
  shiftPracticeMinutes(distance > 0 ? 1 : -1);
}

function shiftPracticeMinutes(direction) {
  const nextIndex = loopIndex(
    selectedPracticeMinuteIndex.value + direction,
    practiceMinuteOptions.length,
  );
  selectedPracticeMinutes.value = practiceMinuteOptions[nextIndex];
}

function goNext() {
  const isLastQuestion =
    currentQuestionIndex.value === sessionQuestions.value.length - 1;
  if (isLastQuestion) {
    stopSessionTimer();
    isFinished.value = true;
    return;
  }
  currentQuestionIndex.value += 1;
  isCurrentAnswerRevealed.value = false;
}

function toggleAnswerReveal() {
  isCurrentAnswerRevealed.value = !isCurrentAnswerRevealed.value;
}

function restartLevel() {
  if (!selectedLevel.value) {
    return;
  }
  sessionQuestions.value = buildSessionQuestions(
    selectedLevel.value,
    isSessionRandomOrder.value,
  );
  if (isSessionTimedPractice.value) {
    startSessionTimer(selectedPracticeMinutes.value);
  } else {
    stopSessionTimer();
  }
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
}

function changeLevel() {
  stopSessionTimer();
  clearSessionState();
  selectedLevel.value = "";
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  isSessionRandomOrder.value = false;
  isSessionTimedPractice.value = false;
  sessionQuestions.value = [];
}

function goHome() {
  router.push({ name: "Home" });
}

function getLevelKey(level) {
  if (level === "ආධුනික") {
    return "easy";
  } else if (level === "මධ්‍යස්ථ") {
    return "medium";
  } else if (level === "ප්‍රවීණ") {
    return "hard";
  }
}

function buildSessionQuestions(level, useRandomOrder = false) {
  const orderedVerses = useRandomOrder
    ? shuffleArray(versesData)
    : [...versesData];
  const [minRatio, maxRatio] =
    difficultyRanges[getLevelKey(level)] || difficultyRanges.easy;
  return orderedVerses.map((verse) => {
    const hideRatio = randomInRange(minRatio, maxRatio);
    return {
      ...verse,
      maskedContent: createMaskedContent(verse.content, hideRatio),
    };
  });
}

function createMaskedContent(content, hideRatio) {
  const tokens = content.split(/(<br\s*\/?>|\s+)/gi).filter(Boolean);
  const wordIndexes = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const isBrToken = /^<br\s*\/?>$/i.test(token);
    const isWhitespace = /^\s+$/.test(token);
    if (!isBrToken && !isWhitespace) {
      wordIndexes.push(i);
    }
  }
  if (!wordIndexes.length) {
    return content;
  }
  const rawHideCount = Math.round(wordIndexes.length * hideRatio);
  const hideCount = Math.min(wordIndexes.length - 1, Math.max(1, rawHideCount));
  const hiddenIndexes = new Set(shuffleArray(wordIndexes).slice(0, hideCount));
  const maskedTokens = tokens.map((token, index) => {
    if (hiddenIndexes.has(index)) {
      return maskWordToken(token);
    }
    return token;
  });
  return maskedTokens.join("");
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function maskWordToken(token) {
  // Preserve surrounding punctuation; replace word body with a width-matched blank.
  const punctuationRegex = /[.,!?;:()[\]{}"'`~\-–—]/;
  let start = 0;
  let end = token.length - 1;
  while (start <= end && punctuationRegex.test(token[start])) {
    start += 1;
  }
  while (end >= start && punctuationRegex.test(token[end])) {
    end -= 1;
  }
  if (start > end) {
    return token;
  }
  const prefix = escapeHtml(token.slice(0, start));
  const suffix = escapeHtml(token.slice(end + 1));
  const body = token.slice(start, end + 1);
  const charCount = Math.max(1, [...body].length);
  // Width scales with verse font-size (em); factor tuned for Sinhala vs. Latin `ch`.
  const blank = `<span class="word-blank" style="--word-blank-len:${charCount}" aria-hidden="true"></span>`;
  return `${prefix}${blank}${suffix}`;
}

function shuffleArray(items) {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function startSessionTimer(minutes) {
  const durationSeconds = Math.max(0, Number(minutes) * 60);
  remainingSeconds.value = durationSeconds;
  timerEndsAt.value = Date.now() + durationSeconds * 1000;
  syncRemainingTime();
  stopTimerInterval();
  timerIntervalId.value = window.setInterval(syncRemainingTime, 1000);
}

function restoreSessionTimer() {
  if (
    !selectedLevel.value ||
    isFinished.value ||
    !isSessionTimedPractice.value
  ) {
    return;
  }
  if (!timerEndsAt.value && remainingSeconds.value > 0) {
    timerEndsAt.value = Date.now() + remainingSeconds.value * 1000;
  }
  syncRemainingTime();
  if (!isFinished.value) {
    stopTimerInterval();
    timerIntervalId.value = window.setInterval(syncRemainingTime, 1000);
  }
}

function syncRemainingTime() {
  if (!timerEndsAt.value) {
    // If the timer is enabled and we've reached 00:00 (or timer state was lost),
    // end the practice session immediately regardless of the current verse.
    remainingSeconds.value = 0;

    if (
      isSessionTimedPractice.value &&
      selectedLevel.value &&
      !isFinished.value
    ) {
      isFinished.value = true;
    }

    return;
  }
  remainingSeconds.value = Math.max(
    0,
    Math.ceil((timerEndsAt.value - Date.now()) / 1000),
  );
  if (
    remainingSeconds.value === 0 &&
    selectedLevel.value &&
    !isFinished.value
  ) {
    stopSessionTimer();
    isFinished.value = true;
  }
}

function stopSessionTimer() {
  stopTimerInterval();
  timerEndsAt.value = 0;
  remainingSeconds.value = 0;
}

function stopTimerInterval() {
  if (!timerIntervalId.value) {
    return;
  }
  window.clearInterval(timerIntervalId.value);
  timerIntervalId.value = null;
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
}

function saveSessionState() {
  const snapshot = {
    selectedLevel: selectedLevel.value,
    currentQuestionIndex: currentQuestionIndex.value,
    isFinished: isFinished.value,
    isCurrentAnswerRevealed: isCurrentAnswerRevealed.value,
    isSessionRandomOrder: isSessionRandomOrder.value,
    isSessionTimedPractice: isSessionTimedPractice.value,
    selectedPracticeMinutes: selectedPracticeMinutes.value,
    remainingSeconds: remainingSeconds.value,
    timerEndsAt: timerEndsAt.value,
    sessionQuestions: sessionQuestions.value,
  };
  localStorage.setItem(practiceSessionStorageKey, JSON.stringify(snapshot));
}

function savePracticeSettings() {
  const snapshot = {
    isRandomOrder: isPendingRandomOrder.value,
    isTimedPractice: isPendingTimedPractice.value,
    selectedPracticeMinutes: selectedPracticeMinutes.value,
  };
  localStorage.setItem(practiceSettingsStorageKey, JSON.stringify(snapshot));
}

function restorePracticeSettings() {
  const raw = localStorage.getItem(practiceSettingsStorageKey);
  if (!raw) {
    return;
  }
  try {
    const snapshot = JSON.parse(raw);
    isPendingRandomOrder.value =
      snapshot?.isRandomOrder === undefined
        ? true
        : Boolean(snapshot.isRandomOrder);
    isPendingTimedPractice.value =
      snapshot?.isTimedPractice === undefined
        ? true
        : Boolean(snapshot.isTimedPractice);
    selectedPracticeMinutes.value = practiceMinuteOptions.includes(
      snapshot?.selectedPracticeMinutes,
    )
      ? snapshot.selectedPracticeMinutes
      : 60;
  } catch {
    localStorage.removeItem(practiceSettingsStorageKey);
  }
}

function restoreSessionState() {
  const raw = localStorage.getItem(practiceSessionStorageKey);
  if (!raw) {
    return;
  }
  try {
    const snapshot = JSON.parse(raw);
    const level = snapshot?.selectedLevel;
    const questions = Array.isArray(snapshot?.sessionQuestions)
      ? snapshot.sessionQuestions
      : [];
    const index = Number(snapshot?.currentQuestionIndex ?? 0);
    if (!level || !questions.length) {
      return;
    }
    selectedLevel.value = level;
    sessionQuestions.value = questions;
    isFinished.value = Boolean(snapshot?.isFinished);
    isCurrentAnswerRevealed.value = Boolean(snapshot?.isCurrentAnswerRevealed);
    isSessionRandomOrder.value = Boolean(snapshot?.isSessionRandomOrder);
    isSessionTimedPractice.value = Boolean(
      snapshot?.isSessionTimedPractice || snapshot?.timerEndsAt,
    );
    selectedPracticeMinutes.value = practiceMinuteOptions.includes(
      snapshot?.selectedPracticeMinutes,
    )
      ? snapshot.selectedPracticeMinutes
      : 60;
    timerEndsAt.value = Number(snapshot?.timerEndsAt || 0);
    remainingSeconds.value = clamp(
      Number(snapshot?.remainingSeconds ?? selectedPracticeMinutes.value * 60),
      0,
      selectedPracticeMinutes.value * 60,
    );
    currentQuestionIndex.value = clamp(index, 0, questions.length - 1);
    if (isFinished.value) {
      currentQuestionIndex.value = questions.length - 1;
    }
    restoreSessionTimer();
  } catch {
    clearSessionState();
  }
}

function clearSessionState() {
  localStorage.removeItem(practiceSessionStorageKey);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loopIndex(index, length) {
  return ((index % length) + length) % length;
}

watch(
  [isPendingRandomOrder, isPendingTimedPractice, selectedPracticeMinutes],
  savePracticeSettings,
  { flush: "sync" },
);

watch(
  [
    selectedLevel,
    currentQuestionIndex,
    isFinished,
    isCurrentAnswerRevealed,
    isSessionRandomOrder,
    isSessionTimedPractice,
    selectedPracticeMinutes,
    remainingSeconds,
    timerEndsAt,
    sessionQuestions,
  ],
  saveSessionState,
  { deep: true },
);

restorePracticeSettings();
restoreSessionState();

onBeforeUnmount(stopTimerInterval);
</script>

<style scoped>
.practice-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 12px;
  background-image: url("../../assets/images/bg-1493.webp");
  background-size: cover;
  background-position: center bottom;
}

/* ======================
TRANSITIONS
====================== */

.practice-view-enter-active,
.practice-view-leave-active {
  transition:
    opacity 0.32s ease,
    transform 0.32s ease,
    filter 0.32s ease;
}

.practice-view-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: translateY(18px) scale(0.985);
}

.practice-view-leave-to {
  opacity: 0;
  filter: blur(3px);
  transform: translateY(-10px) scale(1.01);
}

.timer-fade-enter-active,
.timer-fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.timer-fade-enter-from,
.timer-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .practice-view-enter-active,
  .practice-view-leave-active,
  .timer-fade-enter-active,
  .timer-fade-leave-active {
    transition: none;
  }
  .practice-view-enter-from,
  .practice-view-leave-to,
  .timer-fade-enter-from,
  .timer-fade-leave-to {
    transform: none;
    filter: none;
  }
}

/* ======================
SETTINGS AREA
====================== */

.practice-start-settings {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 6px 0 10px;
}

.setting-block {
  padding: 16px 16px 14px;
  border-radius: 18px;
  background: rgba(255, 247, 233, 0.62);
  border: 1px solid rgba(122, 36, 16, 0.14);
  backdrop-filter: blur(2px);
}

.setting-question {
  margin: 0 0 14px;
  color: #5e3929;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(20px, 2.5vw, 24px);
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

/* ======================
RADIO OPTIONS
====================== */

.radio-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.radio-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border: none;
  background: transparent;
  padding-left: 20px;
  color: #6d4837;
  font-family: "Abhaya Libre", serif;
  font-size: 22px;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.radio-option:hover {
  font-weight: 700;
}

.radio-option.active {
  color: #7a2410;
  font-weight: bold;
}

.radio-circle {
  position: absolute;
  left: 0;
  top: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  transform: translateY(-50%);
}

.radio-option.active .radio-circle::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: currentColor;
}

/* ======================
TIME SELECT
====================== */

.time-select {
  padding-top: 8px;
}

.time-select-title {
  display: block;
  margin-bottom: 12px;
  color: #7a4d3a;
  font-family: "Abhaya Libre", serif;
  font-size: 18px;
  text-align: center;
}

.timer-icon,
.shuffle-icon {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  vertical-align: middle;
}
/* ======================
TIME WHEEL
====================== */

.time-wheel {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 42px);
  gap: 6px;
  justify-content: center;
  width: min(100%, 260px);
  margin: 0 auto;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid rgba(122, 36, 16, 0.14);
  background: rgba(255, 239, 214, 0.72);
  touch-action: pan-x;
  outline: none;
}

.time-wheel::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 42px;
  height: 36px;
  border-radius: 999px;
  background: #7a2410;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.time-wheel-option {
  position: relative;
  z-index: 1;
  width: 42px;
  min-height: 36px;
  border: none;
  background: transparent;
  color: #7b5a4c;
  font-family: "Abhaya Libre", serif;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.time-wheel-option.near {
  opacity: 0.65;
}

.time-wheel-option:not(.selected):not(.near) {
  opacity: 0.3;
  transform: scale(0.9);
}

.time-wheel-option.selected {
  color: #fff3df;
  font-size: 24px;
  font-weight: 700;
}

.time-wheel:focus-visible,
.time-wheel-option:focus-visible {
  outline: 2px solid rgba(122, 36, 16, 0.22);
  outline-offset: 2px;
}

/* ======================
MOBILE
====================== */

@media (max-width: 520px) {
  .practice-start-settings {
    gap: 14px;
  }
  .setting-block {
    padding: 16px 14px;
    border-radius: 18px;
  }
  .setting-question {
    font-size: 19px;
    margin-bottom: 12px;
  }
  .radio-option {
    font-size: 21px;
  }
  .time-select {
    padding-top: 10px;
  }
  .time-select-title {
    font-size: 17px;
  }
  .time-wheel {
    grid-template-columns: repeat(5, 38px);
    width: min(100%, 236px);
    padding: 4px;
  }
  .time-wheel::before {
    width: 38px;
    height: 32px;
  }
  .time-wheel-option {
    width: 38px;
    min-height: 32px;
    font-size: 18px;
  }
  .time-wheel-option.selected {
    font-size: 22px;
  }
}

@media (max-height: 700px) {
  .practice-start-settings {
    gap: 10px;
    margin-top: 6px;
  }
  .setting-block {
    padding: 12px 14px;
    border-radius: 16px;
  }
  .setting-question {
    margin-bottom: 8px;
    font-size: clamp(18px, 3vh, 21px);
    line-height: 1.2;
  }
  .radio-group {
    flex-direction: row;
    justify-content: center;
    gap: 6px;
  }
  .radio-option {
    font-size: clamp(19px, 3vh, 21px);
    padding-left: 18px;
  }
  .radio-circle {
    width: 14px;
    height: 14px;
  }
  .time-select {
    padding-top: 10px;
  }
  .time-select-title {
    margin-bottom: 8px;
    font-size: 16px;
  }
  .time-wheel {
    grid-template-columns: repeat(5, 36px);
    width: min(100%, 224px);
    padding: 4px;
  }
  .time-wheel::before {
    width: 36px;
    height: 30px;
  }
  .time-wheel-option {
    width: 36px;
    min-height: 30px;
    font-size: 17px;
  }
  .time-wheel-option.selected {
    font-size: 21px;
  }
}
</style>
