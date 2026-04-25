<template>
  <div class="reader">
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* ===== Reader ===== */
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