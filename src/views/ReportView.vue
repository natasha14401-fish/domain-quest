<script setup>
import { reactive, ref, watch } from 'vue'
import {
  session,
  scenario,
  coverage,
  buildDomainMarkdown,
  validateNote,
} from '../state/session.js'
import { topicOrder, topicMeta } from '../data/scenarios.js'

const copied = ref(false)
const preview = ref(buildDomainMarkdown())
const noteErrors = reactive({})
const lastGood = reactive({ ...session.notes })

watch(
  () => [session.notes, session.discoveredIds, session.mode],
  () => {
    preview.value = buildDomainMarkdown()
  },
  { deep: true },
)

function refreshPreview() {
  preview.value = buildDomainMarkdown()
}

function onNoteBlur(topic) {
  const text = session.notes[topic] || ''
  if (!text.trim()) {
    noteErrors[topic] = ''
    lastGood[topic] = ''
    refreshPreview()
    return
  }
  const check = validateNote(topic, text)
  if (!check.ok) {
    noteErrors[topic] = check.message
    session.notes[topic] = lastGood[topic] || ''
    refreshPreview()
    return
  }
  noteErrors[topic] = ''
  lastGood[topic] = text
  refreshPreview()
}

function onNoteInput(topic) {
  if (noteErrors[topic]) noteErrors[topic] = ''
  refreshPreview()
}

async function copyMd() {
  refreshPreview()
  await navigator.clipboard.writeText(preview.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}

function downloadMd() {
  refreshPreview()
  const blob = new Blob([preview.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `предметная-область-${session.scenarioId || 'domain'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

function backToPlay() {
  session.phase = 'play'
}
</script>

<template>
  <section v-if="scenario" class="report fade-up">
    <div class="head">
      <div>
        <p class="eyebrow">Результат исследования</p>
        <h1>Описание предметной области</h1>
        <p class="sub">
          Открыто {{ coverage.found }} из {{ coverage.total }} учебных фактов.
          Отредактируйте разделы по существу: без отписок и ненормативной лексики. Затем экспортируйте Markdown для отчёта и диаграмм.
        </p>
      </div>
      <div class="actions">
        <button class="btn secondary" type="button" @click="backToPlay">Доработать</button>
        <button class="btn secondary" type="button" @click="copyMd">
          {{ copied ? 'Скопировано' : 'Копировать MD' }}
        </button>
        <button class="btn" type="button" @click="downloadMd">Скачать .md</button>
      </div>
    </div>

    <div class="layout">
      <div class="editor panel">
        <div v-for="t in topicOrder" :key="t" class="block">
          <label :for="'note-' + t">{{ topicMeta[t].label }}</label>
          <textarea
            :id="'note-' + t"
            v-model="session.notes[t]"
            class="field"
            :class="{ invalid: noteErrors[t] }"
            rows="4"
            maxlength="1600"
            @input="onNoteInput(t)"
            @blur="onNoteBlur(t)"
          />
          <p v-if="noteErrors[t]" class="field-error">{{ noteErrors[t] }}</p>
        </div>
      </div>

      <div class="preview panel">
        <div class="preview-head">
          <h2>Предпросмотр</h2>
          <span class="tag">Markdown</span>
        </div>
        <pre>{{ preview }}</pre>
      </div>
    </div>
  </section>
</template>

<style scoped>
.report {
  display: grid;
  gap: 1rem;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: var(--muted);
  font-weight: 600;
}

h1 {
  margin: 0.2rem 0 0.35rem;
  font-family: var(--font-display);
  letter-spacing: -0.03em;
  font-size: clamp(1.6rem, 3vw, 2.1rem);
}

.sub {
  margin: 0;
  color: var(--muted);
  max-width: 54ch;
  line-height: 1.45;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.editor,
.preview {
  padding: 1rem;
}

.block {
  display: grid;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}

.block label {
  font-weight: 600;
  font-size: 0.92rem;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.preview-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #24352e;
  max-height: 70vh;
  overflow: auto;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
