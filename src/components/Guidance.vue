<template>
  <Teleport to="body">
    <Transition name="guidance-fade" mode="out-in">
      <div v-if="modelValue" class="guidance-overlay" role="presentation">
        <section
          ref="dialogRef"
          class="guidance-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guidance-title"
          aria-describedby="guidance-description"
          tabindex="-1"
          @click.stop
        >
          <button
            class="guidance-close"
            type="button"
            aria-label="Close guidance"
            @click="closeModal"
          >
            <span aria-hidden="true">×</span>
          </button>

          <Transition
            :name="
              transitionDirection === 'next'
                ? 'guidance-section-next'
                : 'guidance-section-prev'
            "
            mode="out-in"
          >
            <div
              :key="activeSection.id"
              class="guidance-section-panel"
              aria-label="Application guidance"
            >
              <div class="guidance-header">
                <span class="guidance-mark" aria-hidden="true">
                  <img
                    class="section-icon"
                    :src="getIcon(activeSection.icon)"
                    alt=""
                  />
                </span>

                <p class="guidance-eyebrow">
                  {{ activeSection.eyebrow }}
                  <span class="guidance-progress">
                    {{ activeSectionIndex + 1 }} / {{ guidanceSections.length }}
                  </span>
                </p>

                <h2 id="guidance-title">
                  {{ activeSection.title }}
                  <span class="guidance-title-icon" aria-hidden="true">
                    <img
                      class="title-icon"
                      :src="getIcon(activeSection.titleIcon)"
                      alt=""
                    />
                  </span>
                </h2>
                <p id="guidance-description">
                  {{ activeSection.description }}
                </p>
              </div>

              <div class="guidance-steps">
                <article
                  v-for="(step, index) in activeSection.steps"
                  :key="step.title"
                  class="guidance-step"
                  :style="getStepStyle(index)"
                >
                  <div class="guidance-step-number" aria-hidden="true">
                    {{ index + 1 }}
                  </div>
                  <div class="guidance-step-copy">
                    <h3>
                      <span aria-hidden="true" v-if="step.icon">
                        <img
                          class="step-icon"
                          :src="getIcon(step.icon)"
                          alt=""
                        />
                      </span>
                      {{ step.title }}
                    </h3>
                    <div v-html="step.text"></div>
                  </div>
                </article>
              </div>
            </div>
          </Transition>
          <div class="guidance-actions">
            <button
              v-if="!isFirstSection"
              class="guidance-secondary"
              type="button"
              @click="showPreviousSection"
            >
              පෙර
            </button>
            <button
              class="guidance-primary"
              type="button"
              @click="handlePrimaryAction"
            >
              {{
                isLastSection
                  ? showContinueLabel
                    ? "පිවිසෙන්න"
                    : "සැකසුම් වෙත"
                  : "ඊළඟ"
              }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { getAssetUrl } from "../utils/assets";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  showContinueLabel: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close", "close-only"]);

const transitionDirection = ref("next");

const dialogRef = ref(null);
const activeSectionIndex = ref(0);
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let previousActiveElement = null;

const getIcon = (icon) => {
  return getAssetUrl(`icons/${icon}.png`);
};

const iconHtml = (icon) =>
  `<span class="info-icon-cont" aria-hidden="true">
    <img class="info-icon" src="${getIcon(icon)}" alt="" />
  </span>`;

const activeSection = computed(
  () => guidanceSections[activeSectionIndex.value] || guidanceSections[0],
);
const isFirstSection = computed(() => activeSectionIndex.value === 0);
const isLastSection = computed(
  () => activeSectionIndex.value === guidanceSections.length - 1,
);

function closeModal() {
  emit("update:modelValue", false);
  emit("close-only");
}

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handlePrimaryAction() {
  if (isLastSection.value) {
    close();
    return;
  }

  transitionDirection.value = "next";
  activeSectionIndex.value += 1;
}

function showPreviousSection() {
  if (isFirstSection.value) {
    return;
  }
  transitionDirection.value = "prev";
  activeSectionIndex.value -= 1;
}

function getStepStyle(index) {
  return {
    "--step-delay": `${index * 60}ms`,
  };
}

function handleKeydown(event) {
  if (event.key === "Escape" && props.modelValue) {
    close();
  }
}

function lockBodyScroll() {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  previousBodyOverflow = document.body.style.overflow;
  previousBodyPaddingRight = document.body.style.paddingRight;
  document.body.style.overflow = "hidden";
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      activeSectionIndex.value = 0;
      previousActiveElement = document.activeElement;
      lockBodyScroll();
      document.addEventListener("keydown", handleKeydown);
      await nextTick();
      dialogRef.value?.focus({ preventScroll: true });
      return;
    }

    unlockBodyScroll();
    document.removeEventListener("keydown", handleKeydown);
    previousActiveElement?.focus?.({ preventScroll: true });
    previousActiveElement = null;
  },
  { flush: "post" },
);

