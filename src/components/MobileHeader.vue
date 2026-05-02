<template>
  <span class="mobile-header">
    <button @click="$emit('toggle-sidebar')">☰</button>
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
    font-size: 18px;
    color: #3b0906;
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