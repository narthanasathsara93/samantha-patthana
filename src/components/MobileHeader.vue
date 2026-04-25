<template>
  <div class="mobile-header">
    <button @click="$emit('toggle-sidebar')">☰</button>
  </div>
</template>

<script setup>
defineEmits(['toggle-sidebar'])
</script>

<style scoped>
/* ===== Mobile Header ===== */
.mobile-header {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  margin-bottom: 12px;
}

.mobile-header button {
  font-size: 20px;
  cursor: pointer;
  background: none;
  border: none;
}

.mobile-header-right {
  display: flex;
  align-items: center;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }
}
</style>