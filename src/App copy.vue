<!-- src/App.vue -->
<template>
  <div class="rotate-device" role="status" aria-live="polite">
    කරුණාකර සිරස් හරවා (Portrait) භාවිතා කරන්න.
    <span class="rotate-icon-cont" aria-hidden="true">
      <img class="rotate-device-icon" :src="rotateDeviceIcon" alt="" />
    </span>
  </div>

  <div class="app-orientation-content">
    <Transition name="page-open" mode="out-in">
      <Home v-if="isHomeRoute" key="home" />
      <PracticeHome v-else-if="isPracticeRoute" key="practice" />
      <Settings v-else-if="isSettingsRoute" key="settings" />
      <ContactUs v-else-if="isContactRoute" key="contact" />
      <div v-else-if="isResourcesRoute" key="resources" class="app-container">
        <div class="app">
          <!-- Sidebar -->
          <Sidebar
            :is-sidebar-open="isSidebarOpen"
            :selected-id="null"
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
              :is-bookmarked="false"
              :title="contentTitle"
              @toggle-sidebar="toggleSidebar"
              @toggle-bookmark="handleToggleBookmark"
            />

            <div class="verse-content">
              <ResourcesPanel @close="handleCloseResourcesPanel" />
            </div>

            <!-- Overlay -->
            <Overlay :show="isSidebarOpen" @click="toggleSidebar" />
          </main>
        </div>
      </div>
      <div v-else key="reader" class="app-container">
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
              :title="mobileHeaderTitle"
              @toggle-sidebar="toggleSidebar"
              @toggle-bookmark="handleToggleBookmark"
            />

            <div
              v-if="!isShowingResourcesPanel"
              class="content-controls"
              :class="{ 'hidden-on-mobile-menu': isSidebarOpen }"
            >
              <div class="content-title">
                {{ displayTitle }}

                <span
                  v-if="selectedVerse.showVerseTitle"
                  class="title-deco desktop-only"
                >
                </span>
              </div>

              <div class="controls-row">
                <span class="guard">【</span>
                <AutoplayButton
                  v-if="!isSinhalaTextView"
                  :is-auto-playing="isAutoPlaying"
                  @toggle-autoplay="toggleAutoplay"
                />
                <button
                  v-if="!isRoutePunyanumodana"
                  class="sinhala-toggle-btn"
                  type="button"
                  :class="{ active: isSinhalaTextView }"
                  :title="isSinhalaTextView ? 'පාලිය' : 'සිංහල'"
                  :aria-label="
                    isSinhalaTextView ? 'Switch to Pali' : 'Switch to Sinhala'
                  "
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
                    aria-label="Font size settings"
                    @click="toggleFontSettings"
                  >
                    <img
                      class="font-resize-icon"
                      :src="getFontSizeIcon()"
                      alt=""
                    />
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
                <span class="guard">】</span>
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
                  :font-size="readerFontSize"
                  :sinhala-view-on="isSinhalaTextView"
                  :active-audio-section-index="activeAudioSectionIndex"
                  @play-section="handlePlayAudioSection"
                  @scroll-state-change="handleReaderScrollState"
                />
              </div>

              <AudioPlayer
                v-if="!isShowingResourcesPanel && !isSinhalaTextView"
                ref="audioPlayerRef"
                :class="{ 'punyanumodana-audio-player': isRoutePunyanumodana }"
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

            <button
              v-if="!isShowingResourcesPanel && !isSinhalaTextView"
              class="lower-controls-toggle"
              type="button"
              :class="
                areMobileLowerControlsVisible
                  ? 'active toggle-down'
                  : 'toggle-up'
              "
              :aria-label="
                areMobileLowerControlsVisible
                  ? 'Hide audio controls'
                  : 'Show audio controls'
              "
              :aria-pressed="areMobileLowerControlsVisible"
              :title="
                areMobileLowerControlsVisible
                  ? 'Hide audio controls'
                  : 'Show audio controls'
              "
              @click="toggleMobileLowerControls"
            >
              <img
                class="arrow-up-down-icon"
                :src="getArrowIcon()"
                alt="Open Audio Player"
              />
            </button>
          </main>
        </div>
      </div>
    </Transition>
    <UpdatePrompt
      :is-update-available="isUpdateAvailable"
      :is-refreshing="isRefreshing"
      :is-hard-reset-in-progress="isHardResetInProgress"
      @refresh="applySoftUpdate"
    />

    <button
      v-if="isHomeRoute"
      title="පාඨ සටහන"
      class="disclaimer-trigger"
      type="button"
      @click="openDisclaimer"
      :aria-expanded="isDisclaimerOpen"
      aria-label="Show disclaimer"
    >
      <img class="home-info-icon" :src="getInfoIcon()" alt="Info" />
    </button>

    <DisclaimerPopup
      v-if="isHomeRoute"
      :model-value="isDisclaimerOpen"
      :youtube-url="youtubeUrlSS_"
      @close="closeDisclaimer"
      @contact="goContactUs"
    />

    <Guidance
      v-model="isGuidanceOpen"
      :show-continue-label="showContinueLabel"
      :section="activeGuidanceSection"
      @close="markGuidanceAsComplete"
      @close-only="closeGuidanceModal"
    />
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
  defineAsyncComponent,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { deco, miniDeco, youtubeUrlSS } from "./utils/util";

