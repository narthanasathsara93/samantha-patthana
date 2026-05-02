<template>
  <div ref="readerRef" class="reader">
    <h1 v-if="showVerseTitle" class="reader-title">{{ title }}</h1>
    <div
      class="reader-content"
      :style="{ fontSize: `${fontSize}px` }"
      v-html="content"
    ></div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
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
    default: 20,
  },
});

const readerRef = ref(null);

function scrollToTop() {
  readerRef.value?.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

defineExpose({
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

.reader-content {
  line-height: 160%;
  font-size: 20px;
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
  .reader-title {
    display: none;
  }
}

</style>
