<template>
  <section class="practice-card">
    <div class="header">
      <span class="chip">
        <img class="level-chip-icon" :src="getLabelIcon()" alt="" />
        <span class="chip-text">{{ levelLabel }}</span>
      </span>
      <div class="session-meta">
        <button
          class="end-session-btn"
          type="button"
          :aria-label="isAnswerRevealed ? 'Hide answer' : 'Show answer'"
          :title="getTitleReveal()"
          @click="$emit('toggle-answer')"
        >
          <img
            class="end-session-icon"
            :src="getIcon(isAnswerRevealed ? 'hide.png' : 'show.png')"
            alt=""
          />
        </button>
        <button
          class="end-session-btn"
          type="button"
          aria-label="End session"
          title="පුහුණුව නැවත මුල සිට අරඹන්න"
          @click="$emit('end-session')"
        >
          <img class="end-session-icon" :src="getIcon('restart.png')" alt="" />
        </button>
        <button
          class="end-session-btn"
          type="button"
          aria-label="Go to home page"
          title="මුල් පිටුව වෙත"
          @click="$emit('go-home')"
        >
          <img class="end-session-icon" :src="getIcon('home.png')" alt="" />
        </button>
        <span class="chip">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
      </div>
    </div>

    <div class="question-header">
      <Transition name="question-fade" mode="out-in">
        <h2 :key="questionContentKey" class="question-title">
          {{ title }}
        </h2>
      </Transition>

      <span
        v-if="timerLabel"
        class="timer-chip"
        :class="{ warning: isTimerWarning }"
      >
        {{ timerLabel }}
      </span>
    </div>

    <div class="verse-box">
      <Transition name="question-fade" mode="out-in">
        <p
          :key="`${questionContentKey}-${isAnswerRevealed ? 'revealed' : 'masked'}`"
          class="verse-text"
          v-html="displayContent"
        ></p>
      </Transition>
    </div>

    <div class="actions">
      <button
        class="action-btn"
        type="button"
        :aria-label="showFinishButton ? 'Finish practice session' : 'Next question'"
        :disabled="totalQuestions === 0"
        @click="$emit('go-next')"
      >
        <span>
          {{ showFinishButton ? "පුහුණු වටය අවසන් කරන්න" : "ඊළඟ" }}
        </span>
        <span class="btn-symbol">
          {{ showFinishButton ? "✿" : "⬩➤" }}
        </span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { getAssetUrl } from "../../utils/assets";

const props = defineProps({
  displayContent: { type: String, required: true },
  currentIndex: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    default: "Fill in your mind",
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  selectedLevel: {
    type: String,
    required: true,
  },
  isAnswerRevealed: {
    type: Boolean,
    required: true,
  },
  timerLabel: {
    type: String,
    default: "",
  },
  totalPracticeSeconds: {
    type: Number,
    default: 0,
  },
});

defineEmits(["end-session", "toggle-answer", "go-next", "go-home"]);

const levelLabel = computed(() => props.selectedLevel);
const isLastQuestion = computed(
  () => props.currentIndex === props.totalQuestions - 1,
);
const showFinishButton = computed(() => isLastQuestion.value);
const questionContentKey = computed(
  () => `${props.selectedLevel}-${props.currentIndex}`,
);
const isTimerWarning = computed(() => {
  if (!props.timerLabel || !props.totalPracticeSeconds) {
    return false;
  }

  const [minutes, seconds] = props.timerLabel.split(":").map(Number);
  const remaining = minutes * 60 + seconds;
  return remaining <= props.totalPracticeSeconds * 0.2;
});
const getIcon = (img) => getAssetUrl(`icons/${img}`);

const getLabelIcon = () => {
  switch (props.selectedLevel) {
    case "ආධුනික":
      return getIcon("level1_1.png");
    case "මධ්‍යස්ථ":
      return getIcon("level2_1.png");
    case "ප්‍රවීණ":
      return getIcon("level3_1.png");
    default:
      return "";
  }
};

const getTitleReveal = () =>
  props.isAnswerRevealed ? "පිළිතුර බලන්න" : "පිළිතුර වසන්න";
</script>

<style scoped>
button {
  font-family: "Abhaya Libre", serif !important;
}

