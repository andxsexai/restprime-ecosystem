import { contentPlan } from '../data/contentPlan.js'
import { occupancyForDay } from '../data/november2026.js'
import { dateForDay, formatLong, isoDate, planDayForDate, weekdayIndex } from './planDates.js'
import { composePost, seasonDay } from './writer.js'

// Рубрика по дню недели — только для дат вне 30-дневного плана.
// Массив идёт от воскресенья: weekdayIndex() возвращает getDay().
export const WEEKDAY_RUBRIC = [
  { id: 'silence', title: 'Тишина', rubric: 'sense', pillar: 'Зал' },
  { id: 'note', title: 'Заметка', rubric: 'sense', pillar: 'Быт' },
  { id: 'dispute', title: 'Спор', rubric: 'engage', pillar: 'Гости' },
  { id: 'nostalgia', title: 'Ностальгия', rubric: 'people', pillar: 'Гости' },
  { id: 'event', title: 'Событие', rubric: 'events', pillar: 'Повод' },
  { id: 'guest', title: 'Гость', rubric: 'service', pillar: 'Гости' },
  { id: 'backstage', title: 'Закулисье', rubric: 'kitchen', pillar: 'Меню' },
]

export const RUBRIC_TITLE = {
  sense: 'Сенсорика',
  kitchen: 'Кухня изнутри',
  events: 'События',
  people: 'Люди',
  engage: 'Вовлечение',
  service: 'Сервис',
}

export const WEEKDAY = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

const QUESTION = {
  sense: 'Что вы слышите первым, когда входите: зал или собственные мысли?',
  kitchen: 'Какое блюдо вы бы заказали, если бы его принесли без описания?',
  events: 'Что в празднике важнее — люди за столом или сама программа?',
  people: 'Кто за вашим столом обычно заказывает за всех?',
  engage: 'Остаться до полуночи или уехать после десерта — что честнее для буднего вечера?',
  service: 'Дата уже стоит в календаре или пока живёт в переписке?',
}

const ART_QUESTION = 'Что вам ближе — смотреть, как работает художник, или самому взять кисть?'

const TAG = {
  sense: '#ТишинаВКедре',
  kitchen: '#КухняКедра',
  events: '#СобытияКедра',
  people: '#ГостиКедра',
  engage: '#РазговорЗаСтолом',
  service: '#СтолВКедре',
}

export const PALETTE = 'тёмно-хвойный зелёный, медь #B87333, кремовый #F1E8D6, мох, кедр, свечи, лён, керамика'
export const NEGATIVE = 'Негатив: текст в кадре, стоковые улыбки, пластиковая кожа, рамки, пафос.'
const LIGHT = 'Свет: тёплые свечи и мягкое дневное окно, светотень, без студийного софтбокса.'
const OPTICS = 'Малая ГРИП, кремовое боке, тонкое зерно, реалистичная кожа, candid, без позирования.'

const LENS = { emotion: '85mm f/1.4', macro: '100mm macro', wide: '50mm f/1.2', motion: '35mm f/2' }

const FORMAT_TIME = { 'афиша': '12:00–14:00', reel: '19:00–21:00', 'пост': '19:00–21:00' }

export function dayFormat(dayNumber, slot) {
  if (slot?.status === 'booked') return 'без поста'
  if (slot?.status === 'event' && slot.event) return 'афиша'
  if (dayNumber && dayNumber % 5 === 0) return 'reel'
  return 'пост'
}

function questionFor(rubricId, day) {
  if (rubricId === 'events' && /арт|художник|холст/i.test(`${day?.event?.title || ''} ${day?.title || ''}`)) {
    return ART_QUESTION
  }
  return QUESTION[rubricId] || QUESTION.sense
}

function subjectOf(day) {
  const dish = String(day?.dish || '').trim()
  if (!dish || dish.startsWith('без тарелки')) return 'зал без тарелки: дерево, лён, приборы, окно в сосны'
  return dish
}

const PLACE = 'Тихо-люксовый ресторан в сосновом лесу: панорамные окна, камин, хвоя за стеклом, керамика и лён на столе.'

// Правило трёх кадров: макро-эмоция → предметка → движение.
export function photoPrompts(day, event) {
  const subject = subjectOf(day)
  const occasion = event?.title ? `Повод: ${event.title}. ` : ''
  return [
    {
      id: 'emotion',
      label: 'Кадр 1 · макро-эмоция',
      lens: LENS.emotion,
      prompt: `${PLACE} ${occasion}Крупно руки и фрагмент лица без улыбки в камеру: пауза между фразами, свеча рядом. ${LIGHT} ${OPTICS} Палитра: ${PALETTE}. ${NEGATIVE}`,
    },
    {
      id: 'subject',
      label: 'Кадр 2 · предметка',
      lens: LENS.macro,
      prompt: `${PLACE} Предметный кадр: ${subject}. Пар, текстура, медь и керамика, натёртый лён. ${LIGHT} ${OPTICS} Палитра: ${PALETTE}. ${NEGATIVE}`,
    },
    {
      id: 'motion',
      label: 'Кадр 3 · движение',
      lens: LENS.motion,
      prompt: `${PLACE} ${occasion}Живое движение в зале: гость вешает пальто, рука тянется к бокалу, огонь в камине. Люди не смотрят в камеру. ${LIGHT} ${OPTICS} Палитра: ${PALETTE}. ${NEGATIVE}`,
    },
  ]
}

