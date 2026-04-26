<template>
  <button
    class="bookmark-btn"
    :class="{ active: isBookmarked }"
    @click="$emit('toggle-bookmark')"
    :title="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
  >
    <img class="bookmark-icon" :src="getIcon(isBookmarked)" />
  </button>
</template>

<script setup>
defineProps({
  isBookmarked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-bookmark"]);

const getIcon = (isBookmarked) => {
  return isBookmarked
    ? require("@/assets/icons/bookmarked.png")
    : require("@/assets/icons/bookmark.png");
};

</script>

<style scoped>
.bookmark-icon {
  width: 23px;
  height: 23px;
}

.bookmark-btn {
  padding: 0;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  color: #6c757d;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-btn:hover {
  background: rgba(245, 135, 135, 0.13);
  transform: scale(1.05);
}

.bookmark-btn.active {
  background: #ffffff;
}

.bookmark-btn.active:hover {
  background: rgba(245, 135, 135, 0.13);
}
</style>