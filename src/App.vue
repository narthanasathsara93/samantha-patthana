<!-- src/App.vue -->
<template>
  <div class="rotate-device" role="status" aria-live="polite">
    කරුණාකර සිරස් හරවා (Portrait) භාවිතා කරන්න.
    <span class="rotate-icon-cont" aria-hidden="true">
      <img
        class="rotate-device-icon"
        :src="rotateDeviceIcon"
        alt=""
      />
    </span>
  </div>

  <div class="app-orientation-content">
    <Transition name="page-open" mode="out-in">
      <Home v-if="isHomeRoute" key="home" />
      <PracticeHome v-else-if="isPracticeRoute" key="practice" />
      <Settings v-else-if="isSettingsRoute" key="settings" />
      <ContactUs v-else-if="isContactRoute" key="contact" />
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
              <img class="arrow-up-down-icon" :src="getArrowIcon()" alt="" />
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
      @click="toggleDisclaimer"
      :aria-expanded="isDisclaimerOpen"
      aria-label="Show disclaimer"
    >
      <span>i</span>
    </button>

    <Transition name="disclaimer-popup">
      <div
        v-if="isDisclaimerOpen && isHomeRoute"
        class="disclaimer-popup-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
        @click.self="closeDisclaimer"
      >
        <section class="disclaimer-popup">
          <h2 id="disclaimer-title">පාඨ සටහන</h2>
          <div class="disclaimer-popup-message">
            මෙම යෙදුමේ අන්තර්ගත පාඨ විවිධ ඩිජිටල් මූලාශ්‍ර ඇසුරින් සම්පාදනය කර
            ඇත. නිරවද්‍යතාවය තහවුරු කිරීම සඳහා උපරිම උත්සාහය ගෙන තිබුණද, අක්ෂර
            දෝෂ හෝ වෙනත් අඩුපාඩු පැවතිය හැකිය. යම් දෝෂයක් හෝ සංශෝධනයක් දැනුම්
            දීමට කැමති නම්, කරුණාකර අප හා සම්බන්ධ වන්න.
            <button
              class="contact-link"
              type="button"
              aria-label="Contact us"
              title="ඔබේ ප්‍රතිචාර"
              @click="goContactUs"
              @mouseenter="hoveredContact = 'contact'"
              @mouseleave="hoveredContact = null"
            >
              <img
                class="contact-icon"
                :src="
                  hoveredContact === 'contact'
                    ? getDisclaimerIcon('contact2.png')
                    : getDisclaimerIcon('contact1.png')
                "
                alt=""
              />
            </button>

            <br /><br />

            මෙම යෙදුම ධර්ම දානයක් ලෙස පිරිනමනු ලබන අතර, මුල් මූලාශ්‍රයන්ට ගෞරවය
            පිරිනමනු ලැබේ.<br />
            තෙරුවන් සරණයි!!!
          </div>
          <button
            type="button"
            class="disclaimer-close-btn"
            aria-label="Close disclaimer"
            @click="closeDisclaimer"
          >
            <span aria-hidden="true">පැහැදිලියි</span>
          </button>
        </section>
      </div>
    </Transition>

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
import { deco } from "./utils/util";

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
    return String(verseNumber - 2).padStart(2, "0");
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

const goContactUs = () => {
  router.push({ name: "ContactUs" });
};

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

const closeGuidanceModal = () => {
  closeGuidance({ complete: false });
};

const markGuidanceAsComplete = () => {
  const routeToContinue = closeGuidance({ complete: true });

  if (routeToContinue) {
    router.push(routeToContinue);
  }
};

const {
  isAutoPlaying,
  toggleAutoplay: toggleAutoplayLogic,
  onAudioEnded,
} = useAutoplay(playCurrent);
const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
const { isBookmarked, toggleBookmark, loadBookmarks } = useBookmarks();
useBfcache(); // Initialize bfcache optimization
const {
  isUpdateAvailable,
  isRefreshing,
  isHardResetInProgress,
  checkVersion,
  applySoftUpdate,
} = useAppVersion();
const {
  isGuidanceOpen,
  showContinueLabel,
  activeGuidanceSection,
  initializeGuidance,
  closeGuidance,
} = useGuidance();
const route = useRoute();
const router = useRouter();
const pullToReload = {
  startX: 0,
  startY: 0,
  startedAtReaderTop: false,
  isTracking: false,
};

const isRoutePunyanumodana = computed(() => route.name === "punyanumodana");
const isHomeRoute = computed(() => route.name === "Home" || route.path === "/");
const isPracticeRoute = computed(() => route.name === "PracticeMode");
const isSettingsRoute = computed(() => route.name === "Settings");
const isContactRoute = computed(() => route.name === "ContactUs");
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
  return window.matchMedia("(max-width: 870px)").matches;
}

function updateLandscapeOrientationBlock() {
  isLandscapeOrientationBlocked.value = Boolean(
    landscapeOrientationQuery?.matches,
  );
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

const hoveredContact = ref(null);

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
  pendingManualAudioSectionIndex.value = -1;
}

