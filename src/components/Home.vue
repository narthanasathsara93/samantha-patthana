<template>
  <div class="home-page">
    <div class="hero-content">
      <img class="logo-img" :src="logoImage" />
      <div class="hero-subtitle">
        අනන්ත නය සමන්නාගත චතුවීසති <br />
        අති ගම්භීර
      </div>

      <img class="hero-title" :src="mainTitleImage" />

      <p class="hero-description">
        සමාධිමත් සිතින් ශ්‍රද්ධා පූර්වකව ශ්‍රවණය කරමින් වන්දනා කරමු.
      </p>

      <button class="begin-btn" v-on:click="startChanting()">
        <span class="btn-icon">✦</span>
        අරඹන්න
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import logoImage from "../assets/images/logo.png";
import mainTitleImage from "../assets/images/titletxt.png";

const router = useRouter();

const startChanting = () => {
  router.push({ name: "namaskaraya" });
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
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.home-page {
  min-height: 100dvh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  padding-left: 24px;
  padding-right: 24px;
  background-image: url("../assets/images/main_back.jpg");
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
}

.hero-content {
  font-weight: 600;
  width: 100%;
  max-width: 950px;
  text-align: center;
  animation: fadeIn 0.8s ease;
}

.hero-subtitle {
  font-size: 43px;
  line-height: 1.1;
  color: #4d3124;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.35);
  font-family: "Abhaya Libre", serif !important;
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

.begin-btn {
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 30px;
  border-radius: 999px;
  background: linear-gradient(180deg, #8f2d14 0%, #6f1f0e 100%);
  color: #fff6e8;
  font-size: 29px;
  font-weight: 600;
  font-family: "Abhaya Libre", serif !important;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(111, 31, 14, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease, opacity 0.22s ease;
}

.begin-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 14px 34px rgba(111, 31, 14, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.begin-btn:active {
  transform: scale(0.985);
}

.btn-icon {
  font-size: 18px;
  opacity: 0.92;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo-img {
  width: 60px;
  height: auto;
}

/* ================= MOBILE ================= */
/* Desktop */
@media (min-width: 1025px) {
}

/* Tablet */
@media (max-width: 1024px) {
}

@media (max-width: 768px) {
  .logo-img {
    width: 50px;
    height: auto;
  }

  .home-page {
    padding-top: 64px;
    padding-left: 18px;
    padding-right: 18px;
    align-items: flex-start;
  }

  .hero-subtitle {
    font-weight: 600;
    font-size: 24px;
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

  .begin-btn {
    width: 100%;
    max-width: 320px;
    padding: 16px 28px;
    font-size: 18px;
  }
}
</style>
