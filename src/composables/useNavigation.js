import { ref, computed, watch } from 'vue'
import { lessons } from '../data/lessons'

export function useNavigation() {
  // Build a flat array of all lessons and sections
  const flattenedLessons = computed(() => {
    const flattened = []
    lessons.forEach((lesson) => {
      if (lesson.sections && Array.isArray(lesson.sections)) {
        lesson.sections.forEach((section) => {
          flattened.push(section)
        })
      } else {
        flattened.push(lesson)
      }
    })
    return flattened
  })

  // Create a map of lesson/section IDs to their index in the flattened array
  const lessonIndexMap = computed(() => {
    const map = {}
    flattenedLessons.value.forEach((lesson, index) => {
      map[lesson.id] = index
    })
    return map
  })

  // Load saved ID from localStorage or default to first lesson ID
  const getSavedId = () => {
    const saved = localStorage.getItem('current-lesson-id')
    if (saved) {
      return saved
    }
    // Return first section ID or first lesson ID
    return flattenedLessons.value[0]?.id || 'lesson-1'
  }

  const currentLessonId = ref(getSavedId())

  const currentIndex = computed(() => lessonIndexMap.value[currentLessonId.value] ?? 0)

  const selectedLesson = computed(() => flattenedLessons.value[currentIndex.value])

  // Save ID to localStorage whenever it changes
  watch(currentLessonId, (newId) => {
    localStorage.setItem('current-lesson-id', newId)
  })

  function selectLesson(index) {
    const lesson = flattenedLessons.value[index]
    if (lesson) {
      currentLessonId.value = lesson.id
    }
  }

  function next() {
    if (currentIndex.value < flattenedLessons.value.length - 1) {
      const nextLesson = flattenedLessons.value[currentIndex.value + 1]
      if (nextLesson) {
        currentLessonId.value = nextLesson.id
      }
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      const prevLesson = flattenedLessons.value[currentIndex.value - 1]
      if (prevLesson) {
        currentLessonId.value = prevLesson.id
      }
    }
  }

  return {
    currentIndex,
    currentLessonId,
    selectedLesson,
    selectLesson,
    next,
    prev,
    lessonIndexMap,
    flattenedLessons
  }
}