import { onBeforeUnmount, onMounted } from "vue";

/**
 * Composable to optimize for bfcache (back/forward cache)
 * Handles page freeze/thaw events and cleanup for better navigation performance
 */
export function useBfcache() {
  function handlePageHide() {
    // Page is being stored in bfcache
    // Any pausing of audio/timers happens automatically via component unmount
    // This is mainly for logging or state management
  }

  function handlePageShow(event) {
    // Page is being restored from bfcache
    if (event.persisted) {
      // Page was restored from bfcache
      // Component state should already be preserved
    }
  }

  onMounted(() => {
    // Listen for pagehide/pageshow events instead of unload
    // These are bfcache-compatible alternatives
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
  });

  onBeforeUnmount(() => {
    // Clean up event listeners
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("pageshow", handlePageShow);
  });

  return {
    // No public API needed - this composable is for side effects only
  };
}
