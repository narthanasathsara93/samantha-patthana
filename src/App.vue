<!-- src/App.vue -->
<template>
  <div class="app-container">
    <div class="app">
      <!-- Sidebar -->
      <Sidebar
        :is-sidebar-open="isSidebarOpen"
        :selected-id="isShowingResourcesPanel ? null : currentVerseId"
        :verse-index-map="verseIndexMap"
        :is-bookmarked="isBookmarked"
        @verse-selected="handleVerseSelected"
        @show-resources="handleShowResources"
        @close-sidebar="closeSidebar"
      />

      <!-- Content -->
      <main
        class="content"
        :class="{
          'mobile-lower-controls-hidden': !areMobileLowerControlsVisible,
        }"
      >
        <!-- Mobile Header -->
        <MobileHeader
          :is-bookmarked="isBookmarked(selectedVerse.id)"
          :title="contentTitle"
          @toggle-sidebar="toggleSidebar"
          @toggle-bookmark="handleToggleBookmark"
        />

        <div
          v-if="!isShowingResourcesPanel"
          class="content-controls"
          :class="{ 'hidden-on-mobile-menu': isSidebarOpen }"
        >
          <div class="content-title">
            <div>{{ contentTitle }}</div>
          </div>

          <div class="controls-row">
            <AutoplayButton
              v-if="!isSinhalaTextView && route.name !== 'punyanumodana'"
              :is-auto-playing="isAutoPlaying"
              @toggle-autoplay="toggleAutoplay"
            />
            <button
              class="sinhala-toggle-btn"
              type="button"
              :class="{ active: isSinhalaTextView }"
              :title="isSinhalaTextView ? 'පාලිය' : 'සිංහල'"
              @click="toggleSinhalaTextView"
            >
              <img
                class="sinhala-toggle-icon"
                :src="getSinhalaToggleIcon()"
                alt=""
              />
            </button>
            <BookmarkButton
              :is-bookmarked="isBookmarked(selectedVerse.id)"
              @toggle-bookmark="handleToggleBookmark"
            />

            <span ref="fontSettingsRef" class="font-settings">
              <button
                class="font-settings-btn"
                type="button"
                title="අක්ෂර විශාලනය"
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
            </span>
          </div>
        </div>
        <div v-if="isShowingResourcesPanel" class="verse-content">
          <ResourcesPanel @close="handleCloseResourcesPanel" />
        </div>

        <div
          v-if="!isShowingResourcesPanel"
          :class="{
            'content-wrapper': true,
            blurred: isSidebarOpen,
            'mobile-lower-controls-hidden': !areMobileLowerControlsVisible,
          }"
        >
          <div class="verse-content">
            <VerseContent
              ref="verseContentRef"
              :title="selectedVerseTitle"
              :content="selectedVerseContent"
              :audio-sections="selectedVerseAudioSections"
              :show-verse-title="selectedVerse.showVerseTitle"
              :font-size="readerFontSize"
              :sinhala-view-on="isSinhalaTextView"
              :active-audio-section-index="activeAudioSectionIndex"
              @play-section="handlePlayAudioSection"
              @scroll-state-change="handleReaderScrollState"
            />
          </div>

          <AudioPlayer
            v-if="
              !isShowingResourcesPanel &&
              !isSinhalaTextView &&
              route.name !== 'punyanumodana'
            "
            ref="audioPlayerRef"
            :audio-src="selectedVerseAudio"
            :hls-src="selectedVerseHlsAudio"
            :start-at="activeAudioStartAt"
            :end-at="activeAudioEndAt"
            @audio-ended="handleAudioEnded"
            @audio-timeupdate="handleAudioTimeUpdate"
          />
        </div>

        <div
          v-if="!isShowingResourcesPanel && readerScrollState.isScrollable"
          class="reader-scroll-controls"
          aria-label="Reader scroll controls"
        >
          <button
            class="reader-scroll-btn"
            type="button"
            aria-label="Scroll up"
            :disabled="!readerScrollState.canScrollUp"
            @click="scrollVerseContent(-1)"
          >
            &uarr;
          </button>
          <button
            class="reader-scroll-btn"
            type="button"
            aria-label="Scroll down"
            :disabled="!readerScrollState.canScrollDown"
            @click="scrollVerseContent(1)"
          >
            &darr;
          </button>
        </div>

        <button
          v-if="!isShowingResourcesPanel"
          class="lower-controls-toggle"
          type="button"
          :class="
            areMobileLowerControlsVisible ? 'active toggle-down' : 'toggle-up'
          "
          :aria-label="
            areMobileLowerControlsVisible
              ? 'Hide audio and pagination controls'
              : 'Show audio and pagination controls'
          "
          :aria-pressed="areMobileLowerControlsVisible"
          :title="
            areMobileLowerControlsVisible
              ? 'Hide audio and pagination controls'
              : 'Show audio and pagination controls'
          "
          @click="toggleMobileLowerControls"
        >
          <img class="arrow-up-down-icon" :src="getArrowIcon()" />
        </button>

        <!-- Overlay -->
        <Overlay :show="isSidebarOpen" @click="toggleSidebar" />

        <!-- Pagination -->
        <Pagination
          v-if="!isShowingResourcesPanel"
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
import { useRoute, useRouter } from "vue-router";

