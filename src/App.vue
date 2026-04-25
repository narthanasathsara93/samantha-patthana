<!-- src/App.vue -->
<template>
  <div class="app-container">
    <div class="app">
      <!-- Sidebar -->
      <aside :class="['sidebar', { open: isSidebarOpen }]">
        <div class="sidebar-header">Lessons</div>

        <ul>
          <li
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            :class="{ active: index === currentIndex }"
            @click="
              selectLesson(index);
              closeSidebar();
            "
          >
            {{ lesson.title }}
          </li>
        </ul>
      </aside>

      <!-- Content -->
      <main class="content">
        <!-- Mobile Header -->
        <div class="mobile-header">
          <button @click="toggleSidebar">☰</button>
          <span>{{ selectedLesson.title }}</span>
        </div>

        <!--AutoPlay -->
        <div class="top-bar">
          <button
            class="autoplay-btn"
            :class="{ active: isAutoPlaying }"
            @click="toggleAutoplay"
          >
            {{ isAutoPlaying ? "Stop" : "Autoplay" }}
          </button>
        </div>

        <!-- Overlay -->
        <div class="overlay" v-if="isSidebarOpen" @click="toggleSidebar"></div>

        <div class="reader">
          <h1>{{ selectedLesson.title }}</h1>
          <p>{{ selectedLesson.content }}</p>
        </div>

        <!-- Audio -->
        <div class="player">
          <audio
            ref="audioRef"
            :src="selectedLesson.audio"
            controls
            @ended="onAudioEnded"
          ></audio>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button @click="prev" :disabled="currentIndex === 0">Prev</button>

          <span>{{ currentIndex + 1 }} / {{ lessons.length }}</span>

          <button @click="next" :disabled="currentIndex === lessons.length - 1">
            Next
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { lessons } from "./data/lessons";

const currentIndex = ref(0);
const audioRef = ref(null);

const selectedLesson = computed(() => lessons[currentIndex.value]);

// function selectLesson(index) {
//   currentIndex.value = index;
//   resetAudio();
// }

// function prev() {
//   if (currentIndex.value > 0) {
//     currentIndex.value--;
//     resetAudio();
//   }
// }

// function next() {
//   if (currentIndex.value < lessons.length - 1) {
//     currentIndex.value++;
//     resetAudio();
//   }
// }

function resetAudio() {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.load();
  }
}

const isSidebarOpen = ref(false);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebar() {
  isSidebarOpen.value = false;
}

const isAutoPlaying = ref(false);

function toggleAutoplay() {
  isAutoPlaying.value = !isAutoPlaying.value;

  if (isAutoPlaying.value) {
    playCurrent();
  } else {
    // Stop currently playing audio when disabling autoplay
    if (audioRef.value) {
      audioRef.value.pause();
    }
  }
}

function playCurrent() {
  if (audioRef.value) {
    audioRef.value.play().catch(() => {
      // browser autoplay restrictions fallback
      isAutoPlaying.value = false;
    });
  }
}

function onAudioEnded() {
  if (!isAutoPlaying.value) return;

  if (currentIndex.value < lessons.length - 1) {
    currentIndex.value++;

    // wait for DOM/audio to update
    setTimeout(() => {
      playCurrent();
    }, 200);
  } else {
    // reached end → stop autoplay
    isAutoPlaying.value = false;
  }
}

function selectLesson(index) {
  currentIndex.value = index;
  resetAudio();

  if (isAutoPlaying.value) {
    setTimeout(playCurrent, 200);
  }
}

function next() {
  if (currentIndex.value < lessons.length - 1) {
    currentIndex.value++;
    resetAudio();

    if (isAutoPlaying.value) {
      setTimeout(playCurrent, 200);
    }
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetAudio();

    if (isAutoPlaying.value) {
      setTimeout(playCurrent, 200);
    }
  }
}
</script>

<style>
/* ===== Global ===== */
body {
  margin: 0;
  background: #f6f7fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #222;
}

/* ===== Container ===== */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* ===== Layout ===== */
.app {
  margin-top: 20px;
  display: flex;
  gap: 28px;
  min-height: 85vh;
}

/* ===== Cards (Sidebar + Content) ===== */
.sidebar,
.content {
  background: #ffffff;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

/* ===== Sidebar ===== */
.sidebar {
  width: 240px;
  padding: 10px 0;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 16px;
  font-weight: 600;
  font-size: 18px;
  border-bottom: 1px solid #f0f0f0;
}

/* List */
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 12px 18px;
  cursor: pointer;
  border-radius: 8px;
  margin: 4px 10px;
  transition: all 0.2s ease;
}

.sidebar li:hover {
  background: #f3f4f6;
}

.sidebar li.active {
  background: #e8f0ff;
  color: #2563eb;
  font-weight: 600;
}

/* ===== Content ===== */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 28px;
}

/* ===== Reader ===== */
.reader {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.reader h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
}

.reader p {
  font-size: 18px;
  line-height: 1.8;
  color: #444;
  max-width: 720px; /* better readability */
}

/* ===== Audio Player ===== */
.player {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.player audio {
  width: 100%;
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 14px 0;
}

.pagination span {
  font-size: 14px;
  color: #666;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #f1f3f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover {
  background: #e2e8f0;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Mobile Header ===== */
.mobile-header {
  display: none;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border-radius: 10px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.mobile-header button {
  font-size: 20px;
  cursor: pointer;
  background: none;
  border: none;
}

/* ===== Overlay ===== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
  z-index: 5;
}

/* ===== Top Bar ===== */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

/* Autoplay Button */
.autoplay-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.autoplay-btn:hover {
  background: #e0e7ff;
}

.autoplay-btn.active {
  background: #4f46e5;
  color: white;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
    gap: 16px;
  }

  .mobile-header {
    display: flex;
  }

  .content {
    padding: 20px;
  }

  .reader h1 {
    font-size: 22px;
  }

  .reader p {
    font-size: 16px;
  }

  /* Sidebar drawer */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 80%;
    max-width: 280px;
    z-index: 10;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>