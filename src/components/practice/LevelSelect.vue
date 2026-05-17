<template>
  <section class="practice-card">
    <h1 class="title">මතක පරීක්ෂා පුහුණුව</h1>
    <p class="subtitle">
      ආරම්භ කිරීම සඳහා කැමති මට්ටමක් තෝරාගන්න. <br />
      පුහුණුව අතරතුර "↺" මගින් මුල සිට නව ඇරඹුමක් කල හැකි අතර<br />
      "👁" මගින් පිළිතුර දැකිය හැක.
    </p>

    <div class="level-buttons">
      <button class="level-btn easy" @click="$emit('select-level', 'ආධුනික')">
        <span class="btn-icon">
          <img class="level-btn-icon" :src="getIcon('level1.png')" alt="✦" />
        </span>
        ආධුනික
      </button>
      <button
        class="level-btn medium"
        @click="$emit('select-level', 'මධ්‍යස්ථ')"
      >
        <span class="btn-icon">
          <img class="level-btn-icon" :src="getIcon('level2.png')" alt="✦" />
        </span>
        මධ්‍යස්ථ
      </button>
      <button class="level-btn hard" @click="$emit('select-level', 'ප්‍රවීණ')">
        <span class="btn-icon">
          <img class="level-btn-icon" :src="getIcon('level3.png')" alt="✦" />
        </span>
        ප්‍රවීණ
      </button>
    </div>

    <button class="back-btn" @click="$emit('go-home')">මුල් පිටුව වෙත</button>
  </section>
</template>

<script setup>
import { getAssetUrl } from "../../utils/assets";

defineEmits(["select-level", "go-home"]);

const getIcon = (img) => {
  return getAssetUrl(`icons/${img}`);
};
</script>

<style scoped>
.practice-card {
  font-family: "Abhaya Libre", serif !important;
  width: min(760px, 92vw);
  border-radius: 18px;
  padding: 32px 28px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  color: #4d3124;
}

.subtitle {
  margin: 12px 0 26px;
  font-size: clamp(17px, 2vw, 22px);
  font-weight: 600;
  color: #6a3f2e;
}

.level-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.easy,
.medium,
.hard {
  border-radius: 25px;
  background: linear-gradient(180deg, #7a3310 0%, rgb(107, 31, 14) 100%);
  color: #ffe2b6;
  font-size: clamp(20px, 2.2vw, 29px);
  cursor: pointer;

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.level-btn {
  font-family: "Abhaya Libre", serif !important;
  border: none;
  border-radius: 12px;
  min-height: 62px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.level-btn:hover {
  transform: translateY(-3px);
  box-shadow:
    0 10px 30px rgba(111, 31, 14, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.level-btn:active {
  transform: translateY(0) scale(0.985);
  box-shadow:
    0 6px 18px rgba(111, 31, 14, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.level-btn-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  display: block;
}

.back-btn {
  margin-top: 20px;
  border: 1px solid #6f1f0e;
  border-radius: 999px;
  background: transparent;
  color: #6f1f0e;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.back-btn:hover {
  background: rgba(111, 31, 14, 0.08);
  transform: translateY(-1px);
}

.back-btn:active {
  transform: scale(0.97);
}

@media (max-width: 720px) {
  .level-buttons {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .easy,
  .medium,
  .hard,
  .level-btn,
  .back-btn {
    transition: none;
  }
}
</style>
