<template>
  <div class="reader">
    <h1 v-if="showVerseTitle" class="reader-title">{{ title }}</h1>
    <div class="reader-content" v-html="content"></div>
  </div>
</template>

<script setup>
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
});

// const getContent = () => {
//   const normalized = props.content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
//   const result = normalized.replace(/\n/g, "<br>");
//   return result;
// };
</script>

<style scoped>

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .reader-title {
    display: none;
  }
}
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
  padding-bottom: 20px;
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