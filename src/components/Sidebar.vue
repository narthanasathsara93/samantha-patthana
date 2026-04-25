<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div class="sidebar-header">Lessons</div>
    <ul>
      <li
        v-for="lesson in lessons"
        :key="lesson.id"
        :class="{
          active: isActiveLesson(lesson)
        }"
      >
        <button class="lesson-row" type="button" @click="handleLessonClick(lesson)">
          <span class="lesson-title">{{ lesson.title }}</span>
          <span class="lesson-actions">
            <span v-if="lesson.sections" class="expand-indicator">
              {{ expandedIds.has(lesson.id) ? '▾' : '▸' }}
            </span>
          </span>
        </button>
        <ul
          v-if="lesson.sections && expandedIds.has(lesson.id)"
          class="subsection-list"
        >
          <li
            v-for="section in lesson.sections"
            :key="section.id"
            :class="{
              active: selectedId === section.id,
              bookmarked: isBookmarked(section.id)
            }"
            @click.stop="selectSection(section.id)"
          >
            <span class="lesson-title">{{ section.title }}</span>
            <span v-if="isBookmarked(section.id)" class="bookmark-indicator">★</span>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, watch, computed, toRefs } from 'vue'
import { lessons } from '../data/lessons'

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: [String, Number],
    default: null
  },
  lessonIndexMap: {
    type: Object,
    required: true
  },
  isBookmarked: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['lesson-selected'])
const { selectedId } = toRefs(props)

const expandedIds = ref(new Set())

const sectionParentIds = computed(() => {
  const map = {}
  lessons.forEach((lesson) => {
    if (lesson.sections && Array.isArray(lesson.sections)) {
      lesson.sections.forEach((section) => {
        map[section.id] = lesson.id
      })
    }
  })
  return map
})

// const hasBookmarkedSection = (lesson) => {
//   return lesson.sections && lesson.sections.some((section) => props.isBookmarked(section.id))
// }

const isActiveLesson = (lesson) => {
  return lesson.id === props.selectedId
}

watch(
  () => props.selectedId,
  (selectedId) => {
    const parentId = sectionParentIds.value[selectedId]
    if (parentId) {
      expandedIds.value.clear()
      expandedIds.value.add(parentId)
    }
  },
  { immediate: true }
)

const handleLessonClick = (lesson) => {
  if (lesson.sections && lesson.sections.length) {
    if (expandedIds.value.has(lesson.id)) {
      expandedIds.value.delete(lesson.id)
    } else {
      expandedIds.value.clear()
      expandedIds.value.add(lesson.id)
    }
  } else if (props.lessonIndexMap[lesson.id] !== undefined) {
    emit('lesson-selected', props.lessonIndexMap[lesson.id])
  }
}

const selectSection = (sectionId) => {
  const index = props.lessonIndexMap[sectionId]
  if (index !== undefined) {
    emit('lesson-selected', index)
  }
}
</script>

<style scoped>
/* ===== Sidebar ===== */
.sidebar {
  width: 240px;
  padding: 10px 0;
  transition: transform 0.3s ease;
  background: #ffffff;
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 60px rgb(245 135 135 / 13%);
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

.sidebar > ul > li {
  padding: 0;
  margin: 4px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.sidebar > ul > li.active > .lesson-row {
  border: #666 solid 1px;
  font-weight: 600;
}

.sidebar > ul > li.bookmarked > .lesson-row {
  background: #fff8e1;
}

.sidebar > ul > li.bookmarked > .lesson-row:hover {
  background: #fff3c4;
}

.lesson-row {
  width: 100%;
  padding: 12px 18px;
  cursor: pointer;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  font-size: inherit;
  font-family: inherit;
  color: #666363;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lesson-row:hover {
  background: #f3f4f6;
}

.lesson-actions {
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
  font-weight: 400;
  color: #666363;
}

.subsection-list li:hover {
  background: #f3f4f6;
  color: #222;
}

.subsection-list li.active {
  background: rgba(245, 135, 135, 0.13);
  color: #4d4c4c;
  font-weight: 400;
}

/*
.subsection-list li.bookmarked {
  background: #fff8e1;
}

.subsection-list li.bookmarked:hover {
  background: #fff3c4;
}
*/

.lesson-title {
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
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>