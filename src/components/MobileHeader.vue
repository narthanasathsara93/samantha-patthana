<template>
  <span class="mobile-header">
    <button @click="$emit('toggle-sidebar')" aria-label="Toggle sidebar">
      <img class="gear-icon" :src="getIcon('gear.png')" alt="thinking" />
    </button>
    <span class="mobile-header-title">{{ title }}</span>
  </span>
</template>

<script setup>
import { getAssetUrl } from "../utils/assets";

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

const getIcon = () => {
  return getAssetUrl(`icons/menu.png`);
};

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
  -webkit-appearance: none;
  appearance: none;
}

/* ===== Responsive ===== */
@media (max-width: 870px) {
  .mobile-header {
    display: flex;
  }

  .gear-icon {
    width: 20px;
    height: auto;
  }
}
</style>
