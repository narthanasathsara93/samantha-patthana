<template>
  <Teleport to="body">
    <Transition name="guidance-fade">
      <div
        v-if="modelValue"
        class="guidance-overlay"
        role="presentation"
        @click="handleOverlayClick"
      >
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
            <span class="guidance-mark" aria-hidden="true">&#127807;</span>
            <p class="guidance-eyebrow">First visit guide</p>
            <h2 id="guidance-title">Welcome to Samantha Patthana</h2>
            <p id="guidance-description">
              A short, calm introduction to help you begin reading, listening,
              and practicing with confidence.
            </p>
          </div>

          <div class="guidance-steps" aria-label="Application guidance">
            <article
              v-for="(step, index) in steps"
              :key="step.title"
              class="guidance-step"
              :style="getStepStyle(index)"
            >
              <div class="guidance-step-number" aria-hidden="true">
                {{ index + 1 }}
              </div>
              <div class="guidance-step-copy">
                <h3>
                  <span aria-hidden="true">{{ step.icon }}</span>
                  {{ step.title }}
                </h3>
                <p>{{ step.text }}</p>
              </div>
            </article>
          </div>

          <div class="guidance-actions">
            <button class="guidance-secondary" type="button" @click="close">
              Close
            </button>
            <button class="guidance-primary" type="button" @click="close">
              Got it
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "close"]);

const dialogRef = ref(null);
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";
let previousActiveElement = null;

const steps = [
  {
    icon: "\u{1F3A7}",
    title: "Begin with the reader",
    text: "Use the begin button to open the chanting reader and follow the content at your own pace.",
  },
  {
    icon: "\u{1F4D6}",
    title: "Listen and follow along",
    text: "Audio controls, section playback, and text display options are available inside the reader.",
  },
  {
    icon: "\u{1F9D8}",
    title: "Practice gently",
    text: "Practice mode helps you review selected material with simple guided prompts.",
  },
  {
    icon: "\u{2B50}",
    title: "Keep useful places",
    text: "Bookmark important sections and return to them later from the navigation tools.",
  },
];

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function getStepStyle(index) {
  return {
    "--step-delay": `${index * 60}ms`,
  };
}

function handleOverlayClick(event) {
  if (event.target === event.currentTarget) {
    close();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && props.modelValue) {
    close();
  }
}

function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

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
  max-height: min(720px, calc(100dvh - 32px));
  overflow-y: auto;
  padding: 24px;
  border: 1px solid rgba(90, 42, 24, 0.14);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 251, 242, 0.98), rgba(252, 239, 215, 0.98)),
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
  margin: 16px 0 8px;
  color: #7d5134;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.guidance-header h2 {
  margin: 0;
  color: #35170f;
  font-size: 26px;
  line-height: 1.14;
  letter-spacing: 0;
}

.guidance-header p {
  margin: 12px 0 0;
  max-width: 460px;
  color: #664536;
  font-size: 15px;
  line-height: 1.55;
}

.guidance-steps {
  display: grid;
  gap: 10px;
  margin-top: 22px;
}

.guidance-step {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 12px;
  padding: 14px;
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
  margin: 6px 0 0;
  color: #6d4a3d;
  font-size: 13px;
  line-height: 1.45;
}

.guidance-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
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
    padding: 20px;
    border-radius: 16px;
  }

  .guidance-header h2 {
    font-size: 23px;
  }

  .guidance-actions {
    position: sticky;
    bottom: -20px;
    margin-left: -20px;
    margin-right: -20px;
    margin-bottom: -20px;
    padding: 14px 20px 20px;
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
  .guidance-step {
    animation: none;
    transition: none;
  }
}
</style>
