<script setup>
import { coverage, session, scenario } from '../state/session.js'
import { topicOrder, topicMeta } from '../data/scenarios.js'

const percent = () =>
  coverage.value.total
    ? Math.round((coverage.value.found / coverage.value.total) * 100)
    : 0
</script>

<template>
  <aside v-if="scenario" class="panel side">
    <div class="side-head">
      <h2>Карта знаний</h2>
      <p>{{ coverage.found }} / {{ coverage.total }} фактов · {{ percent() }}%</p>
    </div>
    <div class="progress"><span :style="{ width: percent() + '%' }" /></div>

    <ul class="topics">
      <li v-for="t in topicOrder" :key="t">
        <div class="row">
          <strong>{{ topicMeta[t].label }}</strong>
          <span>{{ coverage.byTopic[t].hit }}/{{ coverage.byTopic[t].total }}</span>
        </div>
        <div class="progress thin">
          <span
            :style="{
              width:
                (coverage.byTopic[t].total
                  ? (coverage.byTopic[t].hit / coverage.byTopic[t].total) * 100
                  : 0) + '%',
            }"
          />
        </div>
        <ul class="facts">
          <li
            v-for="f in scenario.topics[t].facts"
            :key="f.id"
            :class="{ open: session.discoveredIds.includes(f.id) }"
          >
            {{ session.discoveredIds.includes(f.id) ? f.text : 'Ещё не открыто — спросите об этом' }}
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.side {
  padding: 1rem;
}

.side-head h2 {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.side-head p {
  margin: 0 0 0.75rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.progress.thin {
  height: 5px;
  margin-bottom: 0.55rem;
}

.topics {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 1rem;
  max-height: 560px;
  overflow: auto;
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
}

.row span {
  color: var(--muted);
}

.facts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.35rem;
}

.facts li {
  font-size: 0.8rem;
  line-height: 1.35;
  color: var(--muted);
  padding: 0.45rem 0.55rem;
  border-radius: 10px;
  background: rgba(20, 32, 27, 0.04);
  border: 1px dashed transparent;
}

.facts li.open {
  color: var(--ink);
  background: color-mix(in srgb, var(--accent) 8%, white);
  border-color: color-mix(in srgb, var(--accent) 20%, transparent);
}
</style>
