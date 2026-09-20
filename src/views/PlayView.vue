<script setup>
import { computed, ref } from 'vue'
import {
  session,
  scenario,
  coverage,
  askAsAnalyst,
  askSuggested,
  answerInterview,
  switchBothTrack,
  goToReport,
} from '../state/session.js'
import { topicOrder, topicMeta, scenarioNumber } from '../data/scenarios.js'
import CoveragePanel from '../components/CoveragePanel.vue'

const draft = ref('')
const interviewDraft = ref('')
const formError = ref('')
const chatBox = ref(null)

const track = computed(() => {
  if (session.mode === 'both') return session.bothTrack
  return session.mode
})

const interviewDone = computed(() => {
  const s = scenario.value
  if (!s) return true
  return session.interviewIndex >= s.interview.length
})

const currentInterview = computed(() => {
  const s = scenario.value
  if (!s) return null
  return s.interview[session.interviewIndex] ?? null
})

const exampleActor = computed(() => {
  const fact = scenario.value?.topics?.actors?.facts?.[0]?.text || ''
  const head = fact.split(/[:.—–]/)[0].trim()
  const word = head.split(/\s+/)[0]?.replace(/[^а-яёa-z-]/gi, '') || ''
  return word || 'сотрудник'
})

const questionExamples = computed(() => {
  const actor = exampleActor.value
  const title = scenario.value?.title || 'этой системе'
  return [
    `Здравствуйте, какие роли есть?`,
    `Что делает ${actor}?`,
    `Как устроен основной процесс в «${title}»?`,
    `Какие данные и правила нельзя нарушать?`,
  ]
})

const questionPlaceholder = computed(
  () => `Например: Здравствуйте, какие роли есть в «${scenario.value?.title || 'системе'}»?`,
)

function sendQuestion() {
  const result = askAsAnalyst(draft.value)
  if (!result.ok) {
    formError.value = result.message
    return
  }
  formError.value = ''
  draft.value = ''
  queueMicrotask(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}

function sendInterview() {
  const result = answerInterview(interviewDraft.value)
  if (!result.ok) {
    formError.value = result.message
    return
  }
  formError.value = ''
  interviewDraft.value = ''
}

function clearError() {
  if (formError.value) formError.value = ''
}

function useHint(topic) {
  formError.value = ''
  askSuggested(topic)
  queueMicrotask(() => {
    if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
  })
}
</script>

<template>
  <section v-if="scenario" class="play fade-up">
    <div class="top">
      <div>
        <p class="eyebrow">Сценарий {{ String(scenarioNumber(scenario.id)).padStart(2, '0') }} · {{ scenario.title }}</p>
        <h1>
          <template v-if="track === 'analyst'">Интервью с заказчиком</template>
          <template v-else>Вы — эксперт предметной области</template>
        </h1>
        <p class="sub">
          <template v-if="track === 'analyst'">
            {{ scenario.stakeholder.name }}, {{ scenario.stakeholder.role }}.
            Спрашивайте про этот сценарий: роли, процессы, данные, правила, проблемы и цели.
          </template>
          <template v-else>
            Отвечайте по делу и своими словами: без отписок и ненормативной лексики. Ответы попадут в описание.
          </template>
        </p>
      </div>
      <div class="top-actions">
        <div v-if="session.mode === 'both'" class="tabs">
          <button
            class="tab"
            :class="{ active: session.bothTrack === 'analyst' }"
            type="button"
            @click="switchBothTrack('analyst'); clearError()"
          >
            Аналитик
          </button>
          <button
            class="tab"
            :class="{ active: session.bothTrack === 'stakeholder' }"
            type="button"
            @click="switchBothTrack('stakeholder'); clearError()"
          >
            Заказчик
          </button>
        </div>
        <button class="btn" type="button" @click="goToReport">К описанию</button>
      </div>
    </div>

    <div class="layout">
      <div class="main panel">
        <template v-if="track === 'analyst'">
          <div ref="chatBox" class="chat">
            <div
              v-for="msg in session.chat"
              :key="msg.id"
              class="bubble"
              :class="msg.from"
            >
              <strong>{{ msg.from === 'analyst' ? 'Вы' : scenario.stakeholder.name }}</strong>
              <p>{{ msg.text }}</p>
              <span v-if="msg.gained?.length" class="gain">
                +{{ msg.gained.length }} факт(ов) в карту знаний
              </span>
            </div>
          </div>

          <div class="ask-help">
            <p class="ask-help-title">Как задавать вопросы</p>
            <p>
              Пишите про <strong>{{ scenario.title }}</strong>: кто участвует, как идёт процесс,
              какие данные, правила, проблемы и цели. Можно начать с «здравствуйте».
              Не пишите «как дела» и не уходите от темы.
            </p>
            <ul>
              <li v-for="ex in questionExamples" :key="ex">{{ ex }}</li>
            </ul>
          </div>

          <div class="suggest">
            <span class="label">Или возьмите готовую тему:</span>
            <button
              v-for="t in topicOrder"
              :key="t"
              class="chip"
              type="button"
              @click="useHint(t)"
            >
              {{ topicMeta[t].label }}
            </button>
          </div>

          <form class="composer" @submit.prevent="sendQuestion">
            <input
              v-model="draft"
              class="field"
              :class="{ invalid: formError }"
              type="text"
              :placeholder="questionPlaceholder"
              maxlength="280"
              @input="clearError"
            />
            <button class="btn" type="submit" :disabled="!draft.trim()">Спросить</button>
            <p v-if="formError" class="field-error">{{ formError }}</p>
          </form>
        </template>

        <template v-else>
          <div v-if="!interviewDone && currentInterview" class="interview">
            <div class="step-tag">
              Вопрос {{ session.interviewIndex + 1 }} / {{ scenario.interview.length }}
              · {{ topicMeta[currentInterview.topic].label }}
            </div>
            <h2>{{ currentInterview.question }}</h2>
            <textarea
              v-model="interviewDraft"
              class="field"
              :class="{ invalid: formError }"
              :placeholder="currentInterview.placeholder"
              maxlength="1600"
              @input="clearError"
            />
            <p class="hint">
              Минимум несколько предложений по сценарию: кто, как, какие данные и правила. Мат и отписки не засчитываются.
            </p>
            <p v-if="formError" class="field-error">{{ formError }}</p>
            <button class="btn" type="button" :disabled="!interviewDraft.trim()" @click="sendInterview">
              Ответить
            </button>
          </div>
          <div v-else class="interview done">
            <h2>Интервью завершено</h2>
            <p>
              Ответы сохранены. Можно перейти к сборке описания или (в полном цикле)
              дополнительно поработать в режиме аналитика.
            </p>
            <button class="btn" type="button" @click="goToReport">Собрать описание</button>
          </div>
        </template>
      </div>

      <CoveragePanel />
    </div>
  </section>
</template>

<style scoped>
.play {
  display: grid;
  gap: 1rem;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
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
  font-size: clamp(1.5rem, 3vw, 2rem);
  letter-spacing: -0.03em;
}

.sub {
  margin: 0;
  color: var(--muted);
}

.top-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.tabs {
  display: inline-flex;
  padding: 0.2rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.55);
}

