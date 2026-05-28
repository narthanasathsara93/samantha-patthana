<template>
  <Teleport to="body">
    <Transition name="guidance-fade">
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
            @click="close"
          >
            <span aria-hidden="true">&times;</span>
          </button>

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
            <h2 id="guidance-title">{{ activeSection.title }}</h2>
            <p id="guidance-description">
              {{ activeSection.description }}
            </p>
          </div>

          <Transition name="guidance-section" mode="out-in">
            <div
              :key="activeSection.id"
              class="guidance-steps"
              aria-label="Application guidance"
            >
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
                      <img class="step-icon" :src="getIcon(step.icon)" alt="" />
                    </span>
                    {{ step.title }}
                  </h3>
                  <div v-html="step.text"></div>
                </div>
              </article>
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
              {{ isLastSection ? "පිවිසෙන්න" : "ඊළඟ" }}
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
});

const emit = defineEmits(["update:modelValue", "close"]);

const dialogRef = ref(null);
const activeSectionIndex = ref(0);
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let previousActiveElement = null;

const mindset1Icon = getAssetUrl("icons/mindset1.png");
const guidanceSections = [
  {
    id: "chanting",
    icon: "reading.png",
    eyebrow: "මගපෙන්වීම",
    title: "සජ්ඣායනය කොටස",
    description: "මෙම කොටස දෛනික සජ්ඣායනය සහ කටපාඩම් කිරීම සඳහා යෝග්‍යවේ.",
    steps: [
      {
        title: "කැමති ප්‍රත්‍යයන් තේරීම",
        text: `වම් පැති මෙනුවේ හෝ ඉහළ 99 මගින් පිවිසී කැමති ප්‍රත්‍යක් තේරිය හැක.`,
      },
      {
        icon: "",
        title: "ප්‍රත්‍යයන් ශ්‍රවණය කිරීමට",
        text: `පහළ ප්‍රධාන ධාවකයෙන් ආරම්භ කරන්න.<br><br>
(එක් ගාථාවක් ටච් හෝ ක්ලික් කිරීමෙන්ද එම ගාථා කොටසේ සිට ශ්‍රවණය කළ හැක.)`,
      },
      {
        title: "සිංහල / පාලි පෙළ",
        text: `ඉහළ දකුණු පස 99 මගින් අවශ්‍ය පෙළ පිරික්සීමට හෝ සැඟවීමට හැක.`,
      },
      {
        title: "බුක්මාර්ක් කිරීමට",
        text: `ඉහළ දකුණු පස 99 මගින් පසුව නැවත කියවීමට සටහන් කළ හැක.<br><br>
(ඒවා පැති මෙනුවේ <span class="info-icon" aria-hidden="true"><img class="info-icon" src="${mindset1Icon}" alt="" /></span> මගින් සලකුණු වේ.)`,
      },
      {
        title: "අකුරු ප්‍රමාණය වෙනස් කිරීමට ",
        text: `ඉහළ දකුණු පස 99 මගින් ඔබට පහසු ලෙස අකුරු විශාලත්වය වෙනස් කළ හැක.`,
      },
      {
        title: "පැති මෙනුවේ පහළ,",
        text: `777 මගින් පුහුණුවීම් සඳහා පිවිසිය හැක.<br><br>
777 මගින් අදහස් සහ යෝජනා අප වෙත එවිය හැක.<br><br>
777 මගින් යොදාගත් මූලාශ්‍ර පරිශීලනය කළ හැක.<br><br>`,
      },
    ],
  },
  {
    id: "practice",
    icon: "\u{1F9D8}",
    eyebrow: "මගපෙන්වීම",
    title: "පුහුණුව කොටස",
    description:
      "Use practice mode when you want a more active review experience with simple prompts.",
    steps: [
      {
        title: "Use audio support",
        text: "Play, pause, repeat sections, or listen while you read through the content.",
      },
      {
        title: "Save important places",
        text: "Bookmark useful sections so you can return to them later without searching.",
      },
      {
        title: "Use audio support",
        text: "Play, pause, repeat sections, or listen while you read through the content.",
      },
      {
        title: "Save important places",
        text: "Bookmark useful sections so you can return to them later without searching.",
      },
    ],
  },
];

const getIcon = (icon) => {
  console.log("icon : ", icon);
  const x = getAssetUrl(`icons/${icon}`);
  console.log(x);
  return x;
};

const activeSection = computed(
  () => guidanceSections[activeSectionIndex.value] || guidanceSections[0],
);
const isFirstSection = computed(() => activeSectionIndex.value === 0);
const isLastSection = computed(
  () => activeSectionIndex.value === guidanceSections.length - 1,
);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handlePrimaryAction() {
  if (isLastSection.value) {
    close();
    return;
  }

  activeSectionIndex.value += 1;
}

function showPreviousSection() {
  if (isFirstSection.value) {
    return;
  }

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
  width: min(100%, 560px);
  max-height: min(640px, calc(100dvh - 32px));
  overflow-y: auto;
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
  color: #2b1b15;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
  outline: none;
}

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

.guidance-header {
  padding-right: 32px;
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
  max-width: 460px;
  color: #664536;
  font-size: 15px;
  line-height: 1.55;
}

.guidance-steps {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.guidance-step {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(84, 35, 18, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.52);
  animation: guidanceStepIn 0.42s ease both;
  animation-delay: var(--step-delay);
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
  font-size: 15px;
  line-height: 1.25;
}

.guidance-step-copy p {
  margin: 5px 0 0;
  color: #6d4a3d;
  font-size: 13px;
  line-height: 1.45;
}

.guidance-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
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

.guidance-fade-enter-active,
.guidance-fade-leave-active {
  transition: opacity 0.22s ease;
}

.guidance-fade-enter-from,
.guidance-fade-leave-to {
  opacity: 0;
}

.guidance-fade-enter-active .guidance-dialog,
.guidance-fade-leave-active .guidance-dialog {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.guidance-fade-enter-from .guidance-dialog,
.guidance-fade-leave-to .guidance-dialog {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

.guidance-section-enter-active,
.guidance-section-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.guidance-section-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.guidance-section-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.step-icon,
.section-icon {
  width: 15px;
  height: auto;
}

.info-icon {
  width: 15px;
  height: 15px;
}
@keyframes guidanceStepIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

  .guidance-actions {
    position: sticky;
    bottom: -18px;
    margin-left: -18px;
    margin-right: -18px;
    margin-bottom: -18px;
    padding: 12px 18px 18px;
    background: linear-gradient(
      180deg,
      rgba(252, 239, 215, 0),
      rgba(252, 239, 215, 0.98) 28%
    );
  }

  .guidance-primary,
  .guidance-secondary {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .guidance-fade-enter-active,
  .guidance-fade-leave-active,
  .guidance-fade-enter-active .guidance-dialog,
  .guidance-fade-leave-active .guidance-dialog,
  .guidance-section-enter-active,
  .guidance-section-leave-active,
  .guidance-step {
    animation: none;
    transition: none;
  }
}
</style>
