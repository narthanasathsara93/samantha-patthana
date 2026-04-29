import { ref, computed, watch } from 'vue'
import { verses } from '../data/verses'

export function useNavigation() {
  // Build a flat array of all verses
  const flattenedVerses = computed(() => {
    return verses
  })

  // Create a map of verse/section IDs to their index in the flattened array
  const verseIndexMap = computed(() => {
    const map = {}
    flattenedVerses.value.forEach((verse, index) => {
      map[verse.id] = index
    })
    return map
  })

  // Load saved ID from localStorage or default to first verse ID
  const getSavedId = () => {
    const saved = localStorage.getItem('current-verse-id')
    if (saved) {
      return saved
    }
    // Return first section ID or first verse ID
    return flattenedVerses.value[0]?.id || 'verse-1'
  }

  const currentVerseId = ref(getSavedId())

  const currentIndex = computed(() => verseIndexMap.value[currentVerseId.value] ?? 0)

  const selectedVerse = computed(() => flattenedVerses.value[currentIndex.value])

  // Save ID to localStorage whenever it changes
  watch(currentVerseId, (newId) => {
    localStorage.setItem('current-verse-id', newId)
  })

  function selectVerse(index) {
    const verse = flattenedVerses.value[index]
    if (verse) {
      currentVerseId.value = verse.id
    }
  }

  function next() {
    if (currentIndex.value < flattenedVerses.value.length - 1) {
      const nextVerse = flattenedVerses.value[currentIndex.value + 1]
      if (nextVerse) {
        currentVerseId.value = nextVerse.id
      }
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      const prevVerse = flattenedVerses.value[currentIndex.value - 1]
      if (prevVerse) {
        currentVerseId.value = prevVerse.id
      }
    }
  }

  return {
    currentIndex,
    currentVerseId,
    selectedVerse,
    selectVerse,
    next,
    prev,
    verseIndexMap: verseIndexMap,
    flattenedVerses
  }
}