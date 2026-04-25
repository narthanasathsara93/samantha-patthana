<template>
  <button
    class="autoplay-btn"
    :class="{ active: isAutoPlaying }"
    @click="$emit('toggle-autoplay')"
    :title="isAutoPlaying ? 'Stop autoplay' : 'Start autoplay'"
  >
    ⟳
  </button>
</template>

<script setup>
defineProps({
  isAutoPlaying: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-autoplay'])
</script>

<style scoped>
/* Autoplay Button */
.autoplay-btn {
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.autoplay-btn:hover {
  background: #e0e7ff;
  transform: scale(1.05);
}

.autoplay-btn.active {
  background: #4f46e5;
  color: white;
}
</style>