// Components
import Sidebar from "./components/Sidebar.vue";
import MobileHeader from "./components/MobileHeader.vue";
import AutoplayButton from "./components/AutoplayButton.vue";
import BookmarkButton from "./components/BookmarkButton.vue";
import Overlay from "./components/Overlay.vue";
import VerseContent from "./components/VerseContent.vue";
import Pagination from "./components/Pagination.vue";
import UpdatePrompt from "./components/UpdatePrompt.vue";
import Guidance from "./components/Guidance.vue";
import DisclaimerPopup from "./components/DisclaimerPopup.vue";
const AudioPlayer = defineAsyncComponent(
  () => import("./components/AudioPlayer.vue"),
);
const ResourcesPanel = defineAsyncComponent(
  () => import("./components/ResourcesPanel.vue"),
);
const Home = defineAsyncComponent(() => import("./components/Home.vue"));
const PracticeHome = defineAsyncComponent(
  () => import("./components/practice/PracticeHome.vue"),
);
const Settings = defineAsyncComponent(
  () => import("./components/Settings.vue"),
);
const ContactUs = defineAsyncComponent(
  () => import("./components/ContactUs.vue"),
);

// Composables
import { useAudio } from "./composables/useAudio";
import { useNavigation } from "./composables/useNavigation";
import { useAutoplay } from "./composables/useAutoplay";
import { useSidebar } from "./composables/useSidebar";
import { useBookmarks } from "./composables/useBookmarks";
import { useBfcache } from "./composables/useBfcache";
import { useAppVersion } from "./composables/useAppVersion";
import { useGuidance } from "./composables/useGuidance";
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
const isDisclaimerOpen = ref(false);
const areMobileLowerControlsVisible = ref(true);
const activeAudioSectionIndex = ref(-1);
const pendingManualAudioSectionIndex = ref(-1);
const isPlayerManuallyToggled = ref(false);
const isLandscapeOrientationBlocked = ref(false);
let autoplayControlsHideTimer = null;
let playerAutoHideTimer = null;
let landscapeOrientationQuery = null;

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
const mobileHeaderTitle = computed(() => {
  if (isShowingResourcesPanel.value) {
    return contentTitle.value;
  }

  const verseNumber = Number(selectedVerse.value?.id?.replace("verse-", ""));
  if (verseNumber >= 3 && verseNumber <= 26) {
    let sinhalaTitle = String(verseNumber - 2).padStart(2, "0");
    if (isSinhalaTextView.value && contentTitle.value) {
      return `${sinhalaTitle}. ${contentTitle.value}`;
    }

    return sinhalaTitle;
  }
  if (verseNumber === 27) {
    return deco;
  }

  return selectedVerseTitle.value;
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

const rotateDeviceIcon = getAssetUrl("icons/rotate.gif");

const getUtubeIcon = () => {
  return getAssetUrl(`icons/youtube.png`);
};

const getFontSizeIcon = () => {
  return getAssetUrl("icons/font_resize.png");
};

const getSinhalaToggleIcon = () => {
  return isSinhalaTextView.value
    ? getAssetUrl("icons/paali.png")
    : getAssetUrl("icons/sinhala.png");
};

const getArrowIcon = () => {
  return areMobileLowerControlsVisible.value
    ? getAssetUrl("icons/arrow_down.png")
    : getAssetUrl("icons/arrow_up.png");
};

const getInfoIcon = () => {
  return getAssetUrl("icons/info.png");
};

const displayTitle = computed(() => {
  const minScreenWidth = 1067;
  const minScreenWidthForMiniDeco = 871;
  const maxScreenWidthForMiniDeco = 1066;
  const isSmallScreen = window.innerWidth < minScreenWidth;
  const isSmallScreenForMiniDeco =
    window.innerWidth < maxScreenWidthForMiniDeco &&
    window.innerWidth >= minScreenWidthForMiniDeco;

  if (!selectedVerse.value.showVerseTitle) {
    return `──────${deco}──────`;
  }

  if (isSmallScreenForMiniDeco) {
    return `${miniDeco} ${selectedVerse.value.title} ${miniDeco}`;
  }

  return !isSmallScreen
    ? `${deco} ${selectedVerse.value.title} ${deco}`
    : `${selectedVerse.value.title}`;
});

const goContactUs = () => {
  router.push({ name: "ContactUs" });
};

const youtubeUrlSS_ = youtubeUrlSS;

function openDisclaimer() {
  isDisclaimerOpen.value = true;
}

function closeDisclaimer() {
  isDisclaimerOpen.value = false;
}

function toggleDisclaimer() {
  isDisclaimerOpen.value = !isDisclaimerOpen.value;
}

onMounted(() => {
  initializeGuidance({ autoOpen: false });
  void checkVersion();
  landscapeOrientationQuery = window.matchMedia(
    "(orientation: landscape) and (hover: none) and (pointer: coarse)",
  );
  updateLandscapeOrientationBlock();
  if (landscapeOrientationQuery.addEventListener) {
    landscapeOrientationQuery.addEventListener(
      "change",
      updateLandscapeOrientationBlock,
    );
  } else {
    landscapeOrientationQuery.addListener(updateLandscapeOrientationBlock);
  }
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
  if (landscapeOrientationQuery?.removeEventListener) {
    landscapeOrientationQuery.removeEventListener(
      "change",
      updateLandscapeOrientationBlock,
    );
  } else {
    landscapeOrientationQuery?.removeListener(updateLandscapeOrientationBlock);
  }
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

watch(isLandscapeOrientationBlocked, (isBlocked) => {
  if (isBlocked) {
    pauseForLandscapeOrientation();
  }
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
        startPlayerAutoHideTimer();
      }
    }
  },
  { immediate: true },
);

resetActiveAudioRange();
</script>

<style>
/* ===== Global ===== */
@font-face {
  font-family: "UN Arundathee";
  src: url("./assets/fonts/un_arundathee.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "UN Ganganee";
  src: url("./assets/fonts/un_ganganee.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

body {
  margin: 0;
  background: linear-gradient(#4b1e1e, #7a1f1f);
  font-family:
    "Noto Sans Arundathee",
    serif,
    "Noto Sans Sinhala",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
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

button,
.btn,
a,
div {
  -webkit-tap-highlight-color: transparent;
}

button:focus,
button:active {
  outline: none;
}

.rotate-device {
  display: none;
}

.app-orientation-content {
  min-height: 100%;
  transition:
    filter 0.25s ease,
    transform 0.25s ease;
}

@media (orientation: landscape) and (hover: none) and (pointer: coarse) {
  .app-orientation-content {
    filter: blur(6px);
    pointer-events: none;
    transform: scale(0.985);
    user-select: none;
  }

  .rotate-device {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(calc(100vw - 32px), 520px);
    min-height: 138px;
    padding: 26px 24px;
    border: 1px solid rgba(90, 42, 24, 0.075);
    border-radius: 18px;
    background:
      linear-gradient(
        180deg,
        rgba(255, 251, 242, 0.98),
        rgba(252, 239, 215, 0.98)
      ),
      #fdf1da;
    color: #ffffff;
    font-family: "Abhaya Libre", serif;
    font-size: clamp(20px, 3.4vw, 30px);
    line-height: 1.45;
    text-align: center;
    transform: translate(-50%, -50%);
    box-shadow: 0 24px 60px rgba(35, 11, 5, 0.28);
  }

  .rotate-device::before {
    position: fixed;
    inset: -100vmax;
    z-index: -1;
    background: rgba(35, 18, 11, 0.42);
    backdrop-filter: blur(8px);
    content: "";
  }

  .rotate-device-icon {
    width: 80px;
    height: auto;
    margin-top: 12px;
  }
}

.page-open-enter-active,
.page-open-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.page-open-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.page-open-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.01);
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

.punyanumodana-audio-player {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  opacity: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  clip-path: inset(50%) !important;
}

/* ===== Container ===== */
.app-container {
  max-width: 1200px;
  height: 100dvh;
  margin: 0 auto;
  padding: 4px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ===== Layout ===== */
.app {
  margin-top: 1%;
  display: flex;
  gap: 28px;
  height: calc(100dvh - 29px);
  min-height: 0;
  align-items: stretch;
}

/* ===== Cards (Sidebar + Content) =====*/
.content {
  background: #fdf1da;
  background: linear-gradient(
    148deg,
    rgba(253, 241, 218, 1) 0%,
    rgba(248, 231, 199, 1) 50%,
    rgba(239, 215, 172, 1) 100%
  );
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

  padding: 0;
  z-index: 10;
}

.content-title {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
  font-family: "UN Arundathee" !important;
  font-size: 22px;
  color: #410707;
}

.content-title > div {
  max-width: 100%;
  text-align: center;
}

.guard {
  color: #410707;
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
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
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

.disclaimer-trigger {
  position: fixed;
  right: 14px;
  bottom: 14px;
  z-index: 2200;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;

  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.disclaimer-trigger:hover {
  transform: scale(1.02);
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
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    opacity 0.2s ease;
}

.reader-scroll-btn:hover:not(:disabled) {
  background: #fff;
  transform: scale(1.08);
}

.reader-scroll-btn:disabled {
  cursor: default;
  opacity: 0.35;
}

.desktop-only {
  display: inline;
}

.utube-icon {
  width: 34px;
  height: 34px;
}
.contact-link {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 36%;
  background: transparent;
  color: #4c1711;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.contact-link:hover,
.contact-link:focus-visible {
  color: #c63100;
  transform: scale(1.08);
  outline: none;
}

.contact-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.home-info-icon {
  width: 20px;
  height: auto;
  opacity: 0.5;
}

.home-info-icon:hover {
  opacity: 1;
}

@media (max-width: 1085px) {
  .desktop-only {
    display: none;
  }
}

/* ===== Responsive ===== */
@media (max-width: 870px) {
  .content {
    background: #fdf1da;
    background: linear-gradient(
      180deg,
      rgb(253 241 219) 0%,
      rgba(248, 231, 199, 1) 77%,
      rgb(255 231 189) 100%
    );
  }

  .guard {
    display: none;
  }

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
    margin-top: 2%;
    display: flex;
    height: calc(100dvh - 22px);
    min-height: 0;
    align-items: stretch;
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
    transition:
      background 0.3s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;
  }

  .lower-controls-toggle.active {
    background-color: transparent;
  }

  .content .player {
    max-height: 96px;
    opacity: 1;
    overflow: hidden;
    transform: translateY(0);
    transition:
      max-height 0.55s ease,
      opacity 0.25s ease,
      transform 0.55s ease,
      margin 0.55s ease,
      padding 0.55s ease;
  }

  .mobile-lower-controls-hidden .player {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
    transform: translateY(18px);
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
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

  /*
  .content-wrapper.mobile-lower-controls-hidden {
    padding-bottom: 5%;
  }
  */
}
</style>
