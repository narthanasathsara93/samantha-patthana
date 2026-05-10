<template>
  <div class="player">
    <div class="audio-shell">
      <!-- PLAY -->
      <button class="play-btn" @click="togglePlay">
        <span v-if="!isPlaying">
          <img class="volume-ctrl-icon" :src="getIcon('play.png')" />
        </span>
        <span v-else>
          <img class="volume-ctrl-icon" :src="getIcon('pause.png')" /></span>
      </button>

      <!-- Custom Audio Controls -->
      <div class="custom-controls">
        <!-- Current Time (verse-relative) -->
        <span class="time-display">{{ formattedVerseCurrentTime }}</span>

        <!-- Seek Bar -->
        <div class="seek-bar-container" @click="seekToPosition">
          <div class="seek-bar-bg"></div>
          <div class="seek-bar-progress" :style="{ width: verseProgressPercent + '%' }"></div>
          <div class="seek-bar-handle" :style="{ left: verseProgressPercent + '%' }"></div>
        </div>

        <!-- Duration (verse-relative) -->
        <span class="time-display">{{ formattedVerseDuration }}</span>

        <!-- Volume Control -->
        <!-- Volume Control -->
        <div class="volume-container">
          <!-- DESKTOP -->
          <div class="desktop-volume">
            <button class="volume-btn" @click="toggleMute">
              <span v-if="isMuted || volume === 0">
                <img class="volume-icon" :src="getIcon('mute.png')" />
              </span>
              <span v-else-if="volume < 0.4">
                <img class="volume-icon" :src="getIcon('volume_low.png')" />
              </span>
              <span v-else-if="volume > 0.4 && volume < 0.7">
                <img class="volume-icon" :src="getIcon('volume_medium.png')" />
              </span>
              <span v-else>
                <img class="volume-icon" :src="getIcon('volume_max.png')" />
              </span>
            </button>

            <input type="range" class="volume-slider" min="0" max="1" step="0.01" v-model="volume"
              @input="updateVolume" />
          </div>

          <!-- MOBILE -->
          <div class="mobile-volume-buttons">
            <button class="volume-action-btn" @click="decreaseVolume">
              −
            </button>

            <button class="volume-action-btn" @click="increaseVolume">
              +
            </button>

            <button class="mobile-volume-btn" @click="toggleMute">
              <span v-if="isMuted || volume === 0">
                <img class="volume-icon" :src="getIcon('mute.png')" />
              </span>
              <span v-else-if="volume < 0.4">
                <img class="volume-icon" :src="getIcon('volume_low.png')" />
              </span>
              <span v-else-if="volume > 0.4 && volume < 0.7">
                <img class="volume-icon" :src="getIcon('volume_medium.png')" />
              </span>
              <span v-else>
                <img class="volume-icon" :src="getIcon('volume_max.png')" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Hidden native audio for actual playback -->
      <audio ref="audioRef" :src="resolvedAudioSrc" @loadedmetadata="handleLoadedMetadata" @play="handlePlay"
        @pause="isPlaying = false" @timeupdate="handleTimeUpdate" @ended="$emit('audio-ended')"></audio>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { getAssetUrl } from "../utils/assets";

const audioRef = ref(null);

const hasStartedSection = ref(false);
const resolvedAudioSrc = ref("");
const attachedHlsSrc = ref("");

const isPlaying = ref(false);
const currentTime = ref(0);
const isMuted = ref(false);
const previousVolume = ref(0.5);

// Volume with localStorage persistence
const STORAGE_KEY = "samantha-patthana-volume";
const DEFAULT_VOLUME = 0.5;

const volume = ref(DEFAULT_VOLUME);

function loadVolume() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    const parsed = parseFloat(stored);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      volume.value = parsed;
    }
  }
}

function saveVolume() {
  localStorage.setItem(STORAGE_KEY, volume.value.toString());
}

onMounted(() => {
  loadVolume();
  updateVolume();
});

// Computed verse-relative timing
const verseDuration = computed(() => {
  if (sectionStart.value !== null && sectionEnd.value !== null) {
    return sectionEnd.value - sectionStart.value;
  }
  return audioRef.value?.duration || 0;
});

const verseCurrentTime = computed(() => {
  if (sectionStart.value !== null && currentTime.value >= sectionStart.value) {
    return Math.min(currentTime.value - sectionStart.value, verseDuration.value);
  }
  return Math.min(currentTime.value, verseDuration.value);
});

const verseProgressPercent = computed(() => {
  if (verseDuration.value === 0) return 0;
  return (verseCurrentTime.value / verseDuration.value) * 100;
});

const formattedVerseCurrentTime = computed(() => {
  return formatTime(verseCurrentTime.value);
});

const formattedVerseDuration = computed(() => {
  return formatTime(verseDuration.value);
});

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function seekToPosition(event) {
  if (!audioRef.value || verseDuration.value === 0) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const targetVerseTime = percent * verseDuration.value;
  // Convert verse-relative time back to absolute audio time
  const absoluteTime = sectionStart.value !== null
    ? sectionStart.value + targetVerseTime
    : targetVerseTime;
  audioRef.value.currentTime = absoluteTime;
}

