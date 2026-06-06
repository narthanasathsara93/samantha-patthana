<template>
  <main class="home-page">
    <button
      class="settings-btn"
      type="button"
      aria-label="Open settings"
      title="Open settings"
      @click="openSettings"
    >
      <span class="gear-btn-icon">
        <img class="gear-icon" :src="getIcon('gear.png')" alt="" />
      </span>
    </button>

    <div class="hero-content">
      <img
        rel="preload"
        as="image"
        class="logo-img"
        :src="logoImage"
        alt="Samantha Patthana logo"
        loading="eager"
        fetchpriority="high"
      />
      <div class="hero-subtitle">
        අනන්ත නය සමන්නාගත චතුවීසති <br />
        අති ගම්භීර
      </div>

      <div class="hero-main-title">සමන්ත පට්ඨාන වන්දනාව</div>

      <p class="hero-description">
        සමාධිමත් සිතින් යුතුව ශ්‍රද්ධා පූර්වකව ශ්‍රවණය කරමින් වන්දනා කරමු.
      </p>

      <div class="hero-actions">
        <button
          class="begin-btn"
          v-on:click="startChanting()"
          aria-label="Start chanting"
        >
          <span class="btn-icon">
            <img class="star-icon" :src="getIcon('reading.png')" alt="" />
          </span>
          <span class="btn-txt">සජ්ඣායනය</span>
        </button>

        <button
          class="practice-btn"
          v-on:click="openPracticeMode()"
          aria-label="Open practice mode"
        >
          <span class="btn-icon">
            <img class="mind-icon" :src="getIcon('mindset2.png')" alt="" />
          </span>
          <span class="btn-txt">පුහුණුව</span>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";
import logoImage from "../assets/images/logo.webp";
import { useGuidance } from "../composables/useGuidance";
import { getAssetUrl } from "../utils/assets";

const router = useRouter();
const { isGuidanceSectionComplete, openGuidance } = useGuidance();

const navigateWithGuidance = (routeLocation, guidanceSection) => {
  if (isGuidanceSectionComplete(guidanceSection)) {
    router.push(routeLocation);
    return;
  }

  openGuidance({
    force: false,
    section: guidanceSection,
    route: routeLocation,
  });
};

const startChanting = () => {
  navigateWithGuidance({ name: "namaskaraya" }, "chanting");
};

const openPracticeMode = () => {
  navigateWithGuidance("/practice", "practice");
};

const openSettings = () => {
  router.push({ name: "Settings" });
};

const getIcon = (img) => {
  return getAssetUrl(`icons/${img}`);
};
</script>

<style scoped>
.home-container::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ===== Container ===== */
.home-container {
  max-width: 1200px;
  height: 100dvh;
  margin: 0 auto;
  padding: 7px;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home-page {
  overflow-x: clip;
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  padding-left: 24px;
  padding-right: 24px;
}

.hero-content {
  cursor: default;
  width: 100%;
  max-width: 950px;
  text-align: center;
}

.hero-main-title {
  position: relative;
  display: inline-block;
  margin-top: 2%;
  margin-bottom: 2%;
  color: #4c1711;
  font-family: "UN Arundathee", serif !important;
  font-size: clamp(2.8rem, 8vw, 7.5rem);
  cursor: arrow;
  z-index: 2;
}

.hero-subtitle {
  font-size: clamp(19px, 2.5vw, 37px);
  line-height: 1.1;
  color: #4d3124;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.35);
  font-family: "UN Ganganee", serif !important;
}

.hero-title {
  display: block;
  width: min(92%, 760px);
  height: auto;
  margin: 0 auto 30px auto;
  object-fit: contain;
  filter: drop-shadow(0 3px 10px rgba(60, 30, 10, 0.08));
}

.hero-description {
  font-size: 27px;
  color: #5e3a2b;
  max-width: 760px;
  margin: 0 auto 42px;
  font-weight: 400;
  font-family: "Abhaya Libre", serif !important;
}

.hero-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.begin-btn,
.practice-btn {
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 1vw, 12px);
  width: clamp(180px, 24vw, 240px);
  min-width: 180px;
  padding: clamp(11px, 1.2vw, 15px) 20px;
  border-radius: 999px;
  background: linear-gradient(180deg, #8f2d14 0%, #6f1f0e 100%);
  color: #ffeaca;
  font-size: clamp(20px, 2vw, 25px);
  font-weight: 600;
  line-height: 1;
  font-family: "Abhaya Libre", serif !important;
  cursor: pointer;
  box-shadow:
    0 10px 30px rgba(111, 31, 14, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
  white-space: nowrap;
}

.begin-btn:hover,
.practice-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 14px 34px rgba(111, 31, 14, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.begin-btn:active,
.practice-btn:active {
  transform: scale(0.985);
}

.btn-icon {
  font-size: 18px;
  opacity: 0.92;
}

.mind-icon,
.star-icon {
  width: 24px;
  height: auto;
}

.settings-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #6f1f0e;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    background 0.25s ease;
}

.settings-btn:hover {
  transform: rotate(45deg);
}

.gear-icon {
  width: 20px;
  height: auto;
}

.logo-img {
  margin-bottom: 1%;
  width: 60px;
  height: auto;
}

.home-page {
  background-image: url("../assets/images/bg-480.webp");
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
}

@media (min-width: 360px) {
  .home-page {
    background-image: url("../assets/images/bg-720.webp");
  }
  .begin-btn,
  .practice-btn {
    margin-bottom: 2%;
  }
}

@media (min-width: 480px) {
  .home-page {
    background-image: url("../assets/images/bg-1080.webp");
  }

  .begin-btn,
  .practice-btn {
    padding: 10px 24px;
    font-size: 20px;
    gap: 8px;
    margin-bottom: 2%;
  }
}

@media (max-width: 870px) {
  .logo-img {
    margin-bottom: 1%;
    width: 50px;
    height: auto;
  }

  .settings-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #6f1f0e;
    cursor: pointer;
    transition:
      transform 0.25s ease,
      background 0.25s ease;
  }

  .settings-btn:hover {
    transform: rotate(45deg);
  }

  .gear-icon {
    width: 20px;
    height: auto;
  }

  .home-page {
    padding-top: 64px;
    padding-left: 18px;
    padding-right: 18px;
    align-items: flex-start;
    background-attachment: scroll;
    background-image: url("../assets/images/bg-1600.webp");
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .begin-btn,
  .practice-btn {
    width: min(100%, 240px);
    font-size: 20px;
  }

  .hero-subtitle {
    font-weight: 600;
    line-height: 1.1;
    margin-bottom: 10px;
  }

  .hero-title {
    width: min(96%, 520px);
    margin-bottom: 32px;
  }

  .hero-description {
    font-weight: 600;
    font-size: 18px;
    margin-bottom: 34px;
  }
}

/* Tablets */
@media (min-width: 769px) and (max-width: 1024px) {
  .begin-btn,
  .practice-btn {
    font-size: 20px;
    margin-bottom: 2%;
  }
}

@media (min-width: 1024px) {
  .home-page {
    background-image: url("../assets/images/bg-1493.webp");
  }
}

/* Large desktops */
@media (min-width: 1440px) {
  .begin-btn,
  .practice-btn {
    font-size: 25px;
    padding: 14px 42px;
  }
}
</style>
