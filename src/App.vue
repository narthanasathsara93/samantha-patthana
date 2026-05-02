<!-- src/App.vue -->
<template>
  <div class="app-container">
    <div class="app">
      <!-- Sidebar -->
      <Sidebar
        :is-sidebar-open="isSidebarOpen"
        :selected-id="currentVerseId"
        :verse-index-map="verseIndexMap"
        :is-bookmarked="isBookmarked"
        @verse-selected="handleVerseSelected"
      />

      <!-- Content -->
      <main class="content">
        <!-- Mobile Header -->
        <MobileHeader
          :is-bookmarked="isBookmarked(selectedVerse.id)"
          :title="selectedVerse.title"
          @toggle-sidebar="toggleSidebar"
          @toggle-bookmark="handleToggleBookmark"
        />

        <div
          class="content-controls"
          :class="{ 'hidden-on-mobile-menu': isSidebarOpen }"
        >
          <div class="controls-row">
            <AutoplayButton
              :is-auto-playing="isAutoPlaying"
              @toggle-autoplay="toggleAutoplay"
            />
            <BookmarkButton
              :is-bookmarked="isBookmarked(selectedVerse.id)"
              @toggle-bookmark="handleToggleBookmark"
            />
            <div ref="fontSettingsRef" class="font-settings">
              <button
                class="settings-btn"
                type="button"
                title="Adjust verse font size"
                @click="toggleFontSettings"
              >
                <img class="font-resize-icon" :src="getFontSizeIcon()" />
              </button>
              <div v-if="isFontSettingsOpen" class="font-settings-panel">
                <input
                  v-model.number="readerFontSize"
                  class="font-size-slider"
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  aria-label="Verse content font size"
                />
                <span class="font-size-value">{{ readerFontSize }}px</span>
              </div>
            </div>
          </div>
        </div>

        <div :class="{ 'content-wrapper': true, blurred: isSidebarOpen }">
          <VerseContent
            ref="verseContentRef"
            :title="selectedVerse.title"
            :content="selectedVerse.content"
            :show-verse-title="selectedVerse.showVerseTitle"
            :font-size="readerFontSize"
          />

          <!-- Audio -->
          <AudioPlayer
            ref="audioPlayerRef"
            :audio-src="selectedVerse.audio"
            @audio-ended="handleAudioEnded"
          />
        </div>

        <!-- Overlay -->
        <Overlay :show="isSidebarOpen" @click="toggleSidebar" />

        <!-- Pagination -->
        <Pagination
          :current-index="currentIndex"
          :total-verses="flattenedVerses.length"
          @prev="handlePrev"
          @next="handleNext"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";

// Components
import Sidebar from "./components/Sidebar.vue";
import MobileHeader from "./components/MobileHeader.vue";
import AutoplayButton from "./components/AutoplayButton.vue";
import BookmarkButton from "./components/BookmarkButton.vue";
import Overlay from "./components/Overlay.vue";
import VerseContent from "./components/VerseContent.vue";
import AudioPlayer from "./components/AudioPlayer.vue";
import Pagination from "./components/Pagination.vue";

// Composables
import { useAudio } from "./composables/useAudio";
import { useNavigation } from "./composables/useNavigation";
import { useAutoplay } from "./composables/useAutoplay";
import { useSidebar } from "./composables/useSidebar";
import { useBookmarks } from "./composables/useBookmarks";
import { getAssetUrl } from "./utils/assets";

// Component refs
const audioPlayerRef = ref(null);
const verseContentRef = ref(null);
const fontSettingsRef = ref(null);
const isFontSettingsOpen = ref(false);
const defaultReaderFontSize = 20;
const minReaderFontSize = 15;
const maxReaderFontSize = 30;
const readerFontSize = ref(loadReaderFontSize());

// Computed audio ref
const audioRef = computed(() => audioPlayerRef.value?.audioRef);

// Initialize composables
const { resetAudio, playCurrent } = useAudio();
const {
  currentIndex,
  currentVerseId,
  selectedVerse,
  selectVerse,
  next,
  prev,
  verseIndexMap: verseIndexMap,
  flattenedVerses,
} = useNavigation();
const {
  isAutoPlaying,
  toggleAutoplay: toggleAutoplayLogic,
  onAudioEnded,
} = useAutoplay(playCurrent);
const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarks();

// Load bookmarks on app start
loadBookmarks();

