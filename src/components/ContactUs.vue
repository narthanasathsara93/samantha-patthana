<template>
  <div class="contact-page">
    <section class="contact-card">
      <h1 class="contact-title">ඔබගේ වටිනා අදහස් සහ යෝජනා සඳහා</h1>

      <div class="contact-list">
        <a
          class="contact-item"
          :href="googleFormUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Google Form"
        >
          <div class="contact-icon-wrap">
            <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6.5 2.5h8.15L20.5 8.35V20a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20V4a1.5 1.5 0 0 1 1.5-1.5Zm7.45 1.9V9.1h4.7L13.95 4.4ZM8.25 11.75h7.5v-1.5h-7.5v1.5Zm0 3.25h7.5v-1.5h-7.5V15Zm0 3.25h5.5v-1.5h-5.5v1.5Z"
              />
            </svg>
          </div>

          <div class="contact-text">ගූගල් ෆෝරමය (නිර්නාමික)</div>
        </a>

        <a
          class="contact-item"
          :href="emailHref"
          @click="handleEmailClick"
          aria-label="Email"
        >
          <div class="contact-icon-wrap">
            <svg class="contact-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3.75 5.5h16.5c.96 0 1.75.79 1.75 1.75v9.5c0 .96-.79 1.75-1.75 1.75H3.75A1.75 1.75 0 0 1 2 16.75v-9.5C2 6.29 2.79 5.5 3.75 5.5Zm.7 2 7.55 5.18L19.55 7.5H4.45Zm15.8 9v-7l-7.55 5.18a1.25 1.25 0 0 1-1.4 0L3.75 9.5v7h16.5Z"
              />
            </svg>
          </div>

          <div class="contact-text">
            අපගේ විද්‍යුත් තැපෑල (ඊමේල්)
            <span v-if="isEmailCopied" class="contact-feedback" role="status">
              ලිපිනය කොපි කරගන්නා ලදී.
              <img
                class="icon-copied"
                :src="getImage(`icons/copied.png`)"
                alt=""
              />
            </span>
          </div>
        </a>

        <a
          class="contact-item"
          :href="facebookUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <div class="contact-icon-wrap">
            <svg class="contact-icon" viewBox="0 2 24 24" aria-hidden="true">
              <path
                d="M14 8.5h2V5.2c-.35-.05-1.55-.15-2.95-.15-2.9 0-4.9 1.82-4.9 5.17v2.9H5v3.7h3.15V24h3.86v-7.18h3.02l.48-3.7h-3.5v-2.53c0-1.07.29-2.09 1.99-2.09Z"
              />
            </svg>
          </div>

          <div class="contact-text">එගොඩහ යන්නෝ - ෆේස්බුක් ගිණුම</div>
        </a>
      </div>

      <button
        class="back-btn"
        type="button"
        aria-label="Go back"
        @click="goBack"
      >
        පෙර පිටුව වෙත
      </button>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { getAssetUrl } from "../utils/assets";

const facebookUrl = "https://www.facebook.com/profile.php?id=100090170766015";
const emailAddress = "egodahayanno123@gmail.com";
const emailHref = `mailto:${emailAddress}`;
const googleFormUrl = "https://forms.gle/5kxTgx8GNL9s9ZLH8";

const isEmailCopied = ref(false);
let emailCopyTimer;

const router = useRouter();

const showEmailCopiedFeedback = () => {
  isEmailCopied.value = true;
  clearTimeout(emailCopyTimer);
  emailCopyTimer = setTimeout(() => {
    isEmailCopied.value = false;
  }, 1800);
};

const handleEmailClick = async (event) => {
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isMobile) {
    return;
  }

  event.preventDefault();
  try {
    await navigator.clipboard.writeText(emailAddress);
    showEmailCopiedFeedback();
  } catch (error) {
    console.error("Copy failed:", error);
  }
};

onBeforeUnmount(() => {
  clearTimeout(emailCopyTimer);
});

const getImage = (img) => {
  return getAssetUrl(img);
};

function goBack() {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push({ name: "Home" });
}
</script>

<style scoped>
.contact-page {
  min-height: 100dvh;
  padding: clamp(14px, 3vh, 42px) clamp(14px, 4vw, 24px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background-image: url("../assets/images/bg-480.webp");
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
}

.contact-card {
  width: min(760px, 92vw);
  padding: clamp(22px, 4vw, 34px);
  border-radius: 22px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);
  text-align: center;
  font-family: "Abhaya Libre", serif;
  animation: fadeIn 0.45s ease;
}

.contact-title {
  margin: 0 0 26px;
  color: #4d3124;
  font-size: clamp(26px, 4vw, 40px);
  line-height: 1.3;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.contact-feedback {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 43px;
  background: rgb(59 40 38 / 8%);
  color: #9d5d56;
  font-size: 15px;
  font-style: italic;
  font-weight: 700;
  white-space: nowrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 18px;
  border-radius: 18px;
  background: #fffaf1c7;
  box-shadow: 0 8px 26px rgba(59, 9, 6, 0.1);
  color: #3b0906;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.contact-item:hover {
  transform: translateX(4px);
  background: rgba(255, 245, 224, 0.95);
  color: #b53300;
}

.contact-icon-wrap {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(233 213 180);
}

.contact-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.icon-copied {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.contact-text {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 12px;

  text-align: left;

  font-size: clamp(17px, 2.1vw, 21px);
  line-height: 1.45;
  font-weight: 500;
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
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.back-btn:hover {
  background: #ffeccf;
  font-weight: 600;
  transform: translateY(-3px);
  border: 1px solid #7a2410c2;
}

.back-btn:active {
  transform: scale(0.985);
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
  .contact-page {
    background-image: url("../assets/images/bg-1080.webp");
  }
}

@media (min-width: 1024px) {
  .contact-page {
    background-image: url("../assets/images/bg-1493.webp");
  }
}

@media (max-width: 640px) {
  .contact-page {
    border-radius: 20px;
  }

  .contact-card {
    padding: 22px 16px;
  }

  .contact-item {
    padding: 16px 14px;
  }

  .contact-icon-wrap {
    width: 40px;
    height: 40px;
  }

  .contact-icon {
    width: 18px;
    height: 18px;
  }

  .contact-text {
    font-size: 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .contact-item:hover {
    transform: none;
  }

  .contact-feedback {
    margin-left: 0;
  }
}
</style>
