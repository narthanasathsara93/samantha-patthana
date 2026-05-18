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
import { computed, ref, watch } from "vue";
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
const isSessionRandomOrder = ref(false);
const sessionQuestions = ref([]);
const practiceSessionStorageKey = "practice-mode-session-v1";

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

function handleSelectLevel(level) {
  pendingLevel.value = level;
  isPendingRandomOrder.value = false;
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
  selectedLevel.value = level;
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  sessionQuestions.value = buildSessionQuestions(level, useRandomOrder);
}

function closePracticeOrderConfirm() {
  isPracticeOrderConfirmOpen.value = false;
  pendingLevel.value = "";
  isPendingRandomOrder.value = false;
}

function endSession() {
  isEndSessionConfirmOpen.value = true;
}

function confirmEndSession() {
  isEndSessionConfirmOpen.value = false;
  clearSessionState();
  selectedLevel.value = "";
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  isSessionRandomOrder.value = false;
  sessionQuestions.value = [];
}

function closeEndSessionConfirm() {
  isEndSessionConfirmOpen.value = false;
}

function goNext() {
  const isLastQuestion =
    currentQuestionIndex.value === sessionQuestions.value.length - 1;

  if (isLastQuestion) {
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
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
}

function changeLevel() {
  clearSessionState();
  selectedLevel.value = "";
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  isSessionRandomOrder.value = false;
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

function saveSessionState() {
  const snapshot = {
    selectedLevel: selectedLevel.value,
    currentQuestionIndex: currentQuestionIndex.value,
    isFinished: isFinished.value,
    isCurrentAnswerRevealed: isCurrentAnswerRevealed.value,
    isSessionRandomOrder: isSessionRandomOrder.value,
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
    currentQuestionIndex.value = clamp(index, 0, questions.length - 1);

    if (isFinished.value) {
      currentQuestionIndex.value = questions.length - 1;
    }
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

watch(
  [
    selectedLevel,
    currentQuestionIndex,
    isFinished,
    isCurrentAnswerRevealed,
    isSessionRandomOrder,
    sessionQuestions,
  ],
  saveSessionState,
  { deep: true },
);

restoreSessionState();
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