onBeforeUnmount(() => {
  if (props.modelValue) {
    unlockBodyScroll();
  }

  document.removeEventListener("keydown", handleKeydown);
});

const guidanceSections = [
  {
    id: "chanting",
    icon: "manual",
    titleIcon: "reading2",
    eyebrow: "මගපෙන්වීම",
    title: "සජ්ඣායනය කොටස",
    description: "මෙම කොටස දෛනික සජ්ඣායනය සහ කටපාඩම් කිරීම සඳහා යෝග්‍යවේ.",
    steps: [
      {
        title: "කැමති ප්‍රත්‍යයන් තේරීම",
        text: `වම් පැති මෙනුවේ හෝ ඉහළ ${iconHtml("menu")} මගින් පිවිසී කැමති ප්‍රත්‍යක් තේරිය හැක.`,
      },
      {
        icon: "",
        title: "ප්‍රත්‍යයන් ශ්‍රවණය කිරීමට",
        text: `පහළ ප්‍රධාන ධාවකයෙන් ${iconHtml("play")} ආරම්භ කරන්න.<br>
(එක් ගාථාවක් ටච් හෝ ක්ලික් කිරීමෙන්ද එම ගාථා කොටසේ සිට ශ්‍රවණය කළ හැක.)`,
      },
      {
        title: "සිංහල/පාලි පෙළ",
        text: `ඉහළ දකුණු පස ${iconHtml("sinhala")}/${iconHtml("paali")} මගින් අවශ්‍ය පෙළ පිරික්සීමට හෝ සැඟවීමට හැක.`,
      },
      {
        title: "බුක්මාර්ක් කිරීමට",
        text: `ඉහළ දකුණු පස ${iconHtml("bookmark")} මගින් පසුව නැවත කියවීමට සටහන් කළ හැක.<br>
(ඒවා පැති මෙනුවේ ${iconHtml("bookmarked")}  මගින් සලකුණු වේ.)`,
      },
      {
        title: "අකුරු ප්‍රමාණය වෙනස් කිරීමට ",
        text: `ඉහළ දකුණු පස ${iconHtml("font_resize")} මගින් ඔබට පහසු ලෙස අකුරු විශාලත්වය වෙනස් කළ හැක.`,
      },
      {
        title: "පැති මෙනුවේ පහළ",
        text: `${iconHtml("mindset1")} මගින් පුහුණුවීම් සඳහා පිවිසිය හැක.<br>
${iconHtml("contact1")} මගින් අදහස් සහ යෝජනා අප වෙත එවිය හැක.<br>
${iconHtml("diamond1")} මගින් භාවිත කළ මූලාශ්‍ර පරිශීලනය කළ හැක.<br>`,
      },

      {
        title: "උපදෙස් නැවත අධ්‍යනය සඳහා",
        text: `මෙම උපදෙස් සඳහා මුල් පිටුවේ ඉහල ${iconHtml("gear")} මගින් පිවිසිය හැක.`,
      },
    ],
  },
  {
    id: "practice",
    icon: "manual",
    titleIcon: "mindset1",
    eyebrow: "මගපෙන්වීම",
    title: "පුහුණුව කොටස",
    description:
      "ඔබට අවශ්‍ය පුහුණු මට්ටම තෝරාගෙන සඟවා ඇති වචන මතකයෙන් ආවර්ජනය කරමින් පුහුණුවෙහි නිරත විය හැක.",
    steps: [
      {
        title: "අසීරුතා මට්ටම් තෝරා ගැනීම",
        text: "ඔබේ ප්‍රවීණතාවය අනුව ආධුනික, මධ්‍යස්ථ, ප්‍රවීණ යන මට්ටම් 3ක් යටතේ තෝරා ගත හැක.",
      },
      {
        title: "පුහුණු ආකාරය සැකසීම.",
        text: `මෙය ප්‍රත්‍ය අහඹු ලෙස හෝ අනුපිළිවෙලින් දිස් වන ආකාරයට තෝරා ගත හැක.<br>
ටයිමරය මගින් පුහුණු කාලයක් පනවා හෝ නොපනවාද භාවිත කළ හැක.<br>
ටයිමරය සඳහා ඔබට සුදුසු කාලයක් මිනිත්තු වලින් පැනවිය හැක.<br>
කාලය අවසන් වූ විට ස්වයංව පුහුණුව අවසන් වනු ඇත.`,
      },
      {
        title: "පාලක අයිතම",
        text: `දකුණු පස ඉහළ කෙලවර ${iconHtml("restart")} මගින් මුල සිට නව ඇරඹුමක් කල හැක.<br>
${iconHtml("show")} මගින් පිළිතුර පිරික්සිය හැක.`,
      },
      {
        title: "උපදෙස් නැවත අධ්‍යනය සඳහා",
        text: `මෙම උපදෙස් සඳහා මුල් පිටුවේ ඉහල ${iconHtml("gear")} මගින් පිවිසිය හැක.`,
      },
    ],
  },
];
</script>