.tab {
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  color: var(--muted);
  font-weight: 600;
}

.tab.active {
  background: var(--accent);
  color: #f7fff9;
}

.layout {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 1rem;
  align-items: start;
}

.main {
  padding: 1rem;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.chat {
  flex: 1;
  overflow: auto;
  max-height: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-right: 0.25rem;
}

.bubble {
  max-width: 92%;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.7);
  animation: fadeUp 0.35s ease both;
}

.bubble.analyst {
  align-self: flex-end;
  background: color-mix(in srgb, var(--accent) 10%, white);
}

.bubble.stakeholder {
  align-self: flex-start;
}

.bubble strong {
  display: block;
  font-size: 0.78rem;
  color: var(--muted);
  margin-bottom: 0.25rem;
}

.bubble p {
  margin: 0;
  line-height: 1.45;
}

.gain {
  display: inline-block;
  margin-top: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--good);
}

.ask-help {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px dashed color-mix(in srgb, var(--accent) 35%, var(--line));
  background: color-mix(in srgb, var(--accent) 7%, white);
}

.ask-help-title {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.ask-help p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.ask-help ul {
  margin: 0.55rem 0 0;
  padding: 0 0 0 1.1rem;
  color: var(--ink);
  font-size: 0.88rem;
  line-height: 1.45;
}

.ask-help li + li {
  margin-top: 0.15rem;
}

.suggest {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
}

.label {
  font-size: 0.8rem;
  color: var(--muted);
  margin-right: 0.2rem;
}

.chip {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.65);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  color: var(--ink);
}

.chip:hover {
  border-color: color-mix(in srgb, var(--accent) 40%, var(--line));
}

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
}

.composer .field-error {
  grid-column: 1 / -1;
}

.hint {
  margin: 0;
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.4;
}

.interview {
  display: grid;
  gap: 0.9rem;
  padding: 0.5rem;
}

.interview h2 {
  margin: 0;
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.step-tag {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}

.interview.done p {
  color: var(--muted);
  line-height: 1.5;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .composer {
    grid-template-columns: 1fr;
  }
}
</style>