// Components
import Sidebar from "./components/Sidebar.vue";
import MobileHeader from "./components/MobileHeader.vue";
import AutoplayButton from "./components/AutoplayButton.vue";
import BookmarkButton from "./components/BookmarkButton.vue";
import Overlay from "./components/Overlay.vue";
import VerseContent from "./components/VerseContent.vue";
import AudioPlayer from "./components/AudioPlayer.vue";
import Pagination from "./components/Pagination.vue";
import ResourcesPanel from "./components/ResourcesPanel.vue";

// Composables
import { useAudio } from "./composables/useAudio";
import { useNavigation } from "./composables/useNavigation";
import { useAutoplay } from "./composables/useAutoplay";
import { useSidebar } from "./composables/useSidebar";
import { useBookmarks } from "./composables/useBookmarks";
import { getAssetUrl } from "./utils/assets";
import { audioSections } from "./data/audioSections";
import { sinhalaTexts } from "./data/sinhalaText";

// Component refs
const audioPlayerRef = ref(null);
const verseContentRef = ref(null);
const fontSettingsRef = ref(null);
const isFontSettingsOpen = ref(false);
const isSinhalaTextView = ref(loadSinhalaTextView());
const readerScrollState = ref({
  isScrollable: false,
  canScrollUp: false,
  canScrollDown: false,
});
const defaultReaderFontSize = 15;
const minReaderFontSize = 15;
const maxReaderFontSize = 30;
const readerFontSize = ref(loadReaderFontSize());
const isShowingResourcesPanel = ref(false);
const areMobileLowerControlsVisible = ref(true);
const activeAudioSectionIndex = ref(-1);
let autoplayControlsHideTimer = null;

// Computed audio ref
const audioRef = computed(() => audioPlayerRef.value?.audioRef);
const hasSinhalaText = computed(() => {
  const sinhalaTextKey = selectedVerse.value?.sinhalaTextKey;
  return sinhalaTextKey && sinhalaTexts[sinhalaTextKey] ? true : false;
});
const selectedVerseTitle = computed(() => {
  if (isSinhalaTextView.value && selectedVerse.value?.sinhalaTitle) {
    return selectedVerse.value.sinhalaTitle;
  }

  return selectedVerse.value.title;
});
const selectedVerseContent = computed(() => {
  if (isSinhalaTextView.value && hasSinhalaText.value) {
    const sinhalaTextKey = selectedVerse.value?.sinhalaTextKey;
    return sinhalaTexts[sinhalaTextKey] || selectedVerse.value.content;
  }

  return selectedVerse.value.content;
});
const contentTitle = computed(() => {
  return isShowingResourcesPanel.value
    ? "මූලාශ්‍ර සහ සම්පත්"
    : selectedVerseTitle.value;
});
const fullAudioSrc = "";
const fullAudioHlsSrc = "/audios/v1/playlist.m3u8";
const selectedVerseAudio = computed(() => {
  const hasAudioSection =
    selectedVerse.value?.audioStartAt !== undefined &&
    selectedVerse.value?.audioEndAt !== undefined;

  return hasAudioSection ? fullAudioSrc : selectedVerse.value?.audio;
});
const selectedVerseHlsAudio = computed(() => {
  const hasAudioSection =
    selectedVerse.value?.audioStartAt !== undefined &&
    selectedVerse.value?.audioEndAt !== undefined;

  return hasAudioSection ? fullAudioHlsSrc : "";
});
const activeAudioStartAt = ref(null);
const activeAudioEndAt = ref(null);
const selectedVerseAudioSections = computed(() => {
  if (isSinhalaTextView.value) {
    return [];
  }

  const sectionsKey = selectedVerse.value?.audioSectionsKey;

  return sectionsKey ? audioSections[sectionsKey] || [] : [];
});