<style scoped>
.guidance-overlay {
  font-family: "Abhaya Libre", serif;
  position: fixed;
  inset: 0;
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(16px, env(safe-area-inset-top)) 16px
    max(16px, env(safe-area-inset-bottom));
  background: rgba(18, 10, 8, 0.66);
  backdrop-filter: blur(8px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.guidance-dialog {
  position: relative;
  width: min(100%, 699px);
  max-height: min(782px, calc(100dvh - 32px));
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  padding: 22px;
  border: 1px solid rgba(90, 42, 24, 0.14);
  border-radius: 18px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 251, 242, 0.98),
      rgba(252, 239, 215, 0.98)
    ),
    #fff8ec;
}

/* -------------------------------- */
/* CLOSE BUTTON */
/* -------------------------------- */

.guidance-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(84, 35, 18, 0.08);
  color: #4a2418;
  cursor: pointer;
  font-size: 26px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.guidance-close:hover {
  background: rgba(84, 35, 18, 0.14);
  transform: scale(1.04);
}

/* -------------------------------- */
/* HEADER */
/* -------------------------------- */

.guidance-header {
  padding-right: 32px;
  flex-shrink: 0;
}

.guidance-mark {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(99, 71, 40, 0.11);
  font-size: 23px;
}

.guidance-eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 8px;
  color: #7d5134;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.guidance-progress {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(84, 35, 18, 0.08);
  color: #5e3828;
  font-size: 17px;
  letter-spacing: 0;
  text-transform: none;
}

.guidance-header h2 {
  margin: 0;
  color: #35170f;
  font-size: 26px;
  line-height: 1.14;
  letter-spacing: 0;
}

.guidance-header p {
  margin: 10px 0 0;
  color: #664536;
  font-size: 19px;
}

/* -------------------------------- */
/* STEPS */
/* -------------------------------- */

.guidance-section-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  will-change: opacity, transform, filter;
}

.guidance-steps {
  position: relative;
  display: grid;
  gap: 8px;
  margin-top: 18px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 6px;
  scrollbar-width: thin;
}

.guidance-step {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(84, 35, 18, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.52);

  animation: guidanceStepIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;

  animation-delay: var(--step-delay);

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.guidance-step:hover {
  transform: translateY(-1px);
  border-color: rgba(84, 35, 18, 0.16);
  box-shadow: 0 10px 24px rgba(84, 35, 18, 0.08);
}

.guidance-step-number {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #7b2d18;
  color: #fff6e7;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 6px 16px rgba(123, 45, 24, 0.2);
}

.guidance-step-copy h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #37180f;
  font-size: 21px;
  line-height: 1.25;
}

.guidance-step-copy p,
.guidance-step-copy div {
  margin: 5px 0 0;
  color: #2b2827;
  font-size: 17px;
  line-height: 1.55;
}

/* -------------------------------- */
/* ACTIONS */
/* -------------------------------- */

.guidance-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
  flex-shrink: 0;
  padding-top: 14px;
  border-top: 1px solid rgba(84, 35, 18, 0.08);
  background: rgb(252 240 218);
}

