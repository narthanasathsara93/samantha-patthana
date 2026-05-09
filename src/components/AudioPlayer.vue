<template>
  <div class="player">
    <div class="audio-shell">
      <!-- PLAY -->
      <button class="play-btn" @click="togglePlay">
        <span v-if="!isPlaying">▶</span>
        <span v-else>❚❚</span>
      </button>

      <!-- AUDIO -->
      <audio
        ref="audioRef"
        :src="resolvedAudioSrc"
        controls
        controlsList="nodownload"
        @loadedmetadata="handleLoadedMetadata"
        @play="handlePlay"
        @pause="isPlaying = false"
        @timeupdate="handleTimeUpdate"
        @ended="$emit('audio-ended')"
      ></audio>
    </div>
  </div>
</template>

<script setup>
import Hls from "hls.js";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

const audioRef = ref(null);

const hasStartedSection = ref(false);
const resolvedAudioSrc = ref("");
const attachedHlsSrc = ref("");

const isPlaying = ref(false);

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
  return Boolean(audioRef.value?.canPlayType("application/vnd.apple.mpegurl"));
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
  isPlaying.value = true;

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

  if (
    hasStartedSection.value &&
    audioRef.value.currentTime >= sectionEnd.value
  ) {
    audioRef.value.pause();

    seekToSectionStart();

    emit("audio-ended");
  }
}

function togglePlay() {
  if (!audioRef.value) {
    return;
  }

  if (audioRef.value.paused) {
    audioRef.value.play();
  } else {
    audioRef.value.pause();
  }
}

function playSection() {
  if (!audioRef.value) {
    return;
  }

  // Set isPlaying immediately for UI feedback
  isPlaying.value = true;

  // Seek to section start if needed
  if (isBeforeSectionStart()) {
    seekToSectionStart();
  }

  // Play the audio
  audioRef.value.play().catch(() => {
    // If play fails (e.g., browser restrictions), reset isPlaying
    isPlaying.value = false;
  });
}

watch(
  () => [props.audioSrc, props.hlsSrc, props.startAt, props.endAt],
  () => {
    hasStartedSection.value = false;
    isPlaying.value = false;

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
  playSection,
});
</script>

<style scoped>
.player {
  position: sticky;
  bottom: 0;
  z-index: 5;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #c1956061;
  backdrop-filter: blur(8px);
}

.audio-shell {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 62px;
  background: #eadcc3;
  border: 1px solid #d7be97;
  box-shadow:
    0 2px 10px rgba(84, 42, 18, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

/* PLAY BUTTON */
.play-btn {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(to bottom, #7a1808, #5b1005);
  color: #f7ebda;
  font-size: 18px;
  cursor: pointer;
  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: 0.2s ease;
}

.play-btn:hover {
  transform: scale(1.03);
}

/* AUDIO */
.audio-shell audio {
  width: 100%;
  height: 42px;
  border-radius: 18px;
  filter: sepia(20%) saturate(80%) brightness(98%);
}

/* CHROME / EDGE */
.audio-shell audio::-webkit-media-controls-panel {
  background: #eadcc3;
}

.audio-shell audio::-webkit-media-controls-play-button {
  display: none;
}

.audio-shell audio::-webkit-media-controls-mute-button {
  filter: sepia(100%) saturate(500%) hue-rotate(-10deg);
}

.audio-shell audio::-webkit-media-controls-timeline {
  filter: sepia(100%) saturate(180%);
}

.audio-shell audio::-webkit-media-controls-current-time-display,
.audio-shell audio::-webkit-media-controls-time-remaining-display {
  color: #5a1a11;
}

/* MOBILE */
@media (max-width: 768px) {
  .player {
    border-top: none;
    padding-top: 8px;
  }

  .audio-shell {
    padding: 10px 12px;
    gap: 12px;
    border-radius: 22px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    font-size: 16px;
  }

  .audio-shell audio {
    height: 40px;
  }
}
</style>
