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
      message="ප්‍රත්‍යයන් තිරයේ දිස්විය යුතු පිළිවෙල තහවරු කරන්න."
      confirm-label="ආරම්භ කරන්න"
      cancel-label="අවලංගු කරන්න"
      is-large-height="true"
      :dismiss-emits-cancel="false"
      @confirm="startPendingLevel"
      @cancel="closePracticeOrderConfirm"
      @dismiss="closePracticeOrderConfirm"
    >
      <div class="practice-start-settings">
        <div class="order-toggle-group" role="radiogroup">
          <button
            class="order-toggle-option"
            :class="{ selected: !isPendingRandomOrder }"
            type="button"
            role="radio"
            :aria-checked="!isPendingRandomOrder"
            @click="isPendingRandomOrder = false"
          >
            <span class="order-toggle-dot" aria-hidden="true"></span>
            <span>පිළිවෙලින්</span>
          </button>
          <button
            class="order-toggle-option"
            :class="{ selected: isPendingRandomOrder }"
            type="button"
            role="radio"
            :aria-checked="isPendingRandomOrder"
            @click="isPendingRandomOrder = true"
          >
            <span class="order-toggle-dot" aria-hidden="true"></span>
            <span>අහඹු ලෙස</span>
          </button>
        </div>

        <div class="flow-toggle-group" role="radiogroup">
          <button
            class="order-toggle-option"
            :class="{ selected: isPendingTimedPractice }"
            type="button"
            role="radio"
            :aria-checked="isPendingTimedPractice"
            @click="isPendingTimedPractice = true"
          >
            <span class="order-toggle-dot" aria-hidden="true"></span>
            <span>with timer</span>
          </button>
          <button
            class="order-toggle-option"
            :class="{ selected: !isPendingTimedPractice }"
            type="button"
            role="radio"
            :aria-checked="!isPendingTimedPractice"
            @click="isPendingTimedPractice = false"
          >
            <span class="order-toggle-dot" aria-hidden="true"></span>
            <span>no timer</span>
          </button>
        </div>

        <div v-if="isPendingTimedPractice" class="time-select">
          <span class="time-select-title">කාලය (මිනිත්තු)</span>
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
              role="option"
              :aria-selected="option.offset === 0"
              @click="selectedPracticeMinutes = option.minutes"
            >
              {{ option.minutes }}
            </button>
          </div>
        </div>
      </div>
    </ConfirmDialog>

    <ConfirmDialog
      :show="isEndSessionConfirmOpen"
      title="පුහුණුව නැවත අරඹන්න?"
      message="වත්මන් පුහුණුවීම් ප්‍රගතිය මැකෙනු ඇත.<br>අපහසුතා මට්ටම වෙනස් කිරීම හෝ නැවත මුල සිට ඇරඹිය හැක."
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

const router = useRouter();

const selectedLevel = ref("");
const currentQuestionIndex = ref(0);
const isFinished = ref(false);
const isCurrentAnswerRevealed = ref(false);
const isEndSessionConfirmOpen = ref(false);
const isPracticeOrderConfirmOpen = ref(false);
const pendingLevel = ref("");
const isPendingRandomOrder = ref(false);
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
const practiceMinuteOptions = [60, 55, 50, 45, 40, 35, 30, 25, 20];

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
  return isSessionTimedPractice.value ? formatTimer(remainingSeconds.value) : "";
});
const selectedPracticeMinuteIndex = computed(() => {
  const optionIndex = practiceMinuteOptions.indexOf(selectedPracticeMinutes.value);

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

function handleSelectLevel(level) {
  pendingLevel.value = level;
  isPendingRandomOrder.value = false;
  isPendingTimedPractice.value = true;
  selectedPracticeMinutes.value = 60;
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
  isPendingRandomOrder.value = false;
  isPendingTimedPractice.value = true;
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

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
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
    if (timerEndsAt.value) {
      sessionQuestions.value = buildSessionQuestions(
        selectedLevel.value,
        isSessionRandomOrder.value,
      );
      currentQuestionIndex.value = 0;
      isCurrentAnswerRevealed.value = false;
      return;
    }

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
  if (!selectedLevel.value || isFinished.value || !isSessionTimedPractice.value) {
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
    remainingSeconds.value = 0;
    return;
  }

  remainingSeconds.value = Math.max(
    0,
    Math.ceil((timerEndsAt.value - Date.now()) / 1000),
  );

  if (remainingSeconds.value === 0 && selectedLevel.value && !isFinished.value) {
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

.practice-start-settings {
  margin: -4px 0 22px;
}

.order-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.flow-toggle-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.order-toggle-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border: 1px solid rgba(122, 36, 16, 0.24);
  border-radius: 10px;
  background: rgba(255, 234, 202, 0.58);
  color: #5e3a2b;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(18px, 2.5vw, 22px);
  line-height: 1.1;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.order-toggle-option.selected {
  border-color: rgba(122, 36, 16, 0.56);
  background: #7a2410;
  color: #ffeaca;
  box-shadow: 0 8px 18px rgba(111, 31, 14, 0.14);
}

.order-toggle-option:hover {
  transform: translateY(-2px);
}

.order-toggle-option:focus-visible {
  outline: 3px solid rgba(122, 36, 16, 0.28);
  outline-offset: 3px;
}

.order-toggle-dot {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.order-toggle-option.selected .order-toggle-dot {
  background: currentColor;
  box-shadow: inset 0 0 0 3px #7a2410;
}

.time-select {
  margin-top: 14px;
  text-align: left;
}

.time-select-title {
  display: block;
  margin: 0 0 8px;
  color: #5e3a2b;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(17px, 2.3vw, 20px);
  line-height: 1.1;
  text-align: center;
}

.time-wheel {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 44px);
  gap: 6px;
  justify-content: center;
  width: min(100%, 268px);
  margin: 0 auto;
  padding: 6px;
  border: 1px solid rgba(122, 36, 16, 0.24);
  border-radius: 999px;
  background: rgba(255, 234, 202, 0.58);
  outline: none;
  touch-action: pan-x;
}

.time-wheel::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 44px;
  height: 38px;
  border-radius: 33px;
  background: #7a2410;
  box-shadow: 0 8px 18px rgba(111, 31, 14, 0.14);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.time-wheel-option {
  position: relative;
  z-index: 1;
  width: 44px;
  min-height: 38px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #5e3a2b;
  font-family: "Abhaya Libre", serif;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    opacity 0.22s ease,
    color 0.22s ease;
}

.time-wheel-option.near {
  opacity: 0.72;
}

.time-wheel-option:not(.selected):not(.near) {
  opacity: 0.42;
  transform: scale(0.92);
}

.time-wheel-option.selected {
  color: #ffeaca;
  font-size: 24px;
  font-weight: 700;
  transform: scale(1.04);
}

.time-wheel:focus-visible,
.time-wheel-option:focus-visible {
  outline: 3px solid rgba(122, 36, 16, 0.28);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .practice-view-enter-active,
  .practice-view-leave-active {
    transition: opacity 0.01s linear;
  }

  .practice-view-enter-from,
  .practice-view-leave-to {
    filter: none;
    transform: none;
  }
}
</style>