// Initialize composables
const { resetAudio, playCurrent } = useAudio();
const {
  currentIndex,
  currentVerseId,
  selectedVerse,
  selectVerse,
  verseIndexMap: verseIndexMap,
  flattenedVerses,
} = useNavigation();
const handleShowResources = () => {
  isShowingResourcesPanel.value = true;
};

const handleCloseResourcesPanel = () => {
  isShowingResourcesPanel.value = false;
};
const {
  isAutoPlaying,
  toggleAutoplay: toggleAutoplayLogic,
  onAudioEnded,
} = useAutoplay(playCurrent);
const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarks();
const route = useRoute();
const router = useRouter();
const pullToReload = {
  startX: 0,
  startY: 0,
  startedAtReaderTop: false,
  isTracking: false,
};

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

function loadSinhalaTextView() {
  return localStorage.getItem("reader-sinhala-text-view") === "true";
}

function isMobileView() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function getGestureReader(target) {
  return target?.closest?.(".reader") || null;
}

function isPullReloadStartArea(touch) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return (
    touch.clientX > width * 0.18 &&
    touch.clientX < width * 0.82 &&
    touch.clientY > height * 0.22 &&
    touch.clientY < height * 0.82
  );
}

function handlePullReloadStart(event) {
  if (!isMobileView() || event.touches.length !== 1) {
    pullToReload.isTracking = false;
    return;
  }

  const touch = event.touches[0];
  const reader = getGestureReader(event.target);

  pullToReload.startX = touch.clientX;
  pullToReload.startY = touch.clientY;
  pullToReload.startedAtReaderTop = Boolean(reader && reader.scrollTop <= 2);
  pullToReload.isTracking =
    pullToReload.startedAtReaderTop && isPullReloadStartArea(touch);
}

function handlePullReloadMove(event) {
  if (!pullToReload.isTracking || event.touches.length !== 1) {
    return;
  }

  const touch = event.touches[0];
  const deltaY = touch.clientY - pullToReload.startY;
  const deltaX = Math.abs(touch.clientX - pullToReload.startX);

  if (deltaY < -20 || deltaX > 70) {
    pullToReload.isTracking = false;
  }
}

function handlePullReloadEnd(event) {
  if (!pullToReload.isTracking) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaY = touch.clientY - pullToReload.startY;
  const deltaX = Math.abs(touch.clientX - pullToReload.startX);

  pullToReload.isTracking = false;

  if (deltaY > 110 && deltaY > deltaX * 1.4) {
    window.location.reload();
  }
}

function scrollVerseContentToTop() {
  nextTick(() => {
    verseContentRef.value?.scrollToTop();
  });
}

function handleReaderScrollState(scrollState) {
  readerScrollState.value = scrollState;
}

function scrollVerseContent(direction) {
  verseContentRef.value?.scrollReader(direction);
}

function resetActiveAudioRange() {
  activeAudioStartAt.value = selectedVerse.value?.audioStartAt ?? null;
  activeAudioEndAt.value = selectedVerse.value?.audioEndAt ?? null;
  activeAudioSectionIndex.value = -1;
}

function handlePlayAudioSection(section, index = -1) {
  activeAudioStartAt.value = section.startAt;
  activeAudioEndAt.value = section.endAt;
  activeAudioSectionIndex.value = index;

  nextTick(() => {
    audioPlayerRef.value?.seekToSectionStart();
    playCurrent(audioRef);
  });
}

function toggleSinhalaTextView() {
  if (!hasSinhalaText.value) {
    return;
  }

  isSinhalaTextView.value = !isSinhalaTextView.value;

  if (isSinhalaTextView.value) {
    resetAudio(audioRef);

    if (isAutoPlaying.value) {
      toggleAutoplayLogic(audioRef);
    }
  }

  scrollVerseContentToTop();
}

