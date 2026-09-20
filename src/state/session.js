import { reactive, computed, watch } from 'vue'
import { getScenario, topicOrder, topicMeta } from '../data/scenarios.js'
import { validateStudentText, textContainsKey } from '../lib/textGuard.js'

const STORAGE_KEY = 'domain-quest-session-v1'

function emptyNotes() {
  return Object.fromEntries(topicOrder.map((t) => [t, '']))
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const saved = load()

export const session = reactive({
  scenarioId: saved?.scenarioId ?? null,
  mode: saved?.mode ?? null, // 'analyst' | 'stakeholder' | 'both'
  phase: saved?.phase ?? 'home', // home | mode | play | report
  discoveredIds: saved?.discoveredIds ?? [],
  chat: saved?.chat ?? [],
  interviewIndex: saved?.interviewIndex ?? 0,
  interviewAnswers: saved?.interviewAnswers ?? {},
  notes: saved?.notes ?? emptyNotes(),
  bothTrack: saved?.bothTrack ?? 'analyst', // which side in "both"
})

watch(
  session,
  (value) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scenarioId: value.scenarioId,
        mode: value.mode,
        phase: value.phase,
        discoveredIds: value.discoveredIds,
        chat: value.chat,
        interviewIndex: value.interviewIndex,
        interviewAnswers: value.interviewAnswers,
        notes: value.notes,
        bothTrack: value.bothTrack,
      }),
    )
  },
  { deep: true },
)

export const scenario = computed(() => getScenario(session.scenarioId))

export const coverage = computed(() => {
  const s = scenario.value
  if (!s) return { found: 0, total: 0, byTopic: {} }
  const byTopic = {}
  let found = 0
  let total = 0
  for (const topic of topicOrder) {
    const facts = s.topics[topic].facts
    const hit = facts.filter((f) => session.discoveredIds.includes(f.id)).length
    byTopic[topic] = { hit, total: facts.length, label: topicMeta[topic].label }
    found += hit
    total += facts.length
  }
  return { found, total, byTopic }
})

export function resetSession() {
  session.scenarioId = null
  session.mode = null
  session.phase = 'home'
  session.discoveredIds = []
  session.chat = []
  session.interviewIndex = 0
  session.interviewAnswers = {}
  session.notes = emptyNotes()
  session.bothTrack = 'analyst'
}

export function selectScenario(id) {
  session.scenarioId = id
  session.discoveredIds = []
  session.chat = []
  session.interviewIndex = 0
  session.interviewAnswers = {}
  session.notes = emptyNotes()
  session.phase = 'mode'
}

export function selectMode(mode) {
  session.mode = mode
  session.bothTrack = mode === 'stakeholder' ? 'stakeholder' : 'analyst'
  session.phase = 'play'
  const s = scenario.value
  if (s && (mode === 'analyst' || mode === 'both')) {
    session.chat = [
      {
        id: crypto.randomUUID(),
        from: 'stakeholder',
        text: s.stakeholder.greeting,
      },
    ]
  }
}

export function discoverFact(factId) {
  if (!session.discoveredIds.includes(factId)) {
    session.discoveredIds.push(factId)
  }
}

export function discoverTopicFacts(topic, count = 1) {
  const s = scenario.value
  if (!s) return []
  const facts = s.topics[topic].facts.filter((f) => !session.discoveredIds.includes(f.id))
  const gained = facts.slice(0, count)
  gained.forEach((f) => discoverFact(f.id))
  return gained
}

export function matchStakeholderReply(question) {
  const s = scenario.value
  if (!s) return { text: 'Сначала выберите сценарий.', gained: [] }
  const q = question.toLowerCase()
  let best = null
  let bestTopic = null
  let score = 0

  for (const topic of topicOrder) {
    for (const ans of s.topics[topic].answers) {
      const hits = ans.keys.filter((k) => textContainsKey(q, k)).length
      if (hits > score) {
        score = hits
        best = ans
        bestTopic = topic
      }
    }
  }

  if (!best || score === 0) {
    return {
      text: 'Этот вопрос не про предметную область. Спросите про роли, процессы, данные, правила, проблемы или цели системы — своими словами и по делу.',
      gained: [],
      topic: null,
    }
  }

  const gained = discoverTopicFacts(bestTopic, score >= 2 ? 2 : 1)
  return { text: best.text, gained, topic: bestTopic }
}

