<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div class="sidebar-header">Lessons</div>
    <ul>
      <li
        v-for="(lesson, index) in lessons"
        :key="lesson.id"
        :class="{ active: index === currentIndex, bookmarked: isBookmarked(lesson.id) }"
        @click="$emit('lesson-selected', index)"
      >
        <span class="lesson-title">{{ lesson.title }}</span>
        <span v-if="isBookmarked(lesson.id)" class="bookmark-indicator">★</span>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { lessons } from '../data/lessons'

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false
  },
  currentIndex: {
    type: Number,
    default: 0
  },
  isBookmarked: {
    type: Function,
    required: true
  }
})

defineEmits(['lesson-selected'])
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
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar li:hover {
  background: #f3f4f6;
}

.sidebar li.active {
  background: #e8f0ff;
  color: #2563eb;
  font-weight: 600;
}

.sidebar li.bookmarked {
  background: #fff8e1;
}

.sidebar li.bookmarked:hover {
  background: #fff3c4;
}

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