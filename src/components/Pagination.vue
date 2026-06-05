<template>
  <div class="pagination">
    <button
      class="action-btn"
      type="button"
      @click="$emit('prev')"
      :disabled="currentIndex === 0"
      aria-label="Previous verse"
    >
      <span class="left-arrow btn-symbol"> ⬩➤ </span>
      <span> පෙර </span>
    </button>
    <span>
      {{ String(currentIndex + 1).padStart(2, "0") }}/ {{ totalVerses }}
    </span>

    <button
      class="action-btn"
      type="button"
      @click="$emit('next')"
      :disabled="currentIndex === totalVerses - 1"
      aria-label="Next verse"
    >
      <span> ඊළඟ </span>
      <span class="btn-symbol"> ⬩➤ </span>
    </button>

    <div class="actions"></div>
  </div>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    default: 0,
  },
  totalVerses: {
    type: Number,
    default: 0,
  },
});

defineEmits(["prev", "next"]);
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2vw, 18px);
  width: 100%;
  margin-top: 6px;
  padding: 4px 0;
  font-family: "Abhaya Libre", serif !important;
}

.pagination span {
  flex-shrink: 0;
  color: #5c2b1c;
  font-size: clamp(16px, 4vw, 20px);
  font-weight: 700;
  line-height: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 1vw, 10px);
  min-width: clamp(96px, 24vw, 140px);
  padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 18px);
  border: 1px solid #d8b48f;
  border-radius: 999px;
  background: #8d8a8a31;
  color: #ffeaca;
  font-family: inherit;
  font-size: clamp(16px, 4vw, 22px);
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    background 0.18s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  background: #e9dbc1;
}

.action-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.btn-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  line-height: 1;
  margin-bottom: -5px;
}

.left-arrow {
  transform: scaleX(-1);
}

@media (max-width: 520px) {
  .pagination {
    gap: 8px;
  }

  .action-btn {
    min-width: 88px;
    padding: 8px 10px;
    font-size: 16px;
  }

  .action-btn:hover:not(:disabled) {
    transform: none;
  }

  .pagination span {
    font-size: 16px;
  }
}
</style>