export function askSuggested(topic) {
  const s = scenario.value
  if (!s) return
  const hints = s.topics[topic].hints
  const question = hints[Math.floor(Math.random() * hints.length)]
  askAsAnalyst(question, topic)
}

export function askAsAnalyst(question, forcedTopic = null) {
  const text = String(question ?? '').trim()
  if (!text) return { ok: false, message: 'Напишите вопрос своими словами.' }

  if (!forcedTopic) {
    const check = validateStudentText(text, { kind: 'question', scenario: scenario.value })
    if (!check.ok) return check
  }

  session.chat.push({ id: crypto.randomUUID(), from: 'analyst', text })

  let result
  if (forcedTopic) {
    const gained = discoverTopicFacts(forcedTopic, 1)
    const s = scenario.value
    const fallback = s.topics[forcedTopic].answers[0]?.text
    result = {
      text: fallback ?? 'Хороший вопрос по этой теме.',
      gained,
      topic: forcedTopic,
    }
  } else {
    result = matchStakeholderReply(text)
  }

  session.chat.push({
    id: crypto.randomUUID(),
    from: 'stakeholder',
    text: result.text,
    topic: result.topic,
    gained: result.gained.map((g) => g.id),
  })
  return { ok: true }
}

export function answerInterview(text) {
  const s = scenario.value
  if (!s) return { ok: false, message: 'Сначала выберите сценарий.' }
  const item = s.interview[session.interviewIndex]
  if (!item) return { ok: false, message: 'Интервью уже завершено.' }

  const check = validateStudentText(text, {
    kind: 'answer',
    scenario: s,
    prompt: item.question,
  })
  if (!check.ok) return check

  const answer = text.trim()
  session.interviewAnswers[item.id] = answer
  if (!session.notes[item.topic]) {
    session.notes[item.topic] = answer
  } else if (!session.notes[item.topic].includes(answer)) {
    session.notes[item.topic] += '\n' + answer
  }
  discoverTopicFacts(item.topic, 1)
  session.interviewIndex = Math.min(session.interviewIndex + 1, s.interview.length)
  return { ok: true }
}

export function validateNote(topic, text) {
  return validateStudentText(text, { kind: 'note', scenario: scenario.value })
}

export function switchBothTrack(track) {
  session.bothTrack = track
}

export function goToReport() {
  // Подтянуть факты в заметки, если пусто
  const s = scenario.value
  if (s) {
    for (const topic of topicOrder) {
      const facts = s.topics[topic].facts.filter((f) => session.discoveredIds.includes(f.id))
      if (!session.notes[topic] && facts.length) {
        session.notes[topic] = facts.map((f) => '• ' + f.text).join('\n')
      }
    }
  }
  session.phase = 'report'
}

export function buildDomainMarkdown() {
  const s = scenario.value
  if (!s) return ''
  const lines = [
    `# Описание предметной области: ${s.title}`,
    '',
    `> Собрано в Domain Quest · режим: ${modeLabel(session.mode)}`,
    '',
    '## 1. Краткое введение',
    s.subtitle + '. ' + s.tone + '.',
    '',
  ]

  const sectionTitles = {
    actors: '2. Действующие лица (акторы)',
    processes: '3. Бизнес-процессы',
    data: '4. Основные сущности и данные',
    rules: '5. Бизнес-правила и ограничения',
    problems: '6. Проблемы текущего состояния (as-is)',
    goals: '7. Цели будущей информационной системы (to-be)',
  }

  for (const topic of topicOrder) {
    lines.push(`## ${sectionTitles[topic]}`)
    const note = session.notes[topic]?.trim()
    const facts = s.topics[topic].facts.filter((f) => session.discoveredIds.includes(f.id))
    if (note) lines.push(note)
    else if (facts.length) lines.push(...facts.map((f) => `- ${f.text}`))
    else lines.push('_Пока недостаточно данных — вернитесь к интервью._')
    lines.push('')
  }

  lines.push('## 8. Что дальше (для проектирования)')
  lines.push('- Use Case / диаграмма вариантов использования — из раздела акторов и процессов')
  lines.push('- Диаграмма классов / ER — из сущностей и правил')
  lines.push('- Activity / BPMN — из процессов as-is и to-be')
  lines.push('- Требования — из проблем и целей')
  lines.push('')

  return lines.join('\n')
}

function modeLabel(mode) {
  if (mode === 'analyst') return 'аналитик задаёт вопросы'
  if (mode === 'stakeholder') return 'заказчик отвечает системе'
  if (mode === 'both') return 'оба режима'
  return 'не выбран'
}
