<template>
  <div class="reader-shell">
    <div ref="readerRef" class="reader" @scroll="updateScrollState">
      <div
        v-if="audioSections.length === 0"
        :class="!sinhalaViewOn ? 'reader-content' : 'sinhala-view-on'"
        :style="{ fontSize: `${fontSize}px` }"
        v-html="content"
      ></div>
      <div
        v-else
        :class="!sinhalaViewOn ? 'reader-content' : 'sinhala-view-on'"
        class="reader-content-sections"
        :style="{ fontSize: `${fontSize}px` }"
      >
        <button
          v-for="(section, index) in audioSections"
          :key="`${section.startAt}-${section.endAt}-${index}`"
          ref="sectionRefs"
          class="verse-audio-section"
          :class="{ active: index === activeAudioSectionIndex }"
          type="button"
          @click="$emit('play-section', section, index)"
          v-html="section.content"
        ></button>
      </div>
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
  audioSections: {
    type: Array,
    default: () => [],
  },
  activeAudioSectionIndex: {
    type: Number,
    default: -1,
  },
  sinhalaViewOn: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["scroll-state-change", "play-section"]);

const readerRef = ref(null);
const sectionRefs = ref([]);
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

function scrollToAudioSection(index) {
  sectionRefs.value[index]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
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
  () => [props.content, props.fontSize, props.audioSections],
  syncScrollState,
);

defineExpose({
  scrollReader,
  scrollToTop,
  scrollToAudioSection,
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
  font-weight: 600;
}

.reader-content,
.sinhala-view-on {
  line-height: 160%;
  margin-top: 5%;
  color: #0e0a0a;
}

.reader-content-sections {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.verse-audio-section {
  transition: all 0.25s ease;
  padding: 4px 12px 9px;
  width: 100%;
  border: 0;
  background: linear-gradient(to top, #faecd026, transparent);
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: inherit;
  text-align: left;
  border-right: 1px solid rgb(206 176 124 / 47%);
  box-shadow: 10px 1px 20px -12px rgb(216 194 157);
  border-radius: 15px;
}

.verse-audio-section:hover {
  color: #7a1f1f;
  box-shadow: 6px 8px 16px -10px rgb(216 194 157);
  transform: translateY(-1px);
  border-radius: 20px;
}

.verse-audio-section.active {
  color: #7a1f1f;
  background: linear-gradient(to top, #faecd040, transparent);
  box-shadow: 6px 8px 16px -10px rgb(216 194 157);
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
  max-width: 720px;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .reader h1 {
    font-size: 23px;
  }
  .verse-audio-section {
    background: #e9d7b985;
    border-right: 1px solid rgb(206 176 124 / 31%);
  }
  .verse-audio-section.active {
    background: #e9d7b985;
  }
}
</style>

<style>
.sinhala-text-url-ext {
  color: #0e0a0a !important;
}

.sinhala-text {
  font-weight: 600;
  display: inline-block;
  text-align: justify;
}
</style>
