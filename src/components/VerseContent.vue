<template>
  <div class="reader">
    <h1 v-if="showVerseTitle">{{ title }}</h1>
    <div class="reader-content" v-html="getContent()"></div>
  </div>
</template>

<script setup>
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
});

const getContent = () => {
  const normalized = props.content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const result = normalized.replace(/\n/g, "<br>");
  return result;
};
</script>

<style scoped>
/* ===== Reader ===== */

.reader-content {
  line-height: 1.8;
  font-size: large;
  font-weight: 600;
    margin-top: 5%;
  color: #3b0906;
}
.reader {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.reader h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
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
    font-size: 22px;
  }

  .reader p {
    font-size: 16px;
  }
}
</style>