export function photoGeneralPrompt() {
  return `Общий кадр зала: ${LENS.wide}, панорамные окна в сосны, камин, свечи, лён и керамика. Палитра: ${PALETTE}. ${OPTICS} ${NEGATIVE}`
}

export function afishaBlocks(day, date) {
  if (!day?.event?.title) return null
  const tel = '+7 (929) 979-53-54'
  return {
    canvas: '1080×1350 (4:5). Текст накладывается в Figma/Canva, не в кадре.',
    background: `Фон без текста: зал в соснах вечером, камин и свечи на втором плане, свободная нижняя треть под заголовок. Медь #B87333 и кремовый #F1E8D6 в свете, тёмно-хвойный зелёный в тенях. ${LENS.wide}, малая ГРИП, зерно, реалистично, без людей, смотрящих в камеру. ${NEGATIVE}`,
    blocks: [
      { role: 'Логотип', text: 'KEDR', place: 'сверху по центру', font: 'Prata', size: '28–32 px' },
      { role: 'Дата', text: formatLong(date), place: 'над заголовком, нижняя треть', font: 'Inter Medium', size: '24 px' },
      { role: 'Заголовок', text: day.event.title, place: 'нижняя треть, 2 строки', font: 'Prata', size: '64–72 px' },
      { role: 'Подзаголовок', text: day.event.hook || day.title, place: 'под заголовком', font: 'Inter', size: '28 px' },
      { role: 'Телефон', text: `${tel} · д. Зайцево, ул. Сосновая, 3`, place: 'внизу по центру', font: 'Inter', size: '24 px' },
    ],
  }
}

export function publishChecklist(format) {
  const window = FORMAT_TIME[format] || '19:00–21:00'
  return [
    `Время публикации: ${window}${window === '12:00–14:00' ? ' (афиша — днём, пока выбирают вечер)' : ''}.`,
    'Первый час: на каждый комментарий отвечать вопросом на вопрос, а не «спасибо».',
    'Не удалять пост сутки — даже если кажется, что «не зашло».',
    'Один топик-тег, без гирлянды хештегов.',
    'После публикации: отметить день выполненным и внести охват, ответы, лайки.',
  ]
}

// Собирает пакет из уже готового дня кабинета: правки и статусы не теряются.
export function dailyFromDay(day, slot, date = new Date()) {
  const target = new Date(date)
  const booked = slot?.status === 'booked'
  const event = slot?.event || day?.event || null
  const rubricId = day?.rubric || WEEKDAY_RUBRIC[weekdayIndex(target)].rubric
  const fallbackDay = { ...seasonDay(target, 0), day: day?.day || 1, funnel: 'trust' }
  const source = { ...fallbackDay, ...day, event }
  const format = dayFormat(day?.day, slot)
  const weekday = WEEKDAY_RUBRIC[weekdayIndex(target)]
  const inPlan = Boolean(day?.day && day.day <= contentPlan.length)

  let post = null
  if (!booked) {
    const body = source.postText ? source.postText : composePost(source, { date: target, rubric: rubricId, variant: 1 })
    post = [String(body).trim(), questionFor(rubricId, source), TAG[rubricId] || TAG.sense].join('\n\n')
  }

  return {
    date: isoDate(target),
    label: formatLong(target),
    weekday: WEEKDAY[weekdayIndex(target)],
    day: day?.day || null,
    inPlan,
    rubric: inPlan ? RUBRIC_TITLE[rubricId] || weekday.title : weekday.title,
    rubricId,
    format,
    booked,
    occupancy: slot ? slot.title : '',
    event,
    title: source.title || '',
    post,
    frames: booked ? [] : photoPrompts(source, event),
    afisha: format === 'афиша' ? afishaBlocks(source, target) : null,
    checklist: booked ? [] : publishChecklist(format),
  }
}

