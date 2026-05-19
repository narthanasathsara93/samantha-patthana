<template>
  <Teleport to="body">
    <Transition name="confirm-dialog">
      <div
        v-if="show"
        class="confirm-dialog-backdrop"
        role="presentation"
        @click.self="emitDismiss"
      >
        <section
          ref="dialogRef"
          :class="
            isLargeHeight
              ? 'level-settings-added confirm-dialog'
              : 'confirm-dialog'
          "
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
          tabindex="-1"
          @keydown.esc="emitDismiss"
        >
          <h2 :id="titleId" class="confirm-dialog-title">{{ title }}</h2>
          <p
            :id="messageId"
            class="confirm-dialog-message"
            v-html="message"
          ></p>
          <slot></slot>

          <div class="confirm-dialog-actions">
            <button
              class="confirm-dialog-btn secondary"
              type="button"
              @click="emitCancel"
            >
              {{ cancelLabel }}
            </button>
            <button
              class="confirm-dialog-btn primary"
              type="button"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Are you sure?",
  },
  message: {
    type: String,
    default: "Please confirm before continuing.",
  },
  confirmLabel: {
    type: String,
    default: "Yes",
  },
  cancelLabel: {
    type: String,
    default: "No",
  },
  dismissEmitsCancel: {
    type: Boolean,
    default: true,
  },
  isLargeHeight: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel", "dismiss"]);
const dialogRef = ref(null);

const titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2)}`;
const messageId = `confirm-dialog-message-${Math.random()
  .toString(36)
  .slice(2)}`;

watch(
  () => props.show,
  async (show) => {
    if (!show) {
      return;
    }

    await nextTick();
    dialogRef.value?.focus();
  },
);

function emitCancel() {
  emit("cancel");
}

function emitDismiss() {
  emit("dismiss");

  if (props.dismissEmitsCancel) {
    emitCancel();
  }
}
</script>

<style scoped>
.confirm-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(35, 9, 5, 0.48);
  backdrop-filter: blur(4px);
}

.level-settings-added {
  height: calc(100vh - 10%);
}

.confirm-dialog {
  width: min(420px, 92vw);
  border: 1px solid rgba(122, 36, 16, 0.18);
  border-radius: 14px;
  padding: 24px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 22px 60px rgba(35, 9, 5, 0.3);
  color: #3b0906;
  text-align: center;
}

.confirm-dialog-title {
  margin: 0;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(24px, 4vw, 32px);
  line-height: 1.15;
}

.confirm-dialog-message {
  margin: 12px 0 22px;
  color: #5e3a2b;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(17px, 2.4vw, 20px);
  line-height: 1.45;
}

.confirm-dialog-actions {
  margin-top: 10%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.confirm-dialog-btn {
  min-height: 37px;
  border-radius: 10px;
  font-family: "Abhaya Libre", serif;
  font-size: 19px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.confirm-dialog-btn.primary,
.confirm-dialog-btn.secondary {
  border: none;
  background: #7a2410;
  color: #ffeaca;
}

.confirm-dialog-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(111, 31, 14, 0.16);
}

.confirm-dialog-btn:active {
  transform: translateY(0) scale(0.985);
  box-shadow: 0 5px 14px rgba(111, 31, 14, 0.14);
}

.confirm-dialog-enter-active,
.confirm-dialog-leave-active {
  transition: opacity 0.22s ease;
}

.confirm-dialog-enter-active .confirm-dialog,
.confirm-dialog-leave-active .confirm-dialog {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.confirm-dialog-enter-from,
.confirm-dialog-leave-to {
  opacity: 0;
}

.confirm-dialog-enter-from .confirm-dialog,
.confirm-dialog-leave-to .confirm-dialog {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

@media (max-width: 420px) {
  .confirm-dialog-actions {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confirm-dialog-backdrop,
  .confirm-dialog,
  .confirm-dialog-btn {
    transition: none;
  }
}
</style>
