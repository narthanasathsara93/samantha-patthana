import { ref, computed, watch } from 'vue'
import { lessons } from '../data/lessons'

export function useNavigation() {
  // Load saved index from localStorage or default to 0
  const getSavedIndex = () => {
    const saved = localStorage.getItem('current-lesson-index')
    return saved ? parseInt(saved, 10) : 0
  }

  const currentIndex = ref(getSavedIndex())

  const selectedLesson = computed(() => lessons[currentIndex.value])

  // Save index to localStorage whenever it changes
  watch(currentIndex, (newIndex) => {
    localStorage.setItem('current-lesson-index', newIndex.toString())
  })

  function selectLesson(index) {
    currentIndex.value = index
  }

  function next() {
    if (currentIndex.value < lessons.length - 1) {
      currentIndex.value++
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  return {
    currentIndex,
    selectedLesson,
    selectLesson,
    next,
    prev
  }
}