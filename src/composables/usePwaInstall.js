import { computed, ref } from "vue";

const deferredPrompt = ref(null);
const isInstalled = ref(false);

function detectInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function detectIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function initPwaInstallPrompt() {
  if (detectInstalled()) {
    isInstalled.value = true;
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt.value = event;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt.value = null;
    isInstalled.value = true;
  });
}

export function usePwaInstall() {
  const isIOS = computed(() => detectIOS());

  console.log(`isIOS :`, isIOS);
  const canPromptInstall = computed(
    () => Boolean(deferredPrompt.value) && !isInstalled.value,
  );
  const showIOSInstructions = computed(() => detectIOS());
  const showInstallUnavailable = computed(
    () => !isInstalled.value && !canPromptInstall.value && !isIOS.value,
  );

  async function promptInstall() {
    if (!deferredPrompt.value) {
      return false;
    }

    await deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;

    if (outcome === "accepted") {
      deferredPrompt.value = null;
      isInstalled.value = true;
      return true;
    }

    return false;
  }

  return {
    isInstalled,
    isIOS,
    canPromptInstall,
    showIOSInstructions,
    showInstallUnavailable,
    promptInstall,
  };
}
