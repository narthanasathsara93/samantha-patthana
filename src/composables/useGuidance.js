import { computed, ref } from "vue";

const STORAGE_KEY = "app_guidance_completed";

const isOpen = ref(false);
const isReady = ref(false);
const hasCompleted = ref(false);
const showContinueLabel = ref(true);

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readCompletionState() {
  if (!canUseStorage()) {
    return false;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeCompletionState(value) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Private browsing or storage quota issues should not break startup.
  }
}

export function useGuidance() {
  const shouldShowOnboarding = computed(
    () => isReady.value && !hasCompleted.value,
  );

  function initializeGuidance({ autoOpen = true } = {}) {
    hasCompleted.value = readCompletionState();
    isReady.value = true;

    if (autoOpen && !hasCompleted.value && typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        isOpen.value = true;
      });
    }
  }

  function openGuidance({ force = true, continueLabel = true } = {}) {
    if (!isReady.value) {
      hasCompleted.value = readCompletionState();
      isReady.value = true;
    }

    showContinueLabel.value = continueLabel;

    if (force || !hasCompleted.value) {
      isOpen.value = true;
    }
  }

  function closeGuidance({ complete = true } = {}) {
    isOpen.value = false;

    if (complete) {
      hasCompleted.value = true;
      writeCompletionState(true);
    }
  }

  function resetGuidance() {
    hasCompleted.value = false;
    isReady.value = true;

    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore unavailable storage; reactive state still resets.
      }
    }
  }

  return {
    storageKey: STORAGE_KEY,
    isGuidanceOpen: isOpen,
    isGuidanceReady: isReady,
    hasCompletedGuidance: hasCompleted,
    showContinueLabel,
    shouldShowOnboarding,
    initializeGuidance,
    openGuidance,
    closeGuidance,
    resetGuidance,
  };
}
