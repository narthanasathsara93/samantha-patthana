<template>
  <div class="practice-page">
    <LevelSelect
      v-if="!selectedLevel"
      @select-level="handleSelectLevel"
      @go-home="goHome"
    />

    <QuestionCard
      v-else-if="!isFinished"
      :display-content="currentDisplayContent"
      :current-index="currentQuestionIndex"
      :total-questions="sessionQuestions.length"
      :selected-level="selectedLevel"
      :is-answer-revealed="isCurrentAnswerRevealed"
      @go-previous="goPrevious"
      @toggle-answer="toggleAnswerReveal"
      @go-next="goNext"
    />

    <ResultScreen
      v-else
      :selected-level="selectedLevel"
      :total-questions="sessionQuestions.length"
      @restart-level="restartLevel"
      @change-level="changeLevel"
      @go-home="goHome"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import LevelSelect from "./LevelSelect.vue";
import QuestionCard from "./QuestionCard.vue";
import ResultScreen from "./ResultScreen.vue";
import { versesData } from "@/data/questionData";

const router = useRouter();

const selectedLevel = ref("");
const currentQuestionIndex = ref(0);
const isFinished = ref(false);
const isCurrentAnswerRevealed = ref(false);
const sessionQuestions = ref([]);
const practiceSessionStorageKey = "practice-mode-session-v1";

const difficultyRanges = {
  easy: [0.20, 0.25],
  medium: [0.45, 0.55],
  hard: [0.75, 0.85],
};

const currentQuestion = computed(() => {
  return sessionQuestions.value[currentQuestionIndex.value] || null;
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
  selectedLevel.value = level;
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  sessionQuestions.value = buildSessionQuestions(level);
}

function goPrevious() {
  if (currentQuestionIndex.value === 0) {
    return;
  }

  currentQuestionIndex.value -= 1;
  isCurrentAnswerRevealed.value = false;
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

  sessionQuestions.value = buildSessionQuestions(selectedLevel.value);
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
}

function changeLevel() {
  selectedLevel.value = "";
  currentQuestionIndex.value = 0;
  isFinished.value = false;
  isCurrentAnswerRevealed.value = false;
  sessionQuestions.value = [];
}

function goHome() {
  clearSessionState();
  router.push({ name: "Home" });
}

function buildSessionQuestions(level) {
  const shuffled = shuffleArray(versesData);
  const [minRatio, maxRatio] = difficultyRanges[level] || difficultyRanges.easy;

  return shuffled.map((verse) => {
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
  const hideCount = Math.min(
    wordIndexes.length - 1,
    Math.max(1, rawHideCount),
  );
  const hiddenIndexes = new Set(
    shuffleArray(wordIndexes).slice(0, hideCount),
  );

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
  background-image: url("../../assets/images/bg-1080.webp");
  background-size: cover;
  background-position: center;
}
</style>
