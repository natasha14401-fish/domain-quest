const MESSAGES = {
  empty: 'Напишите текст своими словами — пустое поле не принимается.',
  profanity: 'Ненормативная лексика недопустима. Переформулируйте спокойно и по существу.',
  nonsense: 'Похоже на набор символов. Напишите нормальное предложение на русском языке.',
  spam: 'Повторы, клавиатурная каша и бессмысленные символы не принимаются.',
  tooShortQuestion: 'Вопрос слишком короткий. Спросите про роли, процессы, данные, правила, проблемы или цели.',
  tooShortAnswer: 'Ответ слишком короткий. Нужно развёрнутое описание: кто участвует, как устроен процесс, какие данные и правила.',
  lazy: 'Отписка не засчитывается. Опишите конкретные факты по этому сценарию.',
  offTopicQuestion: 'Вопрос не про эту предметную область. Спросите, как устроена система, а не «как дела».',
  offTopicAnswer: 'Ответ не про выбранный сценарий. Упомяните роли, процессы, данные, правила, проблемы или цели именно этой системы.',
  copyPrompt: 'Нельзя сдавать сам вопрос как ответ. Напишите содержание своими словами.',
  tooLong: 'Слишком длинный текст. Сожмите до сути — без копипаста и воды.',
}

const LATIN_TO_CYR = {
  a: 'а',
  b: 'в',
  c: 'с',
  e: 'е',
  h: 'н',
  k: 'к',
  m: 'м',
  o: 'о',
  p: 'р',
  t: 'т',
  x: 'х',
  y: 'у',
}

const DIGIT_TO_LETTER = {
  0: 'о',
  1: 'и',
  3: 'е',
  4: 'ч',
  6: 'б',
}

const COMPACT_STEMS = [
  'хуй',
  'хуя',
  'хуе',
  'пизд',
  'пезд',
  'бляд',
  'блят',
  'ебал',
  'ебан',
  'ебат',
  'ебуч',
  'еблан',
  'залуп',
  'мудак',
  'мудил',
  'гандон',
  'гондон',
  'пидор',
  'пидар',
  'педик',
  'чмош',
  'мразь',
  'сучк',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'whore',
  'slut',
  'blyat',
  'blyad',
  'pidor',
  'pizd',
  'naxyi',
  'nahui',
  'govn',
  'жопа',
  'говн',
]

const WORD_STEMS = [...COMPACT_STEMS, 'бля', 'сука', 'чмо', 'хуй', 'хуи', 'еблан', 'уебан']

const LAZY_ANSWERS = [
  'не знаю',
  'хз',
  'без понятия',
  'потом',
  'лень',
  'неважно',
  'не важно',
  'как обычно',
  'ну такое',
  'пофиг',
  'по фиг',
  'фиг знает',
  'да',
  'нет',
  'ок',
  'окей',
  'ok',
  'yes',
  'no',
  'lol',
  'лол',
  'кек',
  'ахах',
  'ахаха',
  'тест',
  'test',
  'qwerty',
  'йцукен',
  'просто так',
  'нечего сказать',
  'все и так понятно',
  'и так понятно',
]

const KEYBOARD_ROWS = [
  'йцукенгшщзхъ',
  'фывапролджэ',
  'ячсмитьбю',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
]

const INTERROGATIVE_WORDS = [
  'кто',
  'кого',
  'кому',
  'кем',
  'что',
  'чего',
  'чему',
  'чем',
  'какой',
  'какая',
  'какое',
  'какие',
  'каким',
  'каких',
  'где',
  'куда',
  'откуда',
  'когда',
  'почему',
  'зачем',
  'как',
  'сколько',
  'опишите',
  'перечислите',
  'расскажите',
  'сформулируйте',
]

const CORE_LEXICON = [
  'роль',
  'пользовател',
  'сотрудник',
  'процесс',
  'систем',
  'данн',
  'правил',
  'огранич',
  'заказчик',
  'студент',
  'учет',
  'учёт',
  'заявк',
  'статус',
  'объект',
  'сущност',
  'атрибут',
  'хран',
  'цел',
  'проблем',
  'информац',
  'должен',
  'нужно',
  'нельзя',
  'можно',
  'шаг',
  'сценари',
  'предметн',
  'област',
  'требован',
  'диаграмм',
  'актор',
  'клиент',
  'оператор',
  'администратор',
  'расписан',
  'остат',
  'документ',
  'договор',
  'оплат',
  'каталог',
  'очеред',
  'уведомлен',
  'отчёт',
  'отчет',
  'запис',
  'прием',
  'приём',
  'выдач',
  'возврат',
  'функци',
  'обязанн',
  'задач',
  'полномоч',
  'тренир',
  'занят',
]

const VOWELS = /[аеёиоуыэюяaeiouy]/i

