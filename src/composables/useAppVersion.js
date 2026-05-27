import { computed, ref } from "vue";
import { registerSW } from "virtual:pwa-register";

const VERSION_STORAGE_KEY = "app_version";
const HARD_RESET_DONE_SESSION_KEY = "app_hard_reset_done_version";
const HARD_RESET_FAILED_SESSION_KEY = "app_hard_reset_failed_version";
const HARD_RESET_LOCK_SESSION_KEY = "app_hard_reset_in_progress";
const HARD_RESET_LOCK_TTL_MS = 60000;

const isCheckingVersion = ref(false);
const isUpdateAvailable = ref(false);
const isRefreshing = ref(false);
const isHardResetInProgress = ref(false);
const lastError = ref(null);
const remoteVersion = ref(null);
const shouldForceReset = ref(false);

let swUpdateFn = null;
let swRegistered = false;

function hasWindowApi() {
  return typeof window !== "undefined";
}

function hasNavigatorApi() {
  return typeof navigator !== "undefined";
}

function safeStorageGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch (error) {
    console.warn("[app-version] Failed to persist storage key:", key, error);
  }
}

function safeStorageClear(storage, name) {
  try {
    storage.clear();
  } catch (error) {
    console.warn(`[app-version] Failed to clear ${name}:`, error);
  }
}

function safeReloadToOrigin() {
  if (!hasWindowApi()) {
    return;
  }

  window.location.href = window.location.origin;
}

function registerServiceWorkerUpdateFlow() {
  if (!hasWindowApi() || swRegistered) {
    return;
  }

  swRegistered = true;

  swUpdateFn = registerSW({
    immediate: true,

    onNeedRefresh() {
      isUpdateAvailable.value = true;
    },

    onOfflineReady() {
      console.info("[app-version] App ready for offline usage.");
    },

    onRegisterError(error) {
      console.error("[app-version] SW registration error:", error);
    },
  });
}

