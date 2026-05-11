<template>
  <div v-if="show" class="overlay" @click="$emit('click')"></div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>

<style scoped>
/* ===== Overlay ===== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 5;
  pointer-events: auto;
}
</style>
