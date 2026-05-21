<template>
  <div class="settings-page">
    <section class="settings-card">
      <h1 class="settings-title">සැකසුම්</h1>

      <div class="settings-block">
        <h2 class="block-title">දුරකථනයට ඉන්ස්ටෝල් කිරීම</h2>

        <p class="block-description">
          PWA (Progressive Web App) එකක් ලෙස මෙම වෙබ් අඩවිය ඔබගේ දුරකථනයේ සාමාන්‍ය
          වෙනත් ඇප් එකක් මෙන් ඉන්ස්ටෝල් කර භාවිතා කළ හැක.
          <br />
          <br />
          එවිට බ්‍රවුසරය විවෘත නොකර, ඉතා පහසුවෙන් සෘජුවම පිවිසිය හැක.
        </p>

        <button
          v-if="!showIOSInstructions && canPromptInstall"
          class="install-btn"
          type="button"
          :disabled="isInstalling"
          @click="handleInstall"
        >
          {{ isInstalling ? "ඉන්ස්ටෝල් කරමින්..." : "ඉන්ස්ටෝල් කරන්න" }}
        </button>

        <span class="installed-txt">දැනටමත් ඉන්ස්ටෝල් කර ඇත.</span>

        <div v-if="showIOSInstructions" class="ios-instructions">
          <p class="status-message">
            iPhone / iPad හි Safari මගින් ස්ථාපනය කිරීමට:
          </p>

          <ol>
            <li>පහළ තිරයේ <strong>(Sharing)</strong> බොත්තම ටච් කරන්න.</li>

            <li><strong>(Add to Home Screen)</strong> තෝරන්න.</li>

            <li>එක් කිරීම තහවුරු කරන්න.</li>
          </ol>
        </div>
      </div>

      <button class="back-btn" type="button" @click="goHome">
        මුල් පිටුව වෙත
      </button>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { usePwaInstall } from "@/composables/usePwaInstall";

const router = useRouter();

const isInstalling = ref(false);

const { canPromptInstall, showIOSInstructions, promptInstall } =
  usePwaInstall();

async function handleInstall() {
  if (isInstalling.value) {
    return;
  }

  if (canPromptInstall.value) {
    isInstalling.value = true;

    try {
      await promptInstall();
    } finally {
      isInstalling.value = false;
    }

    return;
  }

  if (showIOSInstructions.value) {
    alert("Safari බ්‍රවුසරයේ Share → Add to Home Screen තෝරන්න.");
    return;
  }

  alert("බ්‍රවුසර මෙනුවෙන් “Install app” හෝ “Add to Home Screen” තෝරන්න.");
}

function goHome() {
  router.push({ name: "Home" });
}
</script>

<style scoped>
.settings-page {
  box-sizing: border-box;
  min-height: 100dvh;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding: clamp(12px, 3vh, 48px) clamp(14px, 4vw, 24px);

  background-image: url("../assets/images/bg-480.webp");
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
}

.settings-card {
  width: min(760px, 92vw);
  box-sizing: border-box;
  flex-shrink: 0;
  margin-block: auto;

  border-radius: 18px;
  padding: 32px 28px;

  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);

  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);

  text-align: center;
  font-family: "Abhaya Libre", serif;

  animation: fadeIn 0.5s ease;
}

.settings-title {
  margin: 0 0 24px;

  font-size: clamp(30px, 4vw, 40px);
  color: #4d3124;
}

.settings-block {
  margin-bottom: 28px;
  padding: 20px 18px;

  border-radius: 16px;

  background: rgba(255, 247, 233, 0.72);
  border: 1px solid rgba(122, 36, 16, 0.14);

  text-align: left;
}

.block-title {
  margin: 0 0 12px;

  font-size: clamp(22px, 3vw, 26px);
  color: #5e3929;

  text-align: center;
}

.block-description {
  margin: 0 0 20px;

  font-size: clamp(17px, 2.2vw, 20px);
  line-height: 1.5;
  color: #6a3f2e;

  text-align: justify;
}

.status-message {
  margin: 18px 0 0;

  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.5;
  color: #6a3f2e;
}

.installed-txt {
  border: 1px solid !important;
  display: block;
  width: min(100%, 320px);
  margin: 0 auto;
  padding: 5px 5px;
  text-align: center;
  border: none;
  border-radius: 21px;
  background: linear-gradient(180deg, #f6e0ba73 0%, #f6e0ba73 100%);
  color: #5c3826;
  font-family: inherit;
  font-size: clamp(19px, 2.4vw, 22px);
  font-weight: 800;
  cursor: pointer;
  /* box-shadow: 0 10px 28px rgba(111, 31, 14, 0.28); */
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.install-btn {
  display: block;

  width: min(100%, 320px);

  margin: 0 auto;

  padding: 14px 24px;

  border: none;
  border-radius: 999px;

  background: linear-gradient(180deg, #8f2d14 0%, #6f1f0e 100%);
  color: #ffeaca;

  font-family: inherit;
  font-size: clamp(19px, 2.4vw, 22px);
  font-weight: 600;

  cursor: pointer;

  box-shadow: 0 10px 28px rgba(111, 31, 14, 0.28);

  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.install-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.install-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.install-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.ios-instructions ol {
  margin: 10px 0 0;
  padding-left: 22px;

  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.5;

  color: #6a3f2e;
}

.ios-instructions li + li {
  margin-top: 8px;
}

.back-btn {
  border: 1px solid rgba(122, 36, 16, 0.28);

  background: rgba(255, 247, 233, 0.9);
  color: #6f1f0e;

  border-radius: 999px;

  padding: 10px 22px;

  font-family: inherit;
  font-size: 18px;

  cursor: pointer;
}

.back-btn:hover {
  background: #fff8eb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 480px) {
  .settings-page {
    background-image: url("../assets/images/bg-1080.webp");
  }
}

@media (min-width: 1024px) {
  .settings-page {
    background-image: url("../assets/images/bg-1493.webp");
  }
}

@media (max-width: 520px), (max-height: 700px) {
  .settings-card {
    padding: 22px 16px;
  }

  .settings-title {
    margin-bottom: 16px;
    font-size: clamp(26px, 7vw, 32px);
  }

  .settings-block {
    margin-bottom: 20px;
    padding: 16px 14px;
  }

  .block-description,
  .status-message,
  .ios-instructions ol {
    font-size: clamp(15px, 3.8vw, 17px);
  }
}
</style>
