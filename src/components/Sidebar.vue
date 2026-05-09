<template>
  <aside :class="['sidebar', { open: isSidebarOpen }]">
    <div class="sidebar-header" v-on:click="goToHome()">
      <img class="logo-img" :src="getImage(`images/logo.png`)" />
      <div class="header-text">සමන්ත පට්ඨාන වන්දනා</div>
    </div>
    <ul>
      <li
        v-for="(verse, index) in verses"
        :key="verse.id"
        :class="{
          active: isActiveVerse(verse),
        }"
      >
        <button
          class="verse-row"
          type="button"
          @click="handleVerseClick(verse)"
        >
          <span class="number">{{ index + 1 }}. </span>
          <span class="verse-title">
            {{ verse.title }}

            <span v-if="isBookmarked(verse.id)" class="bookmark-indicator">
              <img
                class="bookmark-indicator-img"
                :src="getImage(`icons/bookmarked.png`)"
              />
            </span>
          </span>
        </button>
      </li>
    </ul>

    <div class="sidebar-contact" aria-label="Contact links">
      <a
        class="contact-link"
        :href="facebookUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        title="ෆේස්බුක් ගිණුම"
      >
        <svg
          class="contact-icon"
          viewBox="0 2 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M14 8.5h2V5.2c-.35-.05-1.55-.15-2.95-.15-2.9 0-4.9 1.82-4.9 5.17v2.9H5v3.7h3.15V24h3.86v-7.18h3.02l.48-3.7h-3.5v-2.53c0-1.07.29-2.09 1.99-2.09Z"
          />
        </svg>
      </a>
      <a
        class="contact-link"
        :href="emailHref"
        aria-label="Email"
        title="විද්‍යුත් තැපෑල"
        @click="handleEmailClick"
      >
        <svg
          class="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M3.75 5.5h16.5c.96 0 1.75.79 1.75 1.75v9.5c0 .96-.79 1.75-1.75 1.75H3.75A1.75 1.75 0 0 1 2 16.75v-9.5C2 6.29 2.79 5.5 3.75 5.5Zm.7 2 7.55 5.18L19.55 7.5H4.45Zm15.8 9v-7l-7.55 5.18a1.25 1.25 0 0 1-1.4 0L3.75 9.5v7h16.5Z"
          />
        </svg>
      </a>
      <a
        class="contact-link"
        :href="googleFormUrl"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Google Form"
        title="ඔබේ ප්‍රතිචාර"
      >
        <svg
          class="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M6.5 2.5h8.15L20.5 8.35V20a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20V4a1.5 1.5 0 0 1 1.5-1.5Zm7.45 1.9V9.1h4.7L13.95 4.4ZM8.25 11.75h7.5v-1.5h-7.5v1.5Zm0 3.25h7.5v-1.5h-7.5V15Zm0 3.25h5.5v-1.5h-5.5v1.5Z"
          />
        </svg>
      </a>
      <button
        class="contact-link"
        type="button"
        aria-label="Resources"
        title="මූලාශ්‍ර වෙත"
        @click="handleResourcesClick"
      >
        <svg
          class="contact-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 2v12h12V6H6Zm2 2h8v2H8V8Zm0 4h8v2H8v-2Z"
          />
        </svg>
      </button>
      <span v-if="isEmailCopied" class="contact-feedback" role="status">
        විද්‍යුත් තැපෑල් ලිපිනය කොපි කරගන්නා ලදී.
      </span>
    </div>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { verses } from "../data/verses";
import { getAssetUrl } from "../utils/assets";
import { isMobileContactDevice } from "../utils/util";

const props = defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: [String, Number],
    default: null,
  },
  verseIndexMap: {
    type: Object,
    required: true,
  },
  isBookmarked: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["verse-selected", "show-resources", "close-sidebar"]);
const router = useRouter();
const facebookUrl = "https://www.facebook.com/profile.php?id=100090170766015";
const emailAddress = "egodahayanno123@gmail.com";
const emailHref = `mailto:${emailAddress}`;
const googleFormUrl = "https://forms.gle/5kxTgx8GNL9s9ZLH8";
const isEmailCopied = ref(false);
let emailCopyTimer;

const isActiveVerse = (verse) => {
  return verse.id === props.selectedId;
};