.question-fade-enter-active,
.question-fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.question-fade-enter-from,
.question-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.practice-card {
  width: min(900px, 94vw);
  height: min(760px, calc(100dvh - 52px));
  border-radius: 12px;
  padding: 24px 24px 20px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 8px;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #dfc1a763;
  color: #390701;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.level-chip-icon {
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
}

.chip-text {
  display: flex;
  align-items: center;
  transform: translateY(0.5px);
}
.timer-chip {
  flex-shrink: 0;
  min-width: 74px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #7a2410;
  color: #ffeaca;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.3px;
  transition:
    background 0.3s ease,
    color 0.3s ease,
    box-shadow 0.3s ease;
}

.timer-chip.warning {
  background: #fff1ef;
  color: #c62828;
  box-shadow: 0 0 0 1px rgba(198, 40, 40, 0.16);
}

.question {
  margin: 0 0 20px;
  color: #4d3124;
  font-size: 16px;
}
.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.question-title {
  margin: 0;
  color: #3b0906;
  font-size: clamp(17px, 2.2vw, 19px);
}

.verse-box {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-top: 2px solid #c1956061;
  border-bottom: 2px solid #c1956061;
  border-radius: 0;
  background: transparent;
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
}

.verse-text {
  flex: 1;
  min-height: 0;
  margin: 0;
  margin-top: 10px;
  padding-right: 4px;
  overflow-y: auto;
  white-space: normal;
  color: #0e0a0a;
  line-height: 160%;
  font-size: 15px;
  font-weight: 600;
  scrollbar-width: thin;
  scrollbar-color: rgb(193 172 137) rgba(253, 241, 218, 0.9);
  -webkit-overflow-scrolling: touch;
  transition: opacity 0.3s ease;
}

.verse-text::-webkit-scrollbar {
  width: 8px;
}

.verse-text::-webkit-scrollbar-track {
  background: rgba(253, 241, 218, 0.85);
  border-radius: 4px;
}

.verse-text::-webkit-scrollbar-thumb {
  background: rgba(139, 30, 19, 0.4);
  border-radius: 4px;
}

.verse-text::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 30, 19, 0.55);
}

.verse-text :deep(.word-blank) {
  --word-blank-em-per-char: 0.82em;
  display: inline-block;
  vertical-align: -0.1em;
  height: 1.18em;
  width: calc(var(--word-blank-len, 1) * var(--word-blank-em-per-char));
  min-width: calc(var(--word-blank-len, 1) * var(--word-blank-em-per-char));
  margin: 0 0.06em;
  border-radius: 5px;
  background: rgba(193, 149, 96, 0.42);
  border: 1px solid rgba(160, 120, 80, 0.32);
  box-sizing: border-box;
  transition:
    opacity 0.3s ease,
    background 0.3s ease;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 300px;
  margin-top: auto;
}

.end-session-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(122, 36, 16, 0.28);
  border-radius: 999px;
  background: #fff5e3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.end-session-btn:hover {
  transform: translateY(-1px);
  background: #fff0d6;
}

.end-session-btn:active {
  transform: translateY(0) scale(0.96);
}

.end-session-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.btn-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 0.9em;
  margin-bottom: -5px;
}

.action-btn {
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #d8b48f;
  border-radius: 10px;
  padding: 12px 18px;
  background-color: #7a2410;
  color: #ffe8c4;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.1;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateX(6px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.985);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reveal {
  border-color: #7a2410;
}

.end {
  display: none;
}

@media (max-width: 720px) {
  .chip {
    font-size: 11px;
  }

  .practice-card {
    height: calc(100dvh - 26px);
    border-radius: 20px;
    padding: 18px 16px;
  }

  .verse-text {
    font-size: 14px;
    margin-top: 8px;
  }

  .actions {
    grid-template-columns: 1fr;
  }

  .end-session-btn {
    width: 27px;
    height: 27px;
  }

  .end-session-icon {
    width: 18px;
    height: 16px;
  }

  .question-header {
    align-items: flex-start;
  }

  .timer-chip {
    min-width: 66px;
    font-size: 16px;
    padding: 5px 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .question-fade-enter-active,
  .question-fade-leave-active,
  .verse-text,
  .verse-text :deep(.word-blank),
  .end-session-btn,
  .action-btn {
    transition: none;
  }

  .question-fade-enter-from,
  .question-fade-leave-to {
    transform: none;
  }
}
</style>
