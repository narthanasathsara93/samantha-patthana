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
          @toggle-sidebar="toggleSidebar"
          @toggle-bookmark="handleToggleBookmark"
        />

        <div
          class="content-controls"
          :class="{ 'hidden-on-mobile-menu': isSidebarOpen }"
        >
          <AutoplayButton
            :is-auto-playing="isAutoPlaying"
            @toggle-autoplay="toggleAutoplay"
          />
          <BookmarkButton
            :is-bookmarked="isBookmarked(selectedVerse.id)"
            @toggle-bookmark="handleToggleBookmark"
          />
        </div>

        <!-- Overlay -->
        <Overlay :show="isSidebarOpen" @click="toggleSidebar" />

        <VerseContent
          :title="selectedVerse.title"
          :content="selectedVerse.content"
          :show-verse-title="selectedVerse.showVerseTitle"
        />

        <!-- Audio -->
        <AudioPlayer
          ref="audioPlayerRef"
          :audio-src="selectedVerse.audio"
          @audio-ended="handleAudioEnded"
        />

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
import { ref, computed } from "vue";

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

// Component refs
const audioPlayerRef = ref(null);

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
function handleVerseSelected(index) {
  selectVerse(index);
  resetAudio(audioRef);
  closeSidebar();

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

function toggleAutoplay() {
  toggleAutoplayLogic(audioRef);
}
</script>

<style>
/* ===== Global ===== */

body {
  margin: 0;
  background: #490202;
  font-family: "Noto Sans Sinhala", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, sans-serif;
  color: #222;
}

/* ===== Container ===== */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 7px;
}

/* ===== Layout ===== */
.app {
  margin-top: 20px;
  display: flex;
  gap: 28px;
  min-height: 85vh;
}

/* ===== Cards (Sidebar + Content) ===== */
.content {
  background: #fff9f1;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 60px rgba(211, 194, 112, 0.39);
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 28px;
}

/* ===== Content Controls ===== */
.content {
  position: relative;
}

.content-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
    gap: 16px;
  }

  .content {
    padding: 20px;
  }

  .content-controls {
    top: 15px;
    right: 15px;
  }

  .content-controls.hidden-on-mobile-menu {
    display: none;
  }
}
</style>