function handleVerseSelected(index) {
  const shouldScrollContentToTop = isSidebarOpen.value && isMobileView();

  isShowingResourcesPanel.value = false;
  isSinhalaTextView.value = false;
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
  isShowingResourcesPanel.value = false;
  isSinhalaTextView.value = false;

  if (currentIndex.value > 0) {
    const prevVerse = flattenedVerses.value[currentIndex.value - 1];
    if (prevVerse) {
      router.push({
        name: prevVerse.englishName,
      });
    }
  }
}

function handleNext() {
  isShowingResourcesPanel.value = false;
  isSinhalaTextView.value = false;

  if (currentIndex.value < flattenedVerses.value.length - 1) {
    const nextVerse = flattenedVerses.value[currentIndex.value + 1];
    if (nextVerse) {
      router.push({
        name: nextVerse.englishName,
      });
    }
  }
}

function parseAudioTimestamp(value) {
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

function getAudioSectionIndex(currentTime) {
  return selectedVerseAudioSections.value.findIndex((section) => {
    const startAt = parseAudioTimestamp(section.startAt);
    const endAt = parseAudioTimestamp(section.endAt);

    if (startAt === null || endAt === null) {
      return false;
    }

    return currentTime >= startAt && currentTime < endAt;
  });
}

function handleAudioTimeUpdate(currentTime) {
  if (!isAutoPlaying.value || selectedVerseAudioSections.value.length === 0) {
    return;
  }

  const sectionIndex = getAudioSectionIndex(currentTime);

  if (sectionIndex === -1 || sectionIndex === activeAudioSectionIndex.value) {
    return;
  }

  activeAudioSectionIndex.value = sectionIndex;

  nextTick(() => {
    verseContentRef.value?.scrollToAudioSection(sectionIndex);
  });
}

function handleAutoplayNext() {
  if (currentIndex.value < flattenedVerses.value.length - 1) {
    const nextVerse = flattenedVerses.value[currentIndex.value + 1];
    if (nextVerse) {
      router.push({
        name: nextVerse.englishName,
      });
    }
  }
}

function handleAudioEnded() {
  onAudioEnded(
    handleAutoplayNext,
    flattenedVerses.value.length,
    currentIndex,
    audioRef,
  );
}

function handleToggleBookmark() {
  toggleBookmark(selectedVerse.value.id);
}

function toggleFontSettings() {
  isFontSettingsOpen.value = !isFontSettingsOpen.value;
}

function toggleMobileLowerControls() {
  areMobileLowerControlsVisible.value = !areMobileLowerControlsVisible.value;
}

function clearAutoplayControlsHideTimer() {
  if (autoplayControlsHideTimer) {
    clearTimeout(autoplayControlsHideTimer);
    autoplayControlsHideTimer = null;
  }
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

  clearAutoplayControlsHideTimer();

  if (isAutoPlaying.value && isMobileView()) {
    autoplayControlsHideTimer = setTimeout(() => {
      if (isAutoPlaying.value && areMobileLowerControlsVisible.value) {
        toggleMobileLowerControls();
      }
    }, 3500);
  }
}

const getFontSizeIcon = () => {
  return getAssetUrl("icons/font-resize.png");
};

const getSinhalaToggleIcon = () => {
  return isSinhalaTextView.value
    ? getAssetUrl("icons/paali.png")
    : getAssetUrl("icons/sinhala.png");
};

const getArrowIcon = () => {
  return areMobileLowerControlsVisible.value
    ? getAssetUrl("icons/arrow-down.png")
    : getAssetUrl("icons/arrow-up.png");
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("touchstart", handlePullReloadStart, {
    passive: true,
  });
  document.addEventListener("touchmove", handlePullReloadMove, {
    passive: true,
  });
  document.addEventListener("touchend", handlePullReloadEnd, {
    passive: true,
  });
});

onBeforeUnmount(() => {
  clearAutoplayControlsHideTimer();
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("touchstart", handlePullReloadStart);
  document.removeEventListener("touchmove", handlePullReloadMove);
  document.removeEventListener("touchend", handlePullReloadEnd);
});

watch(readerFontSize, (fontSize) => {
  localStorage.setItem("reader-font-size", String(fontSize));
});

watch(isSinhalaTextView, (isSinhalaView) => {
  localStorage.setItem("reader-sinhala-text-view", String(isSinhalaView));
});

watch(selectedVerse, () => {
  resetActiveAudioRange();

  if (isSinhalaTextView.value && !hasSinhalaText.value) {
    isSinhalaTextView.value = false;
  }

  scrollVerseContentToTop();
});

