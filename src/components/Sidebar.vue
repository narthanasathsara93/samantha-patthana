<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div class="sidebar-header">
      <img class="logo-img" :src="getImage()" />
      <div class="header-text">සමන්ත පට්ඨාන වන්දනා</div>
    </div>
    <ul>
      <li
        v-for="verse in verses"
        :key="verse.id"
        :class="{
          active: isActiveVerse(verse),
        }"
      >
        <button
          class="verse-row"
          type="button"
          @click="handleVerseClick(verse)"
        >
          <span class="verse-title">
            {{ verse.title }}

            <span v-if="isBookmarked(verse.id)" class="bookmark-indicator">
              ★
            </span>
          </span>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { verses } from "../data/verses";
import { getAssetUrl } from "../utils/assets";

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

const emit = defineEmits(["verse-selected"]);

const isActiveVerse = (verse) => {
  return verse.id === props.selectedId;
};

const handleVerseClick = (verse) => {
  const index = props.verseIndexMap[verse.id];
  if (index !== undefined) {
    emit("verse-selected", index);
  }
};
const getImage = () => {
  return getAssetUrl("images/logo.png");
};
</script>

<style scoped>
.logo-img {
  width: 50px;
  height: auto;
}

.scroll-icon {
  width: 16px;
  height: 16px;
}
/* ===== Sidebar ===== */
.sidebar-list {
  padding-left: 14%;
}
.sidebar {
  width: 300px;
  padding: 10px 0;
  transition: transform 0.3s ease;
  background: #fff9f1;
  border-radius: 12px;
  border: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: none;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  flex-direction: column; /* stack vertically */
  align-items: center; /* horizontal center */
  justify-content: center; /* vertical center (if height exists) */
  text-align: center;
  gap: 6px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px;
  font-weight: 900;
  font-size: 18px;
  border-bottom: 1px solid #f0f0f0;
}

/* List */
.sidebar ul {
  margin-left: 17px;
  list-style: decimal;
  padding: 0 28px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  flex: 1;
}

.sidebar ul::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.sidebar > ul > li {
  padding: 0;
  margin: 0px 2px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 15px;
  cursor: pointer;
}

.sidebar > ul > li.active > .verse-row > .verse-title {
  color: #330505;
}

.sidebar > ul > li.bookmarked > .verse-row {
  background: #fff8e1;
}

.sidebar > ul > li.bookmarked > .verse-row:hover {
  background: #fff3c4;
}

.verse-row {
  width: 100%;
  padding: 8px 0px;
  cursor: pointer;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 900;
  font-family: inherit;
  color: #666363;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar > ul > li:hover .verse-row {
  background: #8d8a8a31;
  border-bottom-right-radius: 24px !important;
  border-top-right-radius: 24px !important;
  transform: scale(1.013);
  font-weight: 900;
  color: #c63100;
}

.verse-title {
  flex: 1;
  font-size: 14px;
}

.bookmark-indicator {
  color: #ffc107;
  font-size: 13px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 280px;
    height: 100dvh;
    z-index: 10;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar ul {
    margin-top: 5%;
    margin-bottom: 10%;
    padding: 0 28px;
  }
}
</style>
