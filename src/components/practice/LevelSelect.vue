<template>
  <section class="practice-card">
    <h1 class="title">මතක පරීක්ෂා පුහුණුව</h1>
    <p class="subtitle">
      පුහුණුව ආරම්භ කිරීම සඳහා කැමති මට්ටමක් තෝරාගන්න. <br />
      මෙම පුහුණුවේදී තිරයේ දිස්වන ප්‍රත්‍යයන් ආවර්ජනය කිරීමට උත්සහ කිරීම මගින්
      ප්‍රත්‍යයන් පිළිබඳව මතකය පරික්ෂා කර ගත හැක.<br /><br />
      පුහුණුව අතරතුර ↺ මගින් මුල සිට නව ඇරඹුමක් කල හැකි අතර<br />
      <img class="sample-icon" :src="getIcon('show.png')" alt="👁" /> මගින්
      පිළිතුර දැකිය හැක.
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
.sample-icon {
  width: 16px;
  height: 16px;
}
.practice-card {
  font-family: "Abhaya Libre", serif !important;
  width: min(760px, 92vw);
  box-sizing: border-box;
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
  min-width: 0;
}

.easy,
.medium,
.hard {
  border-radius: 25px;
  background: linear-gradient(180deg, #7a2410 0%, #5a1101 100%);
  color: #ffe8c4;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.level-btn {
  font-family: "Abhaya Libre", serif !important;
  width: 100%;
  min-width: 0;
  border: none;
  border-radius: 12px;
  min-height: 62px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
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

  .level-btn {
    min-height: 54px;
    padding: 8px 10px;
    font-size: 20px;
  }

  .level-btn-icon {
    width: 21px;
    height: 21px;
  }
}

@media (max-width: 420px) {
  .practice-card {
    width: min(100%, 92vw);
    padding: 24px 18px;
  }

  .level-buttons {
    gap: 10px;
  }

  .level-btn {
    min-height: 50px;
    gap: 8px;
    font-size: 20px;
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
