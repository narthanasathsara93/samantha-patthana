<template>
  <section class="practice-card">
    <div class="header">
      <span class="chip">{{ levelLabel }}</span>
      <div class="session-meta">
        <button
          class="end-session-btn"
          type="button"
          :title="getTitleReveal()"
          @click="$emit('toggle-answer')"
        >
          <img
            class="end-session-icon"
            :src="getIcon(isAnswerRevealed ? 'show.png' : 'hide.png')"
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
        <span class="chip">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
      </div>
    </div>

    <h2 class="question-title">{{ title }}</h2>

    <div class="verse-box">
      <p :key="isAnswerRevealed" class="verse-text" v-html="displayContent"></p>
    </div>

    <div class="actions">
      <button
        class="action-btn"
        type="button"
        :disabled="totalQuestions === 0"
        @click="$emit('go-next')"
      >
        {{ isLastQuestion ? "පුහුණු වටය අවසන් කරන්න ⏻" : "ඊළඟ >>" }}
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
});

defineEmits(["end-session", "toggle-answer", "go-next"]);

const levelLabel = computed(() => props.selectedLevel);
const isLastQuestion = computed(
  () => props.currentIndex === props.totalQuestions - 1,
);
const getIcon = (img) => getAssetUrl(`icons/${img}`);

const getTitleReveal = () =>
  props.isAnswerRevealed ? "පිළිතුර බලන්න" : "පිළිතුර වසන්න";
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  border-radius: 999px;
  background: #dfc1a763;
  color: #390701;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
}

.question {
  margin: 0 0 20px;
  color: #4d3124;
  font-size: clamp(23px, 2.8vw, 32px);
}

.question-title {
  margin: 0 0 12px;
  color: #3b0906;
  font-size: clamp(19px, 2.2vw, 26px);
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
  font-size: 18px;
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
  gap: 10px;
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

.end-session-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.action-btn {
  width: auto;
  border: 1px solid #d8b48f;
  border-radius: 10px;

  text-align: center;
  padding: 12px 10px;
  font-weight: 600;

  background-color: #7a3310;
  color: #ffe2b6;
  font-size: clamp(16px, 2.2vw, 12px);
  cursor: pointer;

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow:
    0 10px 30px rgba(111, 31, 14, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
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
  .practice-card {
    height: calc(100dvh - 26px);
    border-radius: 20px;
    padding: 18px 16px;
  }

  .verse-text {
    font-size: 18px;
    margin-top: 8px;
  }

  .actions {
    grid-template-columns: 1fr;
  }
}
</style>
