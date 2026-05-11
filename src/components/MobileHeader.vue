<template>
  <span class="mobile-header">
    <button @click="$emit('toggle-sidebar')" aria-label="Toggle sidebar">☰</button>
    <span class="mobile-header-title">{{ title }}</span>
  </span>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-sidebar"]);
</script>

<style scoped>
.mobile-header-title {
  font-size: 17px;
  font-weight: 900;
  color: #0e0a0a;
}

/* ===== Mobile Header ===== */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: start;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-header button {
  font-size: 20px;
  cursor: pointer;
  background: none;
  border: none;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
}
</style>
