<template>
  <div class="reader-shell">
    <div ref="readerRef" class="reader" @scroll="updateScrollState">
      <div
        class="reader-content"
        :style="{ fontSize: `${fontSize}px` }"
        v-html="content"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  showVerseTitle: {
    type: Boolean,
    default: false,
  },
  fontSize: {
    type: Number,
    default: 15,
  },
});

const emit = defineEmits(["scroll-state-change"]);

const readerRef = ref(null);
const isScrollable = ref(false);
const canScrollUp = ref(false);
const canScrollDown = ref(false);
let resizeObserver = null;

function updateScrollState() {
  const reader = readerRef.value;

  if (!reader) {
    return;
  }

  const maxScrollTop = reader.scrollHeight - reader.clientHeight;

  isScrollable.value = maxScrollTop > 1;
  canScrollUp.value = reader.scrollTop > 1;
  canScrollDown.value = reader.scrollTop < maxScrollTop - 1;

  emit("scroll-state-change", {
    isScrollable: isScrollable.value,
    canScrollUp: canScrollUp.value,
    canScrollDown: canScrollDown.value,
  });
}

function scrollReader(direction) {
  const reader = readerRef.value;

  if (!reader) {
    return;
  }

  reader.scrollBy({
    top: direction * Math.max(reader.clientHeight * 0.55, 160),
    behavior: "smooth",
  });
}

function scrollToTop() {
  readerRef.value?.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function syncScrollState() {
  nextTick(updateScrollState);
}

onMounted(() => {
  syncScrollState();

  if (window.ResizeObserver && readerRef.value) {
    resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(readerRef.value);
  }

  window.addEventListener("resize", updateScrollState);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", updateScrollState);
});

watch(
  () => [props.content, props.fontSize],
  syncScrollState
);

defineExpose({
  scrollReader,
  scrollToTop,
});

// const getContent = () => {
//   const normalized = props.content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
//   const result = normalized.replace(/\n/g, "<br>");
//   return result;
// };
</script>

<style scoped>
/* ===== Reader ===== */

.reader-shell {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}

.reader-content {
  line-height: 160%;
  font-weight: 550;
  margin-top: 5%;
  color: #3b0906;
}
.reader {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
}

.reader::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.reader h1 {
  font-size: 23px;
  font-weight: 900;
  margin-bottom: 16px;
  color: #3b0906;
  text-align: center;
}

.reader p {
  font-size: 18px;
  line-height: 1.8;
  color: #444;
  max-width: 720px; /* better readability */
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .reader h1 {
    font-size: 23px;
  }
}
</style>
