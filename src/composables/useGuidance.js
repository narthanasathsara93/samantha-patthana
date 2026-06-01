import { computed, ref } from "vue";

const STORAGE_KEY = "app_guidance_completed_sections";
const LEGACY_STORAGE_KEY = "app_guidance_completed";
const GUIDANCE_SECTIONS = ["chanting", "practice"];

const isOpen = ref(false);
const isReady = ref(false);
const completedSections = ref([]);
const showContinueLabel = ref(true);
const activeSection = ref("all");

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function readCompletionState() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((section) => GUIDANCE_SECTIONS.includes(section));
  } catch {
    return [];
  }
}

function writeCompletionState(sections) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  } catch {
    // Private browsing or storage quota issues should not break startup.
  }
}

export function useGuidance() {
  const hasCompleted = computed(() =>
    GUIDANCE_SECTIONS.every((section) =>
      completedSections.value.includes(section),
    ),
  );

  const shouldShowOnboarding = computed(
    () => isReady.value && !hasCompleted.value,
  );

  const completedGuidanceSections = computed(() => completedSections.value);

  function isGuidanceSectionComplete(section = "all") {
    if (section === "all") {
      return hasCompleted.value;
    }

    return completedSections.value.includes(section);
  }

  function initializeGuidance({ autoOpen = true } = {}) {
    completedSections.value = readCompletionState();
    isReady.value = true;

    if (autoOpen && !hasCompleted.value && typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        isOpen.value = true;
      });
    }
  }

  function openGuidance({
    force = true,
    continueLabel = true,
    section = "all",
  } = {}) {
    if (!isReady.value) {
      completedSections.value = readCompletionState();
      isReady.value = true;
    }

    showContinueLabel.value = continueLabel;
    activeSection.value = section;

    if (force || !isGuidanceSectionComplete(section)) {
      isOpen.value = true;
    }
  }

  function closeGuidance({ complete = true } = {}) {
    isOpen.value = false;

    if (complete) {
      const sectionsToComplete =
        activeSection.value === "all" ? GUIDANCE_SECTIONS : [activeSection.value];

      completedSections.value = Array.from(
        new Set([...completedSections.value, ...sectionsToComplete]),
      ).filter((section) => GUIDANCE_SECTIONS.includes(section));

      writeCompletionState(completedSections.value);
    }
  }

  function resetGuidance() {
    completedSections.value = [];
    isReady.value = true;

    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
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
    completedGuidanceSections,
    showContinueLabel,
    activeGuidanceSection: activeSection,
    shouldShowOnboarding,
    isGuidanceSectionComplete,
    initializeGuidance,
    openGuidance,
    closeGuidance,
    resetGuidance,
  };
}
