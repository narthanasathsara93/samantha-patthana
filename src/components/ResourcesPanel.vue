<template>
  <section class="resources-panel">
    <div class="resources-panel-header">
      <h2>Resources</h2>
    </div>

    <div class="resources-panel-body">
      <p>Here are useful resources to support your reading and practice.</p>
      <ul>
        <li>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Audio practice and study resources
          </a>
        </li>
        <li>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sinhala script learning tools
          </a>
        </li>
        <li>
          <a
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Community support and guidance
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.resources-panel {
  padding: 24px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resources-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.resources-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #3b0906;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.resources-back-btn:hover {
  background: #fff;
  transform: translateX(-1px);
}

.resources-panel-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #3b0906;
}

.resources-panel-body {
  background: rgba(255, 255, 255, 0.82);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 14px 30px rgba(59, 9, 6, 0.12);
}

.resources-panel-body p {
  margin: 0 0 16px;
  color: #4c1711;
}

.resources-panel-body ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.resources-panel-body li a {
  display: block;
  padding: 14px 16px;
  border-radius: 16px;
  background: #faf0e4;
  color: #3b0906;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.resources-panel-body li a:hover {
  background: #fff;
  transform: scale(1.01);
}
</style>
