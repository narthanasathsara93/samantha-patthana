<template>
  <button
    class="autoplay-btn"
    :class="{ active: isAutoPlaying }"
    @click="$emit('toggle-autoplay')"
    :title="isAutoPlaying ? 'ස්වයං වාදනය නවතන්න' : 'ස්වයං වාදනය ආරම්භ කරන්න'"
  >
    <img class="autoplay-icon" :src="getIcon(isAutoPlaying)" />
  </button>
</template>

<script setup>
defineProps({
  isAutoPlaying: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-autoplay"]);

const getIcon = (isAutoPlaying) => {
  return isAutoPlaying
    ? require("@/assets/icons/autoplaying.gif")
    : require("@/assets/icons/autoplay.png");
};
</script>

<style scoped>
/* Autoplay Button */

.autoplay-icon {
  width: 23px;
  height: 23px;
}

.autoplay-btn {
  padding: 0;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.autoplay-btn:hover {
  background: rgba(245, 135, 135, 0.13);
  transform: scale(1.2);
}
</style>