export function validateStudentText(text, options = {}) {
  const kind = options.kind || 'answer'
  const raw = String(text ?? '')
  const trimmed = raw.trim()

  if (!trimmed) return fail('empty')

  const maxLen = kind === 'question' ? 280 : 1600
  if (trimmed.length > maxLen) return fail('tooLong')

  if (hasProfanity(trimmed)) return fail('profanity')
  if (looksLikeSpam(trimmed)) return fail('spam')
  if (looksLikeNonsense(trimmed)) return fail('nonsense')

  if (kind === 'question') return validateQuestion(trimmed, options.scenario)
  if (kind === 'answer') {
    return validateAnswer(trimmed, options.scenario, options.prompt)
  }
  return validateNote(trimmed, options.scenario)
}

function fail(code) {
  return { ok: false, code, message: MESSAGES[code] }
}

function ok() {
  return { ok: true }
}

function validateQuestion(text, scenario) {
  const content = stripLeadGreetings(text)
  if (!content) return fail('offTopicQuestion')

  const words = wordList(content)
  if (content.length < 8 || words.length < 2) return fail('tooShortQuestion')
  if (isSmalltalk(content)) return fail('offTopicQuestion')

  const domainHits = countLexiconHits(content, scenario)
  if (domainHits >= 1) return ok()

  const analysisHits = countAnalysisHits(content)
  const questionLike = hasInterrogative(content) || content.includes('?') || hasInterrogative(text)
  if (questionLike && (analysisHits >= 1 || words.length >= 3)) return ok()
  return fail('offTopicQuestion')
}

function validateAnswer(text, scenario, prompt) {
  const words = wordList(text)
  if (text.length < 40 || words.length < 6) return fail('tooShortAnswer')
  if (isLazy(text)) return fail('lazy')
  if (prompt && isCopiedPrompt(text, prompt)) return fail('copyPrompt')

  const hits = countLexiconHits(text, scenario)
  const substantial = text.length >= 90 && words.length >= 10
  if (hits < 1 || (hits < 2 && !substantial)) return fail('offTopicAnswer')
  return ok()
}

function validateNote(text, scenario) {
  if (text.length < 24) return fail('tooShortAnswer')
  if (isLazy(text)) return fail('lazy')
  const hits = countLexiconHits(text, scenario)
  if (hits < 1 && wordList(text).length < 8) return fail('offTopicAnswer')
  return ok()
}

function hasInterrogative(text) {
  const n = text.toLowerCase().replace(/ё/g, 'е')
  if (/(^|[^а-яa-z])(можно|есть)\s+ли([^а-яa-z]|$)/i.test(n)) return true
  const padded = ` ${n.replace(/[^а-яa-z0-9]+/gi, ' ')} `
  return INTERROGATIVE_WORDS.some((w) => padded.includes(` ${w} `))
}

function isSmalltalk(text) {
  const n = stripLeadGreetings(text)
  if (!n) return true
  return [
    'как дела',
    'как жизнь',
    'что умеешь',
    'кто ты',
    'ты кто',
    'как тебя зовут',
    'какая погода',
    'чем занимаешься',
    'как настроение',
  ].some((p) => n === p || n.startsWith(p + ' '))
}

const GREETINGS = [
  'добрый день',
  'добрый вечер',
  'доброе утро',
  'день добрый',
  'здравствуйте',
  'здравствуй',
  'приветствую',
  'привет',
  'hello',
  'hi',
]

function stripLeadGreetings(text) {
  let n = String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[!?.,…:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  let changed = true
  while (changed && n) {
    changed = false
    for (const g of GREETINGS) {
      if (n === g) return ''
      if (n.startsWith(g + ' ')) {
        n = n.slice(g.length).trim()
        changed = true
        break
      }
    }
  }
  return n
}

const ANALYSIS_STEMS = [
  'функци',
  'обязанн',
  'задач',
  'полномоч',
  'роль',
  'процесс',
  'систем',
  'данн',
  'правил',
  'пользовател',
  'сотрудник',
  'заказчик',
  'работ',
  'делает',
  'выполн',
]

function countAnalysisHits(text) {
  const words = wordList(text)
  return ANALYSIS_STEMS.filter((stem) => words.some((w) => stemsMatch(w, stem)) || textContainsKey(text, stem))
    .length
}

function normalizeForProfanity(text) {
  let s = text.toLowerCase().replace(/ё/g, 'е')
  s = [...s]
    .map((ch) => {
      if (DIGIT_TO_LETTER[ch]) return DIGIT_TO_LETTER[ch]
      const mapped = LATIN_TO_CYR[ch]
      return mapped || ch
    })
    .join('')
  s = s.replace(/[^a-zа-я]+/g, '')
  s = s.replace(/(.)\1{2,}/g, '$1$1')
  return s
}

function hasProfanity(text) {
  const compact = normalizeForProfanity(text)
  if (COMPACT_STEMS.some((stem) => compact.includes(stem))) return true

  const words = text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[^a-zа-я0-9]+/i)
    .filter(Boolean)

  for (const word of words) {
    const w = normalizeForProfanity(word)
    if (!w) continue
    if (WORD_STEMS.some((stem) => w === stem || (stem.length >= 4 && w.startsWith(stem)))) return true
  }
  return false
}

