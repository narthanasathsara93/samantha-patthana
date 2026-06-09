<template>
  <section class="practice-card">
    <h1 class="title">මතක පරීක්ෂා පුහුණුව</h1>
    <div class="subtitle practice-highlight" v-html="subTextHead"></div>
    <div class="subtitle practice-highlight" v-html="subText"></div>

    <div class="level-buttons">
      <button
        class="level-btn easy"
        aria-label="Select beginner practice level"
        @click="$emit('select-level', 'ආධුනික')"
      >
        <span class="btn-icon">
          <img
            class="level-btn-icon"
            :src="getIcon('level1')"
            alt="Level1 Icon"
          />
        </span>
        ආධුනික
      </button>
      <button
        class="level-btn medium"
        aria-label="Select intermediate practice level"
        @click="$emit('select-level', 'මධ්‍යස්ථ')"
      >
        <span class="btn-icon">
          <img
            class="level-btn-icon"
            :src="getIcon('level2')"
            alt="Level2 Icon"
          />
        </span>
        මධ්‍යස්ථ
      </button>
      <button
        class="level-btn hard"
        aria-label="Select advanced practice level"
        @click="$emit('select-level', 'ප්‍රවීණ')"
      >
        <span class="btn-icon">
          <img
            class="level-btn-icon"
            :src="getIcon('level3')"
            alt="Level3 Icon"
          />
        </span>
        ප්‍රවීණ
      </button>
    </div>

    <button
      class="back-btn"
      aria-label="Go to home page"
      @click="$emit('go-home')"
    >
      මුල් පිටුව වෙත
    </button>
  </section>
</template>

<script setup>
import { getAssetUrl } from "../../utils/assets";

defineEmits(["select-level", "go-home"]);

const getIcon = (icon) => {
  return getAssetUrl(`icons/${icon}.png`);
};

const iconHtml = (icon) =>
  `<span class="info-icon-cont" aria-hidden="true">
    <img class="info-icon" src="${getIcon(icon)}" alt="" />
  </span>`;

const subTextHead = `මෙම පුහුණුවේදී තිරයේ දිස්වන ප්‍රත්‍යයන් සැඟවුන වචන සමග මතකයෙන් ආවර්ජනය කිරීමට උත්සහ කිරීම මගින්
    ප්‍රත්‍යයන් පිළිබඳව මතකය පරික්ෂා කර ගත හැක.`;

const subText = `පුහුණුව අතරතුර<br />
  ${iconHtml("show")} මගින් පිළිතුර පිරික්සිය හැකි අතර<br />
  ${iconHtml("restart")} මගින් මුල සිට නව ඇරඹුමක් කල හැක.<br />
  ${iconHtml("home")} මගින් පුහුණුව එසැනින් නවතා මුල් පිටුව වෙත ගෙන යනු ඇත.
  <br /><br />
  පුහුණුව ආරම්භ කිරීම සඳහා සුදුසු මට්ටමක් තෝරාගන්න. <br />
`;
</script>

<style scoped>
.practice-highlight {
  background: #e9ddc38a;
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 11px;
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
  border-radius: 999px;
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
  font-family: "Abhaya Libre", serif;
  margin-top: 20px;
  border: 1px solid #6f1f0e;
  border-radius: 999px;
  background: transparent;
  color: #6f1f0e;
  padding: 10px 20px;
  font-size: 17px;
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
}

.back-btn:active {
  transform: scale(0.97);
}

@media (max-width: 420px) {
  .subtitle {
    margin: 4px 0 15px;
    font-size: 14px;
  }

  .title {
    font-size: 24px;
    line-height: 1.1;
  }

  .level-btn {
    min-height: 35px;
    gap: 8px;
    font-size: 17px;
  }

  .back-btn {
    margin-top: 12px;
    padding: 8px 16px;
    font-size: 14px;
  }

  .practice-start-settings {
    gap: 8px;
    margin: 4px 0 6px;
  }

  .setting-block {
    padding: 10px 12px;
    border-radius: 14px;
  }

  .setting-question {
    margin-bottom: 6px;
    font-size: 17px;
    line-height: 1.15;
  }

  .radio-option {
    font-size: 18px;
    padding-left: 16px;
  }

  .radio-circle {
    width: 12px;
    height: 12px;
  }

  .time-select-title {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .time-wheel {
    grid-template-columns: repeat(5, 32px);
    width: 200px;
    padding: 3px;
  }

  .time-wheel::before {
    width: 32px;
    height: 28px;
  }

  .time-wheel-option {
    width: 32px;
    min-height: 28px;
    font-size: 15px;
  }

  .time-wheel-option.selected {
    font-size: 18px;
  }

  .timer-icon,
  .shuffle-icon {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
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