// Event handlers
function loadReaderFontSize() {
  const savedFontSize = Number(localStorage.getItem("reader-font-size"));

  if (
    Number.isFinite(savedFontSize) &&
    savedFontSize >= minReaderFontSize &&
    savedFontSize <= maxReaderFontSize
  ) {
    return savedFontSize;
  }

  return defaultReaderFontSize;
}

function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function scrollVerseContentToTop() {
  nextTick(() => {
    verseContentRef.value?.scrollToTop();
  });
}

function handleVerseSelected(index) {
  const shouldScrollContentToTop = isSidebarOpen.value && isMobileView();

  selectVerse(index);
  resetAudio(audioRef);
  closeSidebar();

  if (shouldScrollContentToTop) {
    scrollVerseContentToTop();
  }

  if (isAutoPlaying.value) {
    setTimeout(() => playCurrent(audioRef), 200);
  }
}

function handlePrev() {
  prev();
  resetAudio(audioRef);

  if (isAutoPlaying.value) {
    setTimeout(() => playCurrent(audioRef), 200);
  }
}

function handleNext() {
  next();
  resetAudio(audioRef);

  if (isAutoPlaying.value) {
    setTimeout(() => playCurrent(audioRef), 200);
  }
}

function handleAudioEnded() {
  onAudioEnded(next, flattenedVerses.value.length, currentIndex, audioRef);
}

function handleToggleBookmark() {
  toggleBookmark(selectedVerse.value.id);
}

function toggleFontSettings() {
  isFontSettingsOpen.value = !isFontSettingsOpen.value;
}

function handleDocumentClick(event) {
  if (!isFontSettingsOpen.value) {
    return;
  }

  if (!fontSettingsRef.value?.contains(event.target)) {
    isFontSettingsOpen.value = false;
  }
}

function toggleAutoplay() {
  toggleAutoplayLogic(audioRef);
}

const getFontSizeIcon = () => {
  return getAssetUrl("icons/font-resize.png");
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});

watch(readerFontSize, (fontSize) => {
  localStorage.setItem("reader-font-size", String(fontSize));
});
</script>

<style>
/* ===== Global ===== */

body {
  margin: 0;
  background: linear-gradient(#4b1e1e, #7a1f1f);
  font-family: "Noto Sans Sinhala", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  color: #222;
  overflow: hidden;
}

html,
body,
#app {
  height: 100%;
}

* {
  box-sizing: border-box;
}

.app-container,
.content,
.content-wrapper {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.app-container::-webkit-scrollbar,
.content::-webkit-scrollbar,
.content-wrapper::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ===== Container ===== */
.app-container {
  max-width: 1200px;
  height: 100dvh;
  margin: 0 auto;
  padding: 7px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===== Layout ===== */
.app {
  margin-top: 20px;
  display: flex;
  gap: 28px;
  height: calc(100dvh - 34px);
  min-height: 0;
  align-items: stretch;
}

/* ===== Cards (Sidebar + Content) ===== */
.content {
  background: #fff9f1;
  border-radius: 12px;
  border: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 28px;
  position: relative;
  height: 100%;
  max-height: none;
  overflow: hidden;
}

/* ===== Content Controls ===== */
.content-controls {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 20px;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
  width: 100%;
}

.font-settings {
  position: relative;
}

.settings-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ffffff;
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.settings-btn:hover {
  background: rgba(245, 135, 135, 0.13);
  color: #3b0906;
  transform: scale(1.2);
}

.font-settings-panel {
  position: absolute;
  top: 50%;
  right: 34px;
  width: 190px;
  min-height: 34px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(59, 9, 6, 0.18);
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateY(-50%);
}

.font-size-slider {
  flex: 1;
  min-width: 0;
  accent-color: #8b1e13;
}

.font-size-value {
  min-width: 36px;
  color: #3b0906;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
}

.font-resize-icon {
  width: 25px;
  height: auto;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
    gap: 16px;
  }

  .content {
    padding: 20px;
    height: 100%;
    min-height: 0;
  }

  .content-controls {
    top: 15px;
    right: 15px;
  }

  .font-settings-panel {
    right: 0;
    top: 34px;
    transform: none;
  }

  .content-controls.hidden-on-mobile-menu {
    display: none;
  }
}

.content-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper.blurred {
  filter: blur(3px);
  pointer-events: none;
}

.annotation {
  color: #f01010;
}
</style>
