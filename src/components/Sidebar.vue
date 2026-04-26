<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div class="sidebar-header">
      <img class="logo-img" :src="getImage()" /> <div class="header-text">සමන්ත පට්ඨාන වන්දනා</div>
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
          <span class="verse-actions">
            <span v-if="verse.sections" class="expand-indicator">
              {{ expandedIds.has(verse.id) ? "▾" : "▸" }}
            </span>
          </span>
          <span class="verse-title"> {{ verse.title }}</span>
        </button>
        <ul
          v-if="verse.sections && expandedIds.has(verse.id)"
          class="subsection-list"
        >
          <li
            v-for="section in verse.sections"
            :key="section.id"
            :class="{
              active: selectedId === section.id,
              bookmarked: isBookmarked(section.id),
            }"
            @click.stop="selectSection(section.id)"
          >
            <span class="verse-title">{{ section.title }}</span>
            <span v-if="isBookmarked(section.id)" class="bookmark-indicator"
              >★</span
            >
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, watch, computed, toRefs } from "vue";
import { verses } from "../data/verses";

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
const { selectedId } = toRefs(props);

const expandedIds = ref(new Set());

const sectionParentIds = computed(() => {
  const map = {};
  verses.forEach((verse) => {
    if (verse.sections && Array.isArray(verse.sections)) {
      verse.sections.forEach((section) => {
        map[section.id] = verse.id;
      });
    }
  });
  return map;
});

// const hasBookmarkedSection = (verse) => {
//   return verse.sections && verse.sections.some((section) => props.isBookmarked(section.id))
// }

// const isActiveVerse = (verse) => {
//   return verse.id === props.selectedId;
// };

const isActiveVerse = (verse) => {
  return (
    verse.id === props.selectedId ||
    sectionParentIds.value[props.selectedId] === verse.id
  );
};

watch(
  () => props.selectedId,
  (selectedId) => {
    const parentId = sectionParentIds.value[selectedId];
    if (parentId) {
      expandedIds.value.clear();
      expandedIds.value.add(parentId);
    }
  },
  { immediate: true }
);

const handleVerseClick = (verse) => {
  if (verse.sections && verse.sections.length) {
    if (expandedIds.value.has(verse.id)) {
      expandedIds.value.delete(verse.id);
    } else {
      expandedIds.value.clear();
      expandedIds.value.add(verse.id);
    }
  } else if (props.verseIndexMap[verse.id] !== undefined) {
    emit("verse-selected", props.verseIndexMap[verse.id]);
  }
};

const selectSection = (sectionId) => {
  const index = props.verseIndexMap[sectionId];
  if (index !== undefined) {
    emit("verse-selected", index);
  }
};
const getImage = () => {
  return require("@/assets/images/logo.png");
};

// const getIcon = () => {
//   return require("@/assets/icons/scroll.png");
// };
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
.sidebar {
  width: 240px;
  padding: 10px 0;
  transition: transform 0.3s ease;
  background: #fff9f1;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 60px rgb(181 167 99 / 39%);
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
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar > ul > li {
  padding: 0;
  margin: 4px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
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
  font-size: inherit;
  font-family: inherit;
  color: #666363;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.verse-row:hover {
  background: #8d8a8a31;
  border-bottom-right-radius: 24px !important;
  border-top-right-radius: 24px !important;
}

.verse-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.expand-indicator {
  color: #666;
  font-size: 20px;
  min-width: 20px;
  display: inline-flex;
  justify-content: center;
}

.subsection-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subsection-list li {
  padding: 10px 18px 10px 40px;
  cursor: pointer;
  border-radius: 6px;
  margin: 2px 10px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 900;
  color: #390701;
}

.subsection-list li:hover {
  border-bottom-right-radius: 24px !important;
  border-top-right-radius: 24px !important;
  background: #afacac31;
}

.subsection-list li.active {
  border-bottom-right-radius: 24px !important;
  border-top-right-radius: 24px !important;
  background: #8d8a8a31;
  color: #c63100;
  font-weight: 900;
}

/*
.subsection-list li.bookmarked {
  background: #fff8e1;
}

.subsection-list li.bookmarked:hover {
  background: #fff3c4;
}
*/

.verse-title {
  flex: 1;
}

.bookmark-indicator {
  color: #ffc107;
  font-size: 14px;
  margin-left: 8px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 80%;
    max-width: 280px;
    z-index: 10;
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>