<script setup>
import { scenario, selectMode, session } from '../state/session.js'
import { scenarioNumber } from '../data/scenarios.js'

const modes = [
  {
    id: 'analyst',
    title: 'Я аналитик',
    text: 'Задавайте вопросы заказчику по сценарию: роли, процессы, данные, правила, проблемы и цели. Можно поздороваться — дальше спрашивайте по делу.',
  },
  {
    id: 'stakeholder',
    title: 'Я заказчик',
    text: 'Система проводит структурированное интервью. Ваши ответы попадут в описание предметной области.',
  },
  {
    id: 'both',
    title: 'Полный цикл',
    text: 'Сначала поработайте аналитиком, затем ответьте на вопросы системы — или переключайтесь свободно.',
  },
]

function back() {
  session.phase = 'home'
}
</script>

<template>
  <section v-if="scenario" class="wrap fade-up">
    <button class="btn ghost" type="button" @click="back">← к сценариям</button>
    <div class="head">
      <p class="eyebrow">Сценарий {{ String(scenarioNumber(scenario.id)).padStart(2, '0') }}</p>
      <h1>{{ scenario.title }}</h1>
      <p>{{ scenario.subtitle }}</p>
    </div>
    <div class="grid">
      <button
        v-for="m in modes"
        :key="m.id"
        class="panel mode"
        type="button"
        @click="selectMode(m.id)"
      >
        <h2>{{ m.title }}</h2>
        <p>{{ m.text }}</p>
      </button>
    </div>
  </section>
</template>

<style scoped>
.wrap {
  display: grid;
  gap: 1rem;
}

.head h1 {
  margin: 0.2rem 0 0.4rem;
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
}

.head p {
  margin: 0;
  color: var(--muted);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.mode {
  text-align: left;
  padding: 1.25rem;
  transition: transform 0.18s ease;
}

.mode:hover {
  transform: translateY(-3px);
}

.mode h2 {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.mode p {
  margin: 0;
  color: var(--muted);
  line-height: 1.45;
}

@media (max-width: 860px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
