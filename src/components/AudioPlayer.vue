<template>
  <div class="player">
    <audio
      ref="audioRef"
      :src="resolvedAudioSrc"
      controls
      controlsList="nodownload"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @timeupdate="handleTimeUpdate"
      @ended="$emit('audio-ended')"
    ></audio>
  </div>
</template>

<script setup>
import Hls from "hls.js";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const audioRef = ref(null);
const hasStartedSection = ref(false);
const resolvedAudioSrc = ref("");
const attachedHlsSrc = ref("");
let hls = null;

const props = defineProps({
  audioSrc: {
    type: String,
    default: "",
  },
  hlsSrc: {
    type: String,
    default: "",
  },
  startAt: {
    type: [Number, String],
    default: null,
  },
  endAt: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits(["audio-ended", "audio-timeupdate"]);

const sectionStart = computed(() => parseTimestamp(props.startAt));
const sectionEnd = computed(() => parseTimestamp(props.endAt));

function canPlayNativeHls() {
  return Boolean(
    audioRef.value?.canPlayType("application/vnd.apple.mpegurl"),
  );
}

function destroyHls() {
  if (hls) {
    hls.destroy();
    hls = null;
  }

  attachedHlsSrc.value = "";
}

function updateResolvedAudioSource() {
  if (!audioRef.value) {
    return;
  }

  if (props.hlsSrc && canPlayNativeHls()) {
    destroyHls();
    resolvedAudioSrc.value = props.hlsSrc;
    return;
  }

  if (props.hlsSrc && Hls.isSupported()) {
    resolvedAudioSrc.value = "";

    if (attachedHlsSrc.value === props.hlsSrc) {
      return;
    }

    destroyHls();
    hls = new Hls();
    hls.loadSource(props.hlsSrc);
    hls.attachMedia(audioRef.value);
    attachedHlsSrc.value = props.hlsSrc;
    return;
  }

  destroyHls();
  resolvedAudioSrc.value = props.audioSrc;
}

function parseTimestamp(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parts = String(value)
    .trim()
    .split(":")
    .map((part) => Number(part));

  if (parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  return parts.reduce((total, part) => total * 60 + part, 0);
}

function seekToSectionStart() {
  if (!audioRef.value || sectionStart.value === null) {
    return;
  }

  audioRef.value.currentTime = sectionStart.value;
}

function isBeforeSectionStart() {
  return (
    sectionStart.value !== null &&
    audioRef.value &&
    audioRef.value.currentTime < sectionStart.value
  );
}

function handleLoadedMetadata() {
  hasStartedSection.value = false;
  seekToSectionStart();
}

function handlePlay() {
  if (isBeforeSectionStart()) {
    seekToSectionStart();
  }
}

function handleTimeUpdate() {
  if (!audioRef.value) {
    return;
  }

  emit("audio-timeupdate", audioRef.value.currentTime);

  if (sectionEnd.value === null) {
    return;
  }

  if (isBeforeSectionStart()) {
    seekToSectionStart();
    return;
  }

  hasStartedSection.value = true;

  if (hasStartedSection.value && audioRef.value.currentTime >= sectionEnd.value) {
    audioRef.value.pause();
    seekToSectionStart();
    emit("audio-ended");
  }
}

watch(
  () => [props.audioSrc, props.hlsSrc, props.startAt, props.endAt],
  () => {
    hasStartedSection.value = false;
    nextTick(() => {
      updateResolvedAudioSource();
      seekToSectionStart();
    });
  },
  { immediate: true },
);

onMounted(updateResolvedAudioSource);

onBeforeUnmount(destroyHls);

defineExpose({
  audioRef,
  seekToSectionStart,
});
</script>

<style scoped>
/* ===== Audio Player ===== */
.player {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 2px solid #c1956061;
  position: sticky;
  bottom: 0;
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
