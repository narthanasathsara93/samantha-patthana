<template>
  <section class="practice-card">
    <h2 class="title">මෙම පුහුණු වටය අවසන් කරන ලදී.</h2>
    <p class="subtitle">
      ({{ selectedLevelLabel }} අසීරුතා මට්ටම)
    </p>

    <div class="actions">
      <button class="primary-btn" @click="$emit('restart-level')">
        නැවත උත්සාහ කිරීමට
      </button>
      <button class="secondary-btn" @click="$emit('change-level')">
        අසීරුතා මට්ටම වෙනස් කිරීමට
      </button>
      <button class="secondary-btn" @click="$emit('go-home')">
        මුල් පිටුවට
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  selectedLevel: {
    type: String,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
});

const selectedLevelLabel = computed(() => props.selectedLevel.toUpperCase());

defineEmits(["restart-level", "change-level", "go-home"]);
</script>

<style scoped>
.practice-card {
  width: min(760px, 92vw);
  border-radius: 18px;
  padding: 32px 28px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);
  text-align: center;
}

.title {
  margin: 0;
  color: #4d3124;
  font-size: clamp(28px, 3.5vw, 40px);
}

.subtitle {
  margin: 10px 0 24px;
  color: #5e3a2b;
  font-size: clamp(18px, 2vw, 24px);
}

.actions {
  display: grid;
  gap: 10px;
}

.primary-btn,
.secondary-btn {
  min-height: 46px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 17px;
}

.primary-btn {
  border: none;
  background: #7a2410;
  color: #fff6e8;
}

.secondary-btn {
  border: 1px solid #7a2410;
  background: transparent;
  color: #7a2410;
}
</style>
