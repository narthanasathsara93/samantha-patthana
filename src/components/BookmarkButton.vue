<template>
  <button
    class="bookmark-btn"
    :class="{ active: isBookmarked }"
    @click="$emit('toggle-bookmark')"
    :title="
      isBookmarked
        ? 'සුරැකුම් ගොනුවෙන් ඉවත් කරන්න'
        : 'සුරැකුම් ගොනුවට එකතු කරන්න'
    "
    :aria-label="isBookmarked ? 'Remove bookmark' : 'Add bookmark'"
  >
    <img class="bookmark-icon" :src="getIcon(isBookmarked)" alt="" />
  </button>
</template>

<script setup>
import { getAssetUrl } from "../utils/assets";

defineProps({
  isBookmarked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-bookmark"]);

const getIcon = (isBookmarked) => {
  return isBookmarked
    ? getAssetUrl("icons/bookmarked.png")
    : getAssetUrl("icons/bookmark.png");
};
</script>

<style scoped>
.bookmark-icon {
  width: 24px;
  height: auto;
}

.bookmark-btn {
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: #6c757d;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-btn:hover {
  transform: scale(1.25);
}
</style>
