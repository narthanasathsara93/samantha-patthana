<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div
      class="sidebar-header"
      role="button"
      tabindex="0"
      aria-label="Go to home page"
      @click="goToHome"
      @keydown.enter.prevent="goToHome"
      @keydown.space.prevent="goToHome"
    >
      <span class="header-details">
        <img class="logo-img" :src="logoImage" alt="Samantha Patthana logo" />
        <div class="header-text">සමන්ත පට්ඨාන වන්දනා</div>
      </span>
    </div>

    <div class="liner"></div>

    <ul>
      <li
        v-for="(verse, index) in verses"
        :key="verse.id"
        :class="{ active: isActiveVerse(verse) }"
      >
        <button
          class="verse-row"
          type="button"
          @click="handleVerseClick(verse)"
          :aria-label="`Go to verse ${index + 1}`"
        >
          <span class="number">
            {{ String(index + 1).padStart(2, "0") }}.
          </span>
          <span class="verse-title">
            {{ verse.title }}

            <span v-if="isBookmarked(verse.id)" class="bookmark-indicator">
              <img
                class="bookmark-indicator-img"
                :src="getImage('icons/bookmarked.png')"
                alt="Bookmarked verse"
              />
            </span>
          </span>
        </button>
      </li>
    </ul>

    <div class="sidebar-contact" aria-label="Contact links">
      <button
        class="contact-link"
        type="button"
        aria-label="Practice"
        title="පුහුණුව වෙත පිවිසෙන්න"
        @click="goToPracticeHome"
        @mouseenter="hoveredContact = 'practice'"
        @mouseleave="hoveredContact = null"
      >
        <img
          class="contact-icon mind-icon"
          :src="
            hoveredContact === 'practice'
              ? getImage('icons/mindset3.png')
              : getImage('icons/mindset1.png')
          "
          alt=""
        />
      </button>

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
              ? getImage('icons/contact2.png')
              : getImage('icons/contact1.png')
          "
          alt=""
        />
      </button>

      <button
        class="contact-link"
        type="button"
        aria-label="Resources"
        title="මූලාශ්‍ර ගොමුව"
        @click="handleResourcesClick"
        @mouseenter="hoveredContact = 'resources'"
        @mouseleave="hoveredContact = null"
      >
        <img
          class="contact-icon"
          :src="
            hoveredContact === 'resources'
              ? getImage('icons/diamond2.png')
              : getImage('icons/diamond1.png')
          "
          alt=""
        />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { verses } from "../data/verses";
import { getAssetUrl } from "../utils/assets";
import logoImage from "../assets/images/logo.webp";

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
  verseIndexMap: {
    type: Object,
    required: true,
  },
  isBookmarked: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["verse-selected", "show-resources", "close-sidebar"]);
const router = useRouter();

const hoveredContact = ref(null);

const isActiveVerse = (verse) => {
  return verse.id === props.selectedId;
};

const handleVerseClick = (verse) => {
  router.push({
    name: verse.englishName,
  });
  emit("close-sidebar");
};

const handleResourcesClick = () => {
  router.push({ name: "Resources" });
  emit("show-resources");
  emit("close-sidebar");
};

const getImage = (img) => {
  return getAssetUrl(img);
};

const goToHome = () => {
  router.push({ name: "Home" });
  emit("close-sidebar");
};

const goToPracticeHome = () => {
  router.push({ name: "PracticeMode" });
  emit("close-sidebar");
};

const goContactUs = () => {
  router.push({ name: "ContactUs" });
  emit("close-sidebar");
};
</script>

<style scoped>
.logo-img {
  width: 50px;
  height: auto;
}

/* ===== Sidebar ===== */

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 10px 0;
  border-radius: 12px;
  background: linear-gradient(
    148deg,
    rgba(253, 241, 218, 1) 0%,
    rgba(248, 231, 199, 1) 50%,
    rgba(239, 215, 172, 1) 100%
  );
  transition: transform 0.1s ease;
}

.liner {
  border-bottom: 2px solid #dfc59c73;
}

.header-details {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  text-align: center;
  font-size: 18px;
  font-weight: 900;
  transition:
    transform 0.25s ease,
    color 0.25s ease;
}

.header-details:hover {
  cursor: pointer;
  transform: scale(1.05);
}

/* ===== Verse List ===== */

.sidebar ul {
  flex: 1;
  margin: 0;
  padding: 0 28px;
  list-style: none;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.sidebar ul::-webkit-scrollbar {
  display: none;
}

.sidebar > ul > li {
  margin: 2px 0;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.verse-row {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #666363;
  font-family: inherit;
  font-weight: 900;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.sidebar > ul > li:hover .verse-row {
  background: rgba(141, 138, 138, 0.2);
  color: #330505;
  transform: scale(1.013);
}

.sidebar > ul > li.active > .verse-row > .verse-title {
  color: #c63100;
}

.number {
  width: 24px;
  flex-shrink: 0;
  text-align: right;
  color: #444;
}

.verse-title {
  flex: 1;
  margin-left: 5px;
  font-size: 14px;
}

.bookmark-indicator-img {
  width: 14px;
  height: 14px;
}

/* ===== Footer Actions ===== */

.sidebar-contact {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 14px 18px 12px;
  border-top: 2px solid #dfc59c73;
  flex-shrink: 0;
}

.contact-link {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 36%;
  background: rgba(255, 248, 229, 0.58);
  color: #4c1711;
  box-shadow: 0 4px 12px rgba(59, 9, 6, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.contact-link:hover,
.contact-link:focus-visible {
  background: rgba(255, 255, 255, 0.78);
  color: #c63100;
  transform: scale(1.08);
  outline: none;
}

.contact-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.contact-feedback {
  position: absolute;
  left: 50%;
  bottom: 54px;
  transform: translateX(-50%);
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #4c1711;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(59, 9, 6, 0.12);
}

/* ===== Responsive ===== */

@media (max-width: 870px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 280px;
    height: 100dvh;
    z-index: 10;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar ul {
    margin: 12px 0;
  }

  .sidebar-contact {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>
