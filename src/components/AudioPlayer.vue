<template>
  <div class="player">
    <audio
      ref="audioRef"
      :src="audioSrc"
      controls
      @ended="$emit('audio-ended')"
    ></audio>
  </div>
</template>

<script setup>
import { ref } from "vue";

const audioRef = ref(null);

defineProps({
  audioSrc: {
    type: String,
    default: "",
  },
});

defineEmits(["audio-ended"]);

defineExpose({
  audioRef,
});
</script>

<style scoped>
/* ===== Audio Player ===== */
.player {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e1dcd3;
  position: sticky;
  bottom: 0;
  background: #fff9f1;
  z-index: 5;
}

.player audio {
  width: 100%;
}

@media (max-width: 768px) {
  .player {
    margin-top: 8px;
  }
}
</style>