function handlePlayAudioSection(section, index = -1) {
  const audio = audioPlayerRef.value?.audioRef;
  const isSameSection = index === activeAudioSectionIndex.value && index !== -1;
  const isPlaying = audio && !audio.paused;

  // If clicking same section while playing, toggle pause
  if (isSameSection && isPlaying) {
    pendingManualAudioSectionIndex.value = -1;
    audio.pause();
    return;
  }

  // Set the clicked section as active
  activeAudioStartAt.value = section.startAt;
  activeAudioEndAt.value = selectedVerse.value?.audioEndAt ?? section.endAt;
  activeAudioSectionIndex.value = index;
  pendingManualAudioSectionIndex.value = index;

  // Always play the section
  nextTick(() => {
    audioPlayerRef.value?.playSection();
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
  startPlayerAutoHideTimer();

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
      startPlayerAutoHideTimer();
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
      startPlayerAutoHideTimer();
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
  // Only update active section when audio is actually playing
  if (
    selectedVerseAudioSections.value.length === 0 ||
    !audioRef.value ||
    audioRef.value.paused
  ) {
    return;
  }

  const sectionIndex = getAudioSectionIndex(currentTime);

  if (pendingManualAudioSectionIndex.value !== -1) {
    if (sectionIndex === pendingManualAudioSectionIndex.value) {
      pendingManualAudioSectionIndex.value = -1;
    }

    return;
  }

  if (sectionIndex === -1 || sectionIndex === activeAudioSectionIndex.value) {
    return;
  }

  activeAudioSectionIndex.value = sectionIndex;
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

function openDisclaimer() {
  isDisclaimerOpen.value = true;
}

function closeDisclaimer() {
  isDisclaimerOpen.value = false;
}

function toggleDisclaimer() {
  isDisclaimerOpen.value = !isDisclaimerOpen.value;
}

function toggleMobileLowerControls() {
  areMobileLowerControlsVisible.value = !areMobileLowerControlsVisible.value;
  isPlayerManuallyToggled.value = true;
  if (playerAutoHideTimer) {
    clearTimeout(playerAutoHideTimer);
    playerAutoHideTimer = null;
  }
}

function clearAutoplayControlsHideTimer() {
  if (autoplayControlsHideTimer) {
    clearTimeout(autoplayControlsHideTimer);
    autoplayControlsHideTimer = null;
  }
}

function startPlayerAutoHideTimer() {
  isPlayerManuallyToggled.value = false;
  if (playerAutoHideTimer) {
    clearTimeout(playerAutoHideTimer);
  }
  playerAutoHideTimer = setTimeout(() => {
    if (
      !isPlayerManuallyToggled.value &&
      isMobileView() &&
      areMobileLowerControlsVisible.value
    ) {
      areMobileLowerControlsVisible.value = false;
    }
    playerAutoHideTimer = null;
  }, 5000);
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
    // If player is hidden, show it first
    if (!areMobileLowerControlsVisible.value) {
      areMobileLowerControlsVisible.value = true;
    }

    // Auto-hide after 5 seconds
    autoplayControlsHideTimer = setTimeout(() => {
      if (isAutoPlaying.value && areMobileLowerControlsVisible.value) {
        areMobileLowerControlsVisible.value = false;
      }
    }, 5000);
  }
}

function pauseForLandscapeOrientation() {
  if (isAutoPlaying.value) {
    toggleAutoplayLogic(audioRef);
    clearAutoplayControlsHideTimer();
    return;
  }

  audioRef.value?.pause?.();
}

const rotateDeviceIcon = getAssetUrl("icons/rotate.gif");

const getDisclaimerIcon = (img) => {
  return getAssetUrl(`icons/${img}`);
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

const displayTitle = computed(() => {
  const minScreenWidth = 1070;
  const isSmallScreen = window.innerWidth < minScreenWidth;

  if (!selectedVerse.value.showVerseTitle) {
    return `──────${deco}──────`;
  }

  return !isSmallScreen
    ? `${deco} ${selectedVerse.value.title} ${deco}`
    : `${selectedVerse.value.title}`;
});

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
  background: rgb(58 31 15 / 38%);
  color: #f7e7c8;
  font-style: italic;
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.disclaimer-trigger:hover {
  transform: scale(1.08);
  background: rgba(58, 31, 15, 1);
}

.disclaimer-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  background: rgba(35, 9, 5, 0.55);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.disclaimer-popup {
  max-width: 520px;
  border-radius: 18px;
  padding: 22px 22px 18px;
  background: #fff7e3;
  box-shadow: 0 22px 56px rgba(35, 9, 5, 0.26);
  color: #3b0906;
  text-align: left;
}

.disclaimer-popup h2 {
  margin: 0 0 12px;
  font-family: "Abhaya Libre", serif;
  font-size: 25px;
}

.disclaimer-popup-message {
  margin-bottom: 20px;
  font-family: "Abhaya Libre", serif;
  font-size: 19px;
  line-height: 1.65;
  color: #4b1e1e;
  text-align: justify;
}

.disclaimer-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  background: #7a2410;
  color: #ffebd8;
  font-size: 17px;
  font-family: "Abhaya Libre", serif;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.disclaimer-close-btn:hover {
  background: #a43b23;
  transform: translateY(-1px);
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
