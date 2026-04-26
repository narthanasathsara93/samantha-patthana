<template>
  <div class="pagination">
    <button @click="$emit('prev')" :disabled="currentIndex === 0">Prev</button>
    <span>{{ currentIndex + 1 }} / {{ totalVerses }}</span>
    <button @click="$emit('next')" :disabled="currentIndex === totalVerses - 1">Next</button>
  </div>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    default: 0
  },
  totalVerses: {
    type: Number,
    default: 0
  }
})

defineEmits(['prev', 'next'])
</script>

<style scoped>
/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 14px 0;
}

.pagination span {
  font-size: 14px;
  color: #666;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #f1f3f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover {
  background: #e2e8f0;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>