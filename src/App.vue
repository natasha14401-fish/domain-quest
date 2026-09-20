<script setup>
import { computed } from 'vue'
import { session, resetSession } from './state/session.js'
import HomeView from './views/HomeView.vue'
import ModeView from './views/ModeView.vue'
import PlayView from './views/PlayView.vue'
import ReportView from './views/ReportView.vue'

const view = computed(() => session.phase)

function onReset() {
  if (confirm('Сбросить текущую сессию и начать заново?')) resetSession()
}
</script>

<template>
  <div class="app-shell">
    <header class="brand-row">
      <div class="brand">
        <strong>Domain Quest</strong>
        <span>игра-исследование предметной области</span>
      </div>
      <button v-if="view !== 'home'" class="btn ghost" type="button" @click="onReset">
        Сначала
      </button>
    </header>

    <HomeView v-if="view === 'home'" />
    <ModeView v-else-if="view === 'mode'" />
    <PlayView v-else-if="view === 'play'" />
    <ReportView v-else-if="view === 'report'" />
  </div>
</template>
