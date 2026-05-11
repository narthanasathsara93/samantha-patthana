import { ref, computed } from "vue";

export function useBookmarks() {
  const bookmarks = ref(new Set());

  // Load bookmarks from localStorage on mount
  const loadBookmarks = () => {
    const stored = localStorage.getItem("verse-bookmarks");
    if (stored) {
      bookmarks.value = new Set(JSON.parse(stored));
    }
  };

  // Save bookmarks to localStorage
  const saveBookmarks = () => {
    localStorage.setItem(
      "verse-bookmarks",
      JSON.stringify([...bookmarks.value]),
    );
  };

  // Toggle bookmark for a verse
  const toggleBookmark = (verseId) => {
    if (bookmarks.value.has(verseId)) {
      bookmarks.value.delete(verseId);
    } else {
      bookmarks.value.add(verseId);
    }
    saveBookmarks();
  };

  // Check if a verse is bookmarked
  const isBookmarked = (verseId) => {
    return bookmarks.value.has(verseId);
  };

  // Get all bookmarked verses
  const bookmarkedVerses = computed(() => [...bookmarks.value]);

  return {
    bookmarks,
    loadBookmarks,
    toggleBookmark,
    isBookmarked,
    bookmarkedVerses: bookmarkedVerses,
  };
}
