import { ref, computed } from 'vue'

export function useBookmarks() {
  const bookmarks = ref(new Set())

  // Load bookmarks from localStorage on mount
  const loadBookmarks = () => {
    const stored = localStorage.getItem('lesson-bookmarks')
    if (stored) {
      bookmarks.value = new Set(JSON.parse(stored))
    }
  }

  // Save bookmarks to localStorage
  const saveBookmarks = () => {
    localStorage.setItem('lesson-bookmarks', JSON.stringify([...bookmarks.value]))
  }

  // Toggle bookmark for a lesson
  const toggleBookmark = (lessonId) => {
    if (bookmarks.value.has(lessonId)) {
      bookmarks.value.delete(lessonId)
    } else {
      bookmarks.value.add(lessonId)
    }
    saveBookmarks()
  }

  // Check if a lesson is bookmarked
  const isBookmarked = (lessonId) => {
    return bookmarks.value.has(lessonId)
  }

  // Get all bookmarked lessons
  const bookmarkedLessons = computed(() => [...bookmarks.value])

  return {
    bookmarks,
    loadBookmarks,
    toggleBookmark,
    isBookmarked,
    bookmarkedLessons
  }
}