// Watch route changes and select verse accordingly
watch(
  () => route.meta.verseId,
  (verseId) => {
    if (verseId) {
      const verseIndex = flattenedVerses.value.findIndex(
        (v) => v.id === verseId,
      );
      if (verseIndex !== -1) {
        isShowingResourcesPanel.value = false;
        isSinhalaTextView.value = false;
        selectVerse(verseIndex);
        resetAudio(audioRef);
      }
    }
  },
  { immediate: true },
);

resetActiveAudioRange();
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

/* ===== Cards (Sidebar + Content) =====*/
.content {
  background-image: url("./assets/images/verse-content-background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
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
  position: static;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
  padding: 0;
  z-index: 10;
}

.content-title {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
  font-size: 20px;
  font-weight: 900;
  color: #3b0906;
}

.content-title > div {
  max-width: 100%;
  text-align: center;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  width: auto;
  padding-bottom: 10px;
}

.font-settings {
  position: relative;
}

.font-settings-btn {
  margin-top: 13%;
}

.font-settings-btn,
.sinhala-toggle-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: #6c757d;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.font-settings-btn:hover,
.sinhala-toggle-btn:hover:not(:disabled) {
  color: #3b0906;
  transform: scale(1.25);
}

.sinhala-toggle-btn.active {
  transform: scale(1.08);
}

.sinhala-toggle-btn:disabled {
  cursor: default;
  opacity: 0.35;
}

.lower-controls-toggle {
  display: none;
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

.font-resize-icon,
.arrow-up-down-icon {
  width: 20px;
  height: auto;
}

.sinhala-toggle-icon {
  width: 24px;
  height: auto;
}

.content-wrapper {
  border-top: 2px solid #c1956061;
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #ccc #f5f5f5;
}

.content-wrapper::-webkit-scrollbar {
  width: 8px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.content-wrapper.blurred {
  filter: blur(3px);
  pointer-events: none;
}

.verse-content {
  flex: 1;
  min-height: 0;
  max-width: 92%;
  display: flex;
  flex-direction: column;
}

.reader-scroll-controls {
  position: absolute;
  top: 42%;
  right: 13px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transform: translateY(-50%);
}

.reader-scroll-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid rgba(59, 9, 6, 0.14);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #3b0906;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(59, 9, 6, 0.14);
  transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
}

.reader-scroll-btn:hover:not(:disabled) {
  background: #fff;
  transform: scale(1.08);
}

.reader-scroll-btn:disabled {
  cursor: default;
  opacity: 0.35;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .reader-scroll-controls {
    right: 13px;
  }

  .reader-scroll-btn {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .app {
    flex-direction: column;
    gap: 16px;
  }

  .content {
    padding: 20px;
    height: 100%;
    min-height: 0;
    border-radius: 20px;
    border-bottom: 1px solid #c1956061 !important;
  }

  .content-controls {
    position: absolute;
    top: 16px;
    right: 16px;
    flex-direction: column;
    align-items: flex-end;
    width: auto;
    margin: 0;
    justify-content: flex-start;
    border-bottom: none;
  }

  .content-title {
    display: none;
  }

  .controls-row {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    width: fit-content;
    padding-bottom: 0;
    border-bottom: none;
  }

  .toggle-down,
  .toggle-up {
    right: 44%;
    top: 98%;
  }

  .lower-controls-toggle {
    position: absolute;
    z-index: 2;
    display: flex;
    transform: translateY(-50%);
    border: none;
    background-color: transparent;
    cursor: pointer;
    align-items: center;
    transition: background 0.3s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }

  .lower-controls-toggle.active {
    background-color: transparent;
  }

  .mobile-lower-controls-hidden .player,
  .mobile-lower-controls-hidden .pagination {
    display: none;
  }

  .font-settings-panel {
    right: 0;
    top: 34px;
    transform: none;
  }

  .font-settings-btn {
    margin-top: 0;
  }

  .content-controls.hidden-on-mobile-menu {
    display: none;
  }

  .content-wrapper {
    scrollbar-width: none;
    -ms-overflow-style: none;
    border-top: none;
  }

  .content-wrapper::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  .sinhala-toggle-icon {
    width: 22px;
    height: auto;
  }

  .mobile-lower-controls-hidden {
    padding-bottom: 5%;
  }
}
</style>
