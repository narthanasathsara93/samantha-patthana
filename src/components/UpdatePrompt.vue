<template>
  <div v-if="visible" class="update-prompt" role="status" aria-live="polite">
    <p class="update-text">
      {{ statusText }}
    </p>
    <button
      v-if="showRefreshButton"
      class="update-button"
      type="button"
      :disabled="isRefreshing"
      @click="$emit('refresh')"
    >
      Refresh now
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  isUpdateAvailable: {
    type: Boolean,
    default: false,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
  isHardResetInProgress: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["refresh"]);

const visible = computed(
  () =>
    props.isUpdateAvailable || props.isRefreshing || props.isHardResetInProgress,
);

const showRefreshButton = computed(
  () => props.isUpdateAvailable && !props.isRefreshing && !props.isHardResetInProgress,
);

const statusText = computed(() => {
  if (props.isHardResetInProgress) {
    return "Refreshing application...";
  }

  if (props.isRefreshing) {
    return "Refreshing application...";
  }

  return "New version available";
});
</script>

<style scoped>
.update-prompt {
  position: fixed;
  z-index: 1200;
  left: 12px;
  right: 12px;
  bottom: max(12px, env(safe-area-inset-bottom));
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(59, 9, 6, 0.16);
  background: rgba(32, 15, 12, 0.93);
  color: #fdf1da;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.update-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.update-button {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  background: #fdf1da;
  color: #3b0906;
}

.update-button:disabled {
  opacity: 0.6;
}
</style>