const handleVerseClick = (verse) => {
  router.push({
    name: verse.englishName,
  });
  emit("close-sidebar");
};

const showEmailCopiedFeedback = () => {
  isEmailCopied.value = true;
  clearTimeout(emailCopyTimer);
  emailCopyTimer = setTimeout(() => {
    isEmailCopied.value = false;
  }, 1800);
};

const handleEmailClick = (event) => {
  if (isMobileContactDevice()) {
    return;
  }

  event.preventDefault();

  if (!navigator.clipboard?.writeText) {
    return;
  }

  navigator.clipboard.writeText(emailAddress).then(showEmailCopiedFeedback);
};

const handleResourcesClick = () => {
  emit("show-resources");
  emit("close-sidebar");
};

const getImage = (img) => {
  return getAssetUrl(img);
};

onBeforeUnmount(() => {
  clearTimeout(emailCopyTimer);
});

const goToHome = () => {
  router.push({ name: "Home" });
  emit("close-sidebar");
};
</script>

<style scoped>
.logo-img {
  width: 50px;
  height: auto;
}

.scroll-icon {
  width: 16px;
  height: 16px;
}
/* ===== Sidebar ===== */
.sidebar-list {
  padding-left: 14%;
}
.sidebar {
  width: 300px;
  padding: 10px 0;
  transition: transform 0.1s ease;
  background-image: url("../assets/images/side_menu_background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 12px;
  border: none;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: none;
  overflow: hidden;
}

.sidebar-header {
  flex-direction: column;
  justify-content: center;
  text-align: center;
  gap: 6px;
  display: flex;
  align-items: center;
  padding: 16px;
  font-weight: 900;
  font-size: 18px;
  border-bottom: 2px solid #dfc59c73;
  transition: all 0.2s ease;
}

.sidebar-header:hover {
  cursor: pointer;
  transition: all 0.2s ease;
  transform: scale(1.04);
}

/* List */
.sidebar ul {
  margin-left: -4%;
  list-style: none;
  padding: 0 28px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  flex: 1;
}

.sidebar ul::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.sidebar > ul > li {
  padding: 0;
  margin: 0px 2px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 15px;
  cursor: pointer;
}

.sidebar > ul > li.active > .verse-row > .verse-title {
  color: #c63100;
}

.sidebar > ul > li.bookmarked > .verse-row {
  background: #fff8e1;
}

.sidebar > ul > li.bookmarked > .verse-row:hover {
  background: #fff3c4;
}

.verse-row {
  width: 100%;
  padding: 8px 0px;
  cursor: pointer;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 900;
  font-family: inherit;
  color: #666363;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/*
.sidebar > ul > li:hover .verse-row {
  background: #8d8a8a31;
  border-bottom-right-radius: 24px !important;
  border-top-right-radius: 24px !important;
  transform: scale(1.013);
  font-weight: 900;
  color: #c63100;
}
  */

.sidebar > ul > li:hover .verse-row {
  background: rgba(141, 138, 138, 0.2);
  border-radius: 20px;
  transform: scale(1.013);
  color: #330505;
}

.verse-title {
  flex: 1;
  font-size: 14px;
  margin-left: 5px;
}

.number {
  width: 24px;
  text-align: right;
  color: #444;
  flex-shrink: 0;
}

.bookmark-indicator-img {
  width: 14px;
  height: 14px;
}

.sidebar-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 14px 18px 12px;
  border-top: 2px solid #dfc59c73;
  flex-shrink: 0;
  position: relative;
}

.contact-link {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 36%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4c1711;
  background: rgba(255, 248, 229, 0.58);
  box-shadow: 0 4px 12px rgba(59, 9, 6, 0.1);
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.contact-link:hover,
.contact-link:focus-visible {
  color: #c63100;
  background: rgba(255, 255, 255, 0.78);
  transform: scale(1.08);
  outline: none;
}

.sidebar-contact button.contact-link {
  cursor: pointer;
}

.contact-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.contact-feedback {
  position: absolute;
  left: 50%;
  bottom: 54px;
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #4c1711;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(59, 9, 6, 0.12);
  transform: translateX(-50%);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 80%;
    max-width: 280px;
    height: 100dvh;
    z-index: 10;
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar ul {
    margin-top: 5%;
    margin-bottom: 4%;
    padding: 0 28px;
  }

  .sidebar-contact {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
</style>