function updateVolume() {
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
    isMuted.value = volume.value === 0;
  }
  saveVolume();
}

function toggleMute() {
  if (!audioRef.value) return;
  if (isMuted.value) {
    volume.value = previousVolume.value || DEFAULT_VOLUME;
    isMuted.value = false;
  } else {
    previousVolume.value = volume.value;
    volume.value = 0;
    isMuted.value = true;
  }
  audioRef.value.volume = volume.value;
  saveVolume();
}

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

async function updateResolvedAudioSource() {
  if (!audioRef.value) {
    return;
  }

  // Native HLS support (Safari/iOS)
  if (props.hlsSrc && canPlayNativeHls()) {
    destroyHls();
    resolvedAudioSrc.value = props.hlsSrc;
    return;
  }

  // Lazy-load hls.js ONLY when needed
  if (props.hlsSrc) {
    const { default: Hls } = await import("hls.js");

    if (Hls.isSupported()) {
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

  // Track current time for custom controls
  currentTime.value = audioRef.value.currentTime;
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
  // Always seek to section start when playing a specific section
  seekToSectionStart();
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


function increaseVolume() {
  volume.value = Math.min(1, volume.value + 0.1);
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
  isMuted.value = false;
  saveVolume();
}

function decreaseVolume() {
  volume.value = Math.max(0, volume.value - 0.1);
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }
  isMuted.value = volume.value === 0;
  saveVolume();
}

const getIcon = (iconName) => {
  return getAssetUrl(`icons/${iconName}`);
};

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

/* PLAYER SHELL */
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

  border: none;
  background: transparent;
  cursor: pointer;
  transition: 0.2s ease;
}

.play-btn:hover {
  transform: scale(1.03);
}

.volume-icon {
  width: 22px;
  height: auto;
  transition: 0.2s ease;
}

/* CONTROLS */
.custom-controls {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

/* TIME */
.time-display {
  flex-shrink: 0;
  min-width: 42px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #5a1a11;
  font-family:
    "Noto Sans Sinhala",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

/* SEEK BAR */
.seek-bar-container {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.seek-bar-bg {
  position: absolute;
  width: 100%;
  height: 6px;
  background: #c9b896;
  border-radius: 999px;
}

.seek-bar-progress {
  position: absolute;
  height: 6px;
  background: #7a1808;
  border-radius: 999px;
  transition: width 0.1s linear;
}

.seek-bar-handle {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #7a1808;
  transform: translate(-50%, -50%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.28);
  transition: left 0.1s linear;
}

/* =========================
   VOLUME
========================= */

.volume-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* DESKTOP */
.desktop-volume {
  display: flex;
  align-items: center;
  /* gap: 8px; */
}

.volume-btn {
  border: none;
  background: none;
  padding: 4px;
  /* font-size: 18px; */
  cursor: pointer;
  opacity: 0.85;
  transition: opacity 0.2s ease;
}

.volume-btn:hover {
  opacity: 1;
}

.volume-slider {
  width: 60px;
  height: 4px;
  border-radius: 999px;
  background: #c9b896;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.volume-slider::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #7a1808;
  cursor: pointer;
  -webkit-appearance: none;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background: #7a1808;
  cursor: pointer;
}

/* MOBILE CONTROLS HIDDEN ON DESKTOP */
.mobile-volume-buttons {
  display: none;
}

.volume-ctrl-icon {
  width: 52px;
  height: auto;
}

/* =========================
   MOBILE
========================= */

@media (max-width: 768px) {
  .player {
    padding-top: 8px;
    border-top: none;
  }

  .audio-shell {
    gap: 10px;
    padding: 10px 12px;
    border-radius: 22px;
  }

  /* PLAY BUTTON */
  .volume-ctrl-icon {
    width: 46px;
    height: 46px;
  }

  /* CONTROLS */
  .custom-controls {
    gap: 6px;
  }

  /* TIME */
  .time-display {
    min-width: 34px;
    font-size: 12px;
  }

  /* SEEK */
  .seek-bar-container {
    height: 14px;
  }

  .seek-bar-bg,
  .seek-bar-progress {
    height: 4px;
  }

  .seek-bar-handle {
    width: 11px;
    height: 11px;
  }

  /* HIDE DESKTOP VOLUME */
  .desktop-volume {
    display: none;
  }

  /* MOBILE VOLUME */
  .mobile-volume-buttons {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border-radius: 999px;
    background: rgb(219 207 183);
  }

  .mobile-volume-btn {
    padding: 13px;
  }

  .volume-action-btn,
  .mobile-volume-btn {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #6d1b0d;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #bfb4a28f;
  }

  .mobile-volume-btn {
    font-size: 15px;
  }

  .volume-action-btn:active,
  .mobile-volume-btn:active {
    background: rgba(122, 24, 8, 0.1);
  }

  .volume-icon {
    width: 22px;
    height: auto;
    margin-top: 11%;
  }
}
</style>