async function fetchVersionWithTimeout(timeoutMs = 7000) {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Version request failed (${response.status}).`);
    }

    const payload = await response.json();

    if (!payload.version || typeof payload.version !== "string") {
      throw new Error("Invalid version.json payload.");
    }

    return {
      version: payload.version,
      forceReset: Boolean(payload.forceReset),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function clearCacheStorage() {
  if (!hasWindowApi() || !("caches" in window)) {
    return;
  }

  try {
    const cacheKeys = await caches.keys();

    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  } catch (error) {
    console.warn("[app-version] CacheStorage cleanup failed:", error);
    throw error;
  }
}

async function clearIndexedDb() {
  if (!hasWindowApi() || !("indexedDB" in window)) {
    return;
  }

  if (typeof indexedDB.databases !== "function") {
    console.info(
      "[app-version] indexedDB.databases() unsupported; skipping IDB cleanup.",
    );

    return;
  }

  try {
    const databases = await indexedDB.databases();

    const names = databases.map((db) => db.name).filter(Boolean);

    await Promise.all(
      names.map(
        (name) =>
          new Promise((resolve) => {
            const request = indexedDB.deleteDatabase(name);

            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
          }),
      ),
    );
  } catch (error) {
    console.warn("[app-version] IndexedDB cleanup failed:", error);
    throw error;
  }
}

async function unregisterAllServiceWorkers() {
  if (!hasNavigatorApi() || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  } catch (error) {
    console.warn("[app-version] Service worker unregister failed:", error);

    throw error;
  }
}

function isHardResetLockedForVersion(version) {
  if (!hasWindowApi()) {
    return false;
  }

  const lockPayload = safeStorageGet(
    sessionStorage,
    HARD_RESET_LOCK_SESSION_KEY,
  );

  if (!lockPayload) {
    return false;
  }

  try {
    const parsed = JSON.parse(lockPayload);

    const isSameVersion = parsed.version === version;

    const isFresh = Date.now() - parsed.at < HARD_RESET_LOCK_TTL_MS;

    return isSameVersion && isFresh;
  } catch {
    return false;
  }
}

async function performHardReset(nextVersion) {
  if (!hasWindowApi()) {
    return;
  }

  if (isHardResetLockedForVersion(nextVersion)) {
    return;
  }

  isHardResetInProgress.value = true;
  isRefreshing.value = true;
  lastError.value = null;

  safeStorageSet(
    sessionStorage,
    HARD_RESET_LOCK_SESSION_KEY,
    JSON.stringify({
      version: nextVersion,
      at: Date.now(),
    }),
  );

  try {
    safeStorageClear(localStorage, "localStorage");

    safeStorageClear(sessionStorage, "sessionStorage");

    await clearCacheStorage();

    await clearIndexedDb();

    await unregisterAllServiceWorkers();

    safeStorageSet(localStorage, VERSION_STORAGE_KEY, nextVersion);

    safeStorageSet(sessionStorage, HARD_RESET_DONE_SESSION_KEY, nextVersion);

    safeReloadToOrigin();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown hard reset failure.";

    lastError.value = message;

    safeStorageSet(sessionStorage, HARD_RESET_FAILED_SESSION_KEY, nextVersion);

    console.error("[app-version] Hard reset aborted safely:", error);
  } finally {
    isHardResetInProgress.value = false;
    isRefreshing.value = false;
  }
}

async function applySoftUpdate() {
  if (!hasWindowApi()) {
    return;
  }

  isRefreshing.value = true;
  lastError.value = null;

  try {
    if (swUpdateFn) {
      await swUpdateFn(true);
      return;
    }

    safeReloadToOrigin();
  } catch (error) {
    console.warn("[app-version] Soft update fallback reload:", error);

    safeReloadToOrigin();
  }
}

async function checkVersion() {
  if (!hasWindowApi()) {
    return;
  }

  registerServiceWorkerUpdateFlow();

  isCheckingVersion.value = true;
  lastError.value = null;

  try {
    const latest = await fetchVersionWithTimeout();

    remoteVersion.value = latest.version;

    shouldForceReset.value = latest.forceReset;

    const localVersion = safeStorageGet(localStorage, VERSION_STORAGE_KEY);

    const hardResetDoneVersion = safeStorageGet(
      sessionStorage,
      HARD_RESET_DONE_SESSION_KEY,
    );

    const hardResetFailedVersion = safeStorageGet(
      sessionStorage,
      HARD_RESET_FAILED_SESSION_KEY,
    );

    if (!localVersion) {
      safeStorageSet(localStorage, VERSION_STORAGE_KEY, latest.version);

      return;
    }

    if (localVersion === latest.version) {
      return;
    }

    if (!latest.forceReset) {
      isUpdateAvailable.value = true;
      return;
    }

    if (hardResetDoneVersion === latest.version) {
      safeStorageSet(localStorage, VERSION_STORAGE_KEY, latest.version);

      return;
    }

    if (hardResetFailedVersion === latest.version) {
      console.warn(
        "[app-version] Hard reset previously failed this session; skipping repeat attempt.",
      );

      isUpdateAvailable.value = true;

      return;
    }

    await performHardReset(latest.version);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Version check failed.";

    lastError.value = message;

    console.warn(
      "[app-version] Version check failed; continuing app startup.",
      error,
    );
  } finally {
    isCheckingVersion.value = false;
  }
}

export function useAppVersion() {
  return {
    isCheckingVersion: computed(() => isCheckingVersion.value),

    isUpdateAvailable: computed(() => isUpdateAvailable.value),

    isRefreshing: computed(() => isRefreshing.value),

    isHardResetInProgress: computed(() => isHardResetInProgress.value),

    remoteVersion: computed(() => remoteVersion.value),

    shouldForceReset: computed(() => shouldForceReset.value),

    lastError: computed(() => lastError.value),

    checkVersion,

    applySoftUpdate,
  };
}
