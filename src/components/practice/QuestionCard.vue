<template>
  <section class="practice-card">
    <div class="header">
      <span class="chip">{{ levelLabel }}</span>
      <span class="chip">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
    </div>

    <h2 class="question-title">{{ title }}</h2>

    <div class="verse-box">
      <p class="verse-text" v-html="displayContent"></p>
    </div>

    <div class="actions">
      <button
        class="action-btn"
        :disabled="currentIndex === 0"
        @click="$emit('go-previous')"
      >
        &lt;&lt; previous
      </button>
      <button class="action-btn reveal" @click="$emit('toggle-answer')">
        {{ isAnswerRevealed ? "Hide back" : "Reveal the answer" }}
      </button>
      <button
        class="action-btn"
        :disabled="totalQuestions === 0"
        @click="$emit('go-next')"
      >
        {{ isLastQuestion ? "finish >>" : "next >>" }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  displayContent: { type: String, required: true },
  currentIndex: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
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

defineEmits(["go-previous", "toggle-answer", "go-next"]);

const levelLabel = computed(() => props.selectedLevel.toUpperCase());
const isLastQuestion = computed(
  () => props.currentIndex === props.totalQuestions - 1,
);
</script>

<style scoped>
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
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 8px;
}

.chip {
  border-radius: 999px;
  background: #fff5e3;
  color: #6f1f0e;
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
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: auto;
}

.action-btn {
  width: 100%;
  border: 1px solid #d8b48f;
  border-radius: 10px;
  background: #fff9ef;
  color: #5e3a2b;
  text-align: center;
  padding: 12px 10px;
  font-size: clamp(14px, 1.5vw, 18px);
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #fff3de;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.reveal {
  border-color: #7a2410;
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
