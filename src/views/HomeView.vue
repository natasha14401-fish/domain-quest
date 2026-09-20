<script setup>
import { scenarios } from '../data/scenarios.js'
import { selectScenario } from '../state/session.js'
</script>

<template>
  <section class="hero fade-up">
    <div class="hero-copy">
      <p class="eyebrow">Проектирование и дизайн ИС</p>
      <h1>Собери описание предметной области через интервью</h1>
      <p class="lead">
        Задавай вопросы стейкхолдеру, отвечай системе как эксперт предметной области,
        собирай факты и экспортируй готовое описание для диаграмм и проектирования.
      </p>
      <ul class="points">
        <li>Два режима: аналитик и стейкхолдер</li>
        <li>Несколько учебных сценариев</li>
        <li>Работает офлайн, публикация через GitHub Pages</li>
      </ul>
    </div>
    <div class="hero-visual panel" aria-hidden="true">
      <div class="orbit">
        <span>акторы</span>
        <span>процессы</span>
        <span>данные</span>
        <span>правила</span>
      </div>
      <div class="orbit-core">ПО</div>
    </div>
  </section>

  <section class="scenarios fade-up">
    <div class="section-head">
      <h2>Выберите сценарий</h2>
      <p>Каждый сценарий — отдельная предметная область для анализа.</p>
    </div>
    <div class="grid">
      <button
        v-for="s in scenarios"
        :key="s.id"
        class="card panel"
        type="button"
        :style="{ '--card-accent': s.accent }"
        @click="selectScenario(s.id)"
      >
        <span class="card-accent" />
        <h3>{{ s.title }}</h3>
        <p>{{ s.subtitle }}</p>
        <small>{{ s.tone }}</small>
      </button>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem;
  align-items: stretch;
  margin-bottom: 2rem;
}

.hero-copy {
  padding: 0.4rem 0.2rem;
}

.eyebrow {
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1.05;
  letter-spacing: -0.04em;
  max-width: 14ch;
}

.lead {
  margin: 1rem 0 1.25rem;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
  max-width: 42ch;
}

.points {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;
  color: var(--ink);
}

.points li {
  padding-left: 1rem;
  position: relative;
}

.points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--accent-2);
}

.hero-visual {
  min-height: 280px;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.orbit {
  position: absolute;
  inset: 12%;
  border: 1px dashed color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 50%;
  animation: spin 22s linear infinite;
}

.orbit span {
  position: absolute;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent);
  background: rgba(255, 252, 246, 0.9);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--line);
}

.orbit span:nth-child(1) { top: -0.6rem; left: 50%; transform: translateX(-50%); }
.orbit span:nth-child(2) { right: -1.2rem; top: 45%; }
.orbit span:nth-child(3) { bottom: -0.6rem; left: 42%; }
.orbit span:nth-child(4) { left: -1.4rem; top: 40%; }

.orbit-core {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.4rem;
  color: #f4fff8;
  background: radial-gradient(circle at 30% 30%, #3f8f6b, var(--accent));
  box-shadow: 0 12px 30px rgba(27, 77, 62, 0.35);
  animation: pulse 3.2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.section-head {
  margin-bottom: 1rem;
}

.section-head h2 {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  letter-spacing: -0.03em;
}

.section-head p {
  margin: 0;
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.card {
  text-align: left;
  padding: 1.2rem 1.2rem 1.1rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 40px rgba(20, 32, 27, 0.12);
}

.card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: var(--card-accent, var(--accent));
}

.card h3 {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
}

.card p {
  margin: 0 0 0.75rem;
  color: var(--muted);
  line-height: 1.45;
}

.card small {
  color: color-mix(in srgb, var(--card-accent) 70%, var(--ink));
  font-weight: 600;
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 220px;
  }

  h1 {
    max-width: none;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