function looksLikeSpam(text) {
  const compact = text.replace(/\s+/g, '')
  if (/(.)\1{5,}/.test(compact)) return true

  const letters = compact.replace(/[^a-zа-яё]/gi, '')
  if (letters.length >= 12) {
    const unique = new Set([...letters.toLowerCase()]).size
    if (unique <= 4) return true
  }

  const words = wordList(text)
  if (words.some(isKeyboardSmashWord)) return true
  return false
}

function isKeyboardSmashWord(word) {
  if (word.length < 5) return false
  for (const row of KEYBOARD_ROWS) {
    if ([...word].every((ch) => row.includes(ch))) return true
  }
  return false
}

function looksLikeNonsense(text) {
  const letters = (text.match(/[a-zа-яё]/gi) || []).length
  const chars = text.replace(/\s/g, '').length
  if (chars >= 8 && letters / chars < 0.55) return true
  if (letters >= 10 && !VOWELS.test(text)) return true

  const words = wordList(text)
  const realWords = words.filter((w) => w.length >= 3 && VOWELS.test(w))
  if (words.length >= 4 && realWords.length / words.length < 0.45) return true
  return false
}

function isLazy(text) {
  const n = text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[!?.,…]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return LAZY_ANSWERS.includes(n)
}

function isCopiedPrompt(answer, prompt) {
  const a = normalizeWords(answer)
  const p = normalizeWords(prompt)
  if (a.length < 12 || p.length < 12) return false
  if (a.includes(p) || p.includes(a)) return true

  const aw = new Set(wordList(answer).filter((w) => w.length > 3))
  const pw = wordList(prompt).filter((w) => w.length > 3)
  if (pw.length < 4) return false
  const overlap = pw.filter((w) => aw.has(w)).length
  return overlap / pw.length >= 0.8 && Math.abs(answer.length - prompt.length) < 24
}

function countLexiconHits(text, scenario) {
  const lexicon = collectLexicon(scenario)
  let hits = 0
  for (const stem of lexicon) {
    if (stem.length < 3) continue
    if (textContainsKey(text, stem)) hits += 1
  }
  return hits
}

export function textContainsKey(text, key) {
  const k = String(key || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim()
  if (!k) return false
  const hay = String(text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
  if (hay.includes(k)) return true
  const keyStem = stemWord(k)
  if (keyStem.length >= 3 && hay.includes(keyStem)) return true
  return wordList(text).some((w) => stemsMatch(w, k))
}

function stemsMatch(a, b) {
  if (!a || !b) return false
  if (a === b || a.startsWith(b) || b.startsWith(a)) return true
  const sa = stemWord(a)
  const sb = stemWord(b)
  if (sa.length >= 3 && sb.length >= 3 && (sa === sb || sa.startsWith(sb) || sb.startsWith(sa))) return true
  return false
}

function stemWord(word) {
  let s = String(word || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
  const endings = [
    'ами',
    'ями',
    'ого',
    'ему',
    'ыми',
    'ими',
    'ах',
    'ях',
    'ой',
    'ей',
    'ий',
    'ый',
    'ое',
    'ие',
    'ая',
    'яя',
    'ов',
    'ев',
    'ам',
    'ям',
    'ом',
    'ем',
    'ью',
    'ия',
    'ии',
    'ию',
    'ы',
    'и',
    'а',
    'я',
    'у',
    'ю',
    'е',
    'о',
    'ь',
  ]
  for (const ending of endings) {
    if (s.length - ending.length >= 3 && s.endsWith(ending)) {
      return s.slice(0, -ending.length)
    }
  }
  return s
}

function collectLexicon(scenario) {
  const bag = new Set(CORE_LEXICON)
  if (!scenario) return bag

  const chunks = [scenario.title, scenario.subtitle, scenario.tone, scenario.stakeholder?.role]
  for (const topic of Object.values(scenario.topics || {})) {
    for (const fact of topic.facts || []) chunks.push(fact.text)
    for (const ans of topic.answers || []) {
      chunks.push(ans.text)
      for (const key of ans.keys || []) bag.add(key.toLowerCase().replace(/ё/g, 'е'))
    }
  }
  for (const item of scenario.interview || []) chunks.push(item.question)

  for (const chunk of chunks) {
    for (const word of wordList(String(chunk || ''))) {
      if (word.length >= 4) bag.add(word)
    }
  }
  return bag
}

function wordList(text) {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[^a-zа-я0-9]+/i)
    .filter((w) => w.length > 1)
}

function normalizeWords(text) {
  return wordList(text).join(' ')
}
