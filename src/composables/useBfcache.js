import { onBeforeUnmount, onMounted } from "vue";

/**
 * Composable to optimize for bfcache (back/forward cache)
 * Handles page freeze/thaw events and cleanup for better navigation performance
 */
/**
 * Composable to optimize for bfcache (back/forward cache)
 * Prevents unload handlers and ensures cleanup during page freeze
 */
export function useBfcache() {
  function handlePageHide() {
    // Page is being frozen for bfcache
    // Pause any background operations before page is cached
    if (window.navigator?.mediaSession) {
      window.navigator.mediaSession.playbackState = "paused";
    }
  }

  function handlePageShow(event) {
    // Page is being restored from bfcache
    if (event.persisted) {
      // Page was restored from bfcache
      // Component state should already be preserved
      console.debug("[bfcache] Page restored from back/forward cache");
    }
  }

  onMounted(() => {
    // Listen for pagehide/pageshow events instead of unload
    // These are bfcache-compatible alternatives
    // Never use beforeunload or unload as they block bfcache
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
  });

  onBeforeUnmount(() => {
    // Clean up event listeners before unmount
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
  });

  return {
    // No public API needed - this composable is for side effects only
  };
}