export function dailyPackage(date = new Date()) {
  const target = new Date(date)
  const dayNumber = planDayForDate(target)
  const inPlan = Boolean(dayNumber && dayNumber <= contentPlan.length)
  const slot = dayNumber ? occupancyForDay(dayNumber) : null
  const planItem = inPlan ? contentPlan[dayNumber - 1] : null
  const weekday = WEEKDAY_RUBRIC[weekdayIndex(target)]
  const source = planItem || { ...seasonDay(target, dayNumber ? dayNumber - 1 : 0), day: dayNumber || 1, rubric: weekday.rubric }
  return dailyFromDay({ ...source, rubric: planItem?.rubric || weekday.rubric }, slot, target)
}

/* Учёт. Записи живут в src/data/contentLog.json, пишет их scripts/daily-post.mjs. */

export function logEntry(entries = [], patch = {}) {
  if (!patch.date) return entries
  const current = entries.find((entry) => entry.date === patch.date) || { date: patch.date }
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  return [next, ...entries.filter((entry) => entry.date !== patch.date)]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 365)
}

const SWAP = {
  'Сенсорика': { to: 'Люди', why: 'атмосферные посты дают лайки, но мало ответов — разговор держат гости' },
  'Кухня изнутри': { to: 'События', why: 'блюдо без повода собирает меньше ответов, чем повод приехать' },
  'События': { to: 'Кухня изнутри', why: 'афиша зовёт приехать, но почти не вызывает разговора в комментариях' },
  'Люди': { to: 'Сенсорика', why: 'истории про гостей похожи друг на друга — нужен кадр зала' },
  'Вовлечение': { to: 'Люди', why: 'вопросы ради вопросов не работают, лучше конкретный гость за столом' },
  'Сервис': { to: 'События', why: 'сервисные посты читают, но не обсуждают' },
  'Заметка': { to: 'Событие', why: 'наблюдение без повода не собирает ответов' },
  'Спор': { to: 'Гость', why: 'спор уводит в сторону от стола — лучше живая история гостя' },
  'Ностальгия': { to: 'Заметка', why: 'воспоминания повторяются, нужен свежий кадр дня' },
  'Событие': { to: 'Закулисье', why: 'афиши без истории кухни быстро приедаются' },
  'Гость': { to: 'Тишина', why: 'гостевые посты просят лиц, а зал работает тише' },
  'Закулисье': { to: 'Ностальгия', why: 'кухня изнутри повторяется — нужен человеческий сюжет' },
  'Тишина': { to: 'Событие', why: 'тихие посты дают охват, но не ответы' },
}

export function weeklySummary(entries = [], endDate = new Date()) {
  const end = new Date(endDate)
  end.setHours(12, 0, 0, 0)
  const keys = new Set(Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(end)
    date.setDate(end.getDate() - offset)
    return isoDate(date)
  }))
  const week = entries.filter((entry) => keys.has(entry.date) && entry.published !== false)
  const rows = new Map()
  for (const entry of week) {
    const title = entry.rubric || 'Без рубрики'
    const row = rows.get(title) || { rubric: title, posts: 0, replies: 0, reach: 0, likes: 0 }
    row.posts += 1
    row.replies += Number(entry.replies) || 0
    row.reach += Number(entry.reach) || 0
    row.likes += Number(entry.likes) || 0
    rows.set(title, row)
  }
  const sorted = [...rows.values()]
    .map((row) => ({ ...row, perPost: row.posts ? Number((row.replies / row.posts).toFixed(1)) : 0 }))
    .sort((a, b) => b.perPost - a.perPost || b.reach - a.reach)
  const best = sorted[0] || null
  const rivals = sorted.filter((row) => row.rubric !== best?.rubric)
  const weakPool = rivals.filter((row) => row.posts >= 2)
  const weak = (weakPool.length ? weakPool : rivals)[(weakPool.length ? weakPool : rivals).length - 1] || null
  const swap = weak ? SWAP[weak.rubric] || null : null
  return {
    from: isoDate(new Date(end.getTime() - 6 * 86400000)),
    to: isoDate(end),
    posts: week.length,
    replies: week.reduce((sum, entry) => sum + (Number(entry.replies) || 0), 0),
    rows: sorted,
    best,
    weak,
    swap: swap && swap.to !== best?.rubric ? swap : null,
    note: week.length ? (week.length < 3 ? 'Публикаций меньше трёх — сводка показывает только то, что есть, без решительных выводов.' : '') : 'За неделю нет отмеченных публикаций — сводку считать не из чего.',
  }
}

export function planTable() {
  return contentPlan.map((item) => {
    const date = dateForDay(item.day)
    const slot = occupancyForDay(item.day)
    return {
      day: item.day,
      date: isoDate(date),
      label: formatLong(date),
      weekday: WEEKDAY[weekdayIndex(date)],
      rubric: RUBRIC_TITLE[item.rubric] || item.rubric,
      format: dayFormat(item.day, slot),
      title: item.title,
      event: slot?.event?.title || (slot?.status === 'booked' ? slot.title : ''),
    }
  })
}
