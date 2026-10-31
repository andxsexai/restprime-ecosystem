import { contentPlan } from '../data/contentPlan.js'
import { PLAN_START, formatLong, isoDate, planDayForDate } from './planDates.js'
import { topicsOf } from './signals.js'
import { CONTACT_LINES, capital, composePost, seasonDay } from './writer.js'

export const RUBRICS = [
  { id: 'sense', title: 'Сенсорика' },
  { id: 'kitchen', title: 'Кухня изнутри' },
  { id: 'events', title: 'События' },
  { id: 'people', title: 'Люди' },
  { id: 'engage', title: 'Вовлечение' },
  { id: 'service', title: 'Сервис' },
]

const FOOTER = [CONTACT_LINES.address, CONTACT_LINES.hours, CONTACT_LINES.phones].join('\n')

export function generateTelegramPost(rubricId, day) {
  return `${composePost(day, { rubric: rubricId })}\n\n${FOOTER}`
}

export function adaptSourceToToday(day, sourceText) {
  const topic = topicsOf(sourceText)[0] || null
  return composePost(day, { topic, variant: 1 })
}

export function generateInfinitePlan(startDate = isoDate(PLAN_START), limit = 365) {
  const [year, month, day] = String(startDate).split('-').map(Number)
  const start = new Date(year, month - 1, day)
  if (Number.isNaN(start.getTime())) return []
  const used = new Set()

  return Array.from({ length: limit }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    if (index % 30 === 0) used.clear()
    const dayNumber = planDayForDate(date) || index + 1
    const live = dayNumber <= contentPlan.length
    const rubric = RUBRICS[index % RUBRICS.length]
    const source = live ? contentPlan[dayNumber - 1] : { ...seasonDay(date, index), day: dayNumber }
    const scene = source.scene
    return {
      id: isoDate(date),
      date: isoDate(date),
      label: formatLong(date),
      dayNumber,
      type: dayNumber % 5 === 0 ? 'reel' : 'post',
      rubric: rubric.title,
      rubricId: rubric.id,
      title: source.title,
      hook: live ? source.reelHook : `${capital(scene)}.`,
      scene,
      dish: source.dish,
      margin: source.margin,
      pillar: source.pillar,
      draft: `${composePost({ ...source, day: dayNumber }, { date, used })}\n\n${FOOTER}`,
      status: live ? 'plan' : 'draft',
      inCabinet: live,
    }
  })
}

export function planStartsOn() {
  return isoDate(PLAN_START)
}
