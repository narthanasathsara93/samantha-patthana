<template>
  <div class="pagination">
    <button @click="$emit('prev')" :disabled="currentIndex === 0" aria-label="Previous verse">
      &lt;&lt; පෙර
    </button>
    <span>{{ currentIndex + 1 }} / {{ totalVerses }}</span>
    <button @click="$emit('next')" :disabled="currentIndex === totalVerses - 1" aria-label="Next verse">
      ඊළඟ &gt;&gt;
    </button>
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
/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 5px 0;
  margin-top: 3px;
}

.pagination span {
  font-size: 14px;
  color: #666;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #8d8a8a31;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover {
  background: #46000024;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination {
    margin-top: 0x;
  }
}

</style>