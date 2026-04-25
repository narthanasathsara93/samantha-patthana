<template>
  <button
    class="bookmark-btn"
    :class="{ active: isBookmarked }"
    @click="$emit('toggle-bookmark')"
    :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
  >
    {{ isBookmarked ? '★' : '☆' }}
  </button>
</template>

<script setup>
defineProps({
  isBookmarked: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-bookmark'])
</script>

<style scoped>
.bookmark-btn {
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-btn:hover {
  background: #e9ecef;
  transform: scale(1.05);
}

.bookmark-btn.active {
  background: #fff3cd;
  color: #ffc107;
}

.bookmark-btn.active:hover {
  background: #ffeaa7;
}
</style>