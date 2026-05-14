<template>
  <section class="practice-card">
    <h1 class="title">Practice Mode</h1>
    <p class="subtitle">
      Select a level to start. During practice, End resets progress and brings
      you back here.
    </p>

    <div class="level-buttons">
      <button class="level-btn easy" @click="$emit('select-level', 'ආධුනික')">
        <span>☘</span>ආධුනික
      </button>
      <button class="level-btn medium" @click="$emit('select-level', 'මධ්‍යස්ථ')">
         <span>♣</span>මධ්‍යස්ථ
      </button>
      <button class="level-btn hard" @click="$emit('select-level', 'ගුරු')">
         <span>♠</span>ගුරු
      </button>
    </div>

    <button class="back-btn" @click="$emit('go-home')">Back to Home</button>
  </section>
</template>

<script setup>
defineEmits(["select-level", "go-home"]);
</script>

<style scoped>
.practice-card {
  width: min(760px, 92vw);
  border-radius: 18px;
  padding: 32px 28px;
  background: linear-gradient(148deg, #fdf1da 0%, #f8e7c7 100%);
  box-shadow: 0 14px 38px rgba(59, 9, 6, 0.2);
  text-align: center;
}

.title {
  margin: 0;
  font-size: clamp(30px, 4vw, 44px);
  color: #4d3124;
}

.subtitle {
  margin: 12px 0 26px;
  font-size: clamp(17px, 2vw, 22px);
  color: #6a3f2e;
}

.level-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.level-btn {
  border: none;
  border-radius: 12px;
  min-height: 62px;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.level-btn:hover {
  transform: translateY(-2px);
}

.easy {
  background: #d6f5da;
}

.medium {
  background: #ffe9a8;
}

.hard {
  background: #ffc9be;
}

.back-btn {
  margin-top: 20px;
  border: 1px solid #6f1f0e;
  border-radius: 999px;
  background: transparent;
  color: #6f1f0e;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

@media (max-width: 720px) {
  .level-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