.guidance-primary,
.guidance-secondary {
  min-height: 44px;
  border: none;
  border-radius: 999px;
  padding: 0 18px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.guidance-primary {
  background: linear-gradient(180deg, #8f2d14 0%, #6f1f0e 100%);
  color: #fff1d6;
  box-shadow: 0 10px 24px rgba(111, 31, 14, 0.26);
}

.guidance-secondary {
  background: rgba(84, 35, 18, 0.08);
  color: #4a2418;
}

.guidance-primary:hover,
.guidance-secondary:hover {
  transform: translateY(-1px);
}

.guidance-primary:active,
.guidance-secondary:active {
  transform: scale(0.98);
}

/* -------------------------------- */
/* MODAL OPEN/CLOSE */
/* -------------------------------- */

.guidance-fade-enter-active,
.guidance-fade-leave-active {
  transition: opacity 0.28s ease;
}

.guidance-fade-enter-from,
.guidance-fade-leave-to {
  opacity: 0;
}

.guidance-fade-enter-active .guidance-dialog,
.guidance-fade-leave-active .guidance-dialog {
  transition:
    opacity 0.34s ease,
    transform 0.34s ease,
    filter 0.34s ease;
}

.guidance-fade-enter-from .guidance-dialog,
.guidance-fade-leave-to .guidance-dialog {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
  filter: blur(6px);
}

/* -------------------------------- */
/* SECTION TRANSITIONS */
/* -------------------------------- */

.guidance-section-next-enter-active,
.guidance-section-next-leave-active,
.guidance-section-prev-enter-active,
.guidance-section-prev-leave-active {
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* NEXT */

.guidance-section-next-enter-from {
  opacity: 0;
  transform: translate3d(18px, 4px, 0) scale(0.992);
  filter: blur(3px);
}

.guidance-section-next-leave-to {
  opacity: 0;
  transform: translate3d(-18px, -4px, 0) scale(0.992);
  filter: blur(3px);
}

/* PREVIOUS */

.guidance-section-prev-enter-from {
  opacity: 0;
  transform: translate3d(-18px, 4px, 0) scale(0.992);
  filter: blur(3px);
}

.guidance-section-prev-leave-to {
  opacity: 0;
  transform: translate3d(18px, -4px, 0) scale(0.992);
  filter: blur(3px);
}

/* -------------------------------- */
/* ICONS */
/* -------------------------------- */

.guidance-title-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(99, 71, 40, 0.11);
  font-size: 23px;
}

.title-icon {
  width: 16px;
  height: auto;
}

.section-icon {
  width: 31px;
  height: auto;
}

/* -------------------------------- */
/* STEP ENTRANCE */
/* -------------------------------- */

@keyframes guidanceStepIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.985);
    filter: blur(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* -------------------------------- */
/* MOBILE */
/* -------------------------------- */

@media (max-width: 480px) {
  .guidance-overlay {
    align-items: flex-start;
    padding-left: 12px;
    padding-right: 12px;
  }

  .guidance-dialog {
    max-height: calc(100dvh - 24px);
    padding: 18px;
    border-radius: 16px;
  }

  .guidance-header h2 {
    font-size: 21px;
  }

  .guidance-header p {
    font-size: 17px;
  }

  .guidance-step-copy h3 {
    font-size: 18px;
  }

  .guidance-step-copy p,
  .guidance-step-copy div {
    font-size: 16px;
  }

  .guidance-actions {
    position: relative;
    bottom: auto;
    margin: 0;
    padding-top: 14px;
  }

  .guidance-primary,
  .guidance-secondary {
    flex: 1;
  }
}

/* -------------------------------- */
/* REDUCED MOTION */
/* -------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .guidance-fade-enter-active,
  .guidance-fade-leave-active,
  .guidance-fade-enter-active .guidance-dialog,
  .guidance-fade-leave-active .guidance-dialog,
  .guidance-section-next-enter-active,
  .guidance-section-next-leave-active,
  .guidance-section-prev-enter-active,
  .guidance-section-prev-leave-active,
  .guidance-step {
    animation: none;
    transition: none;
  }
}
</style>

<style>
.info-icon-cont {
  border-radius: 20px;
  display: inline-flex;
  object-fit: contain;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  background: #54231214;
}

.info-icon {
  width: 14px;
  height: 14px;
}
</style>
