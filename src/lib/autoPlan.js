import { contentPlan } from '../data/contentPlan.js'
import { shownPost } from './compose.js'
import { dateForDay, formatLong } from './planDates.js'
import { CLOSERS, composePost, composeWide, occasionFor, sentenceKey } from './writer.js'

const SERVICE_LINE = /kedr-res\.ru|274-53-54|979-53-54|сосновая|12:00|#kedr|10%/i
const CLOSER_KEYS = new Set(CLOSERS.map(sentenceKey))

export function sentencesOf(text) {
  return String(text || '')
    .split(/\n+|(?<=[.!?…])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 24 && !SERVICE_LINE.test(part) && !CLOSER_KEYS.has(sentenceKey(part)))
}

export function findRepeats(days) {
  const owners = new Map()
  const titles = new Map()
  for (const day of days) {
    for (const line of new Set(sentencesOf(shownPost(day)).map(sentenceKey))) {
      owners.set(line, [...(owners.get(line) || []), day.day])
    }
    const title = sentenceKey(day.title)
    titles.set(title, [...(titles.get(title) || []), day.day])
  }
  const result = {}
  for (const [line, list] of owners) {
    if (list.length < 2) continue
    for (const dayNumber of list) {
      const entry = result[dayNumber] || { lines: 0, with: new Set(), title: false }
      entry.lines += 1
      list.filter((other) => other !== dayNumber).forEach((other) => entry.with.add(other))
      result[dayNumber] = entry
    }
  }
  for (const list of titles.values()) {
    if (list.length < 2) continue
    for (const dayNumber of list) {
      const entry = result[dayNumber] || { lines: 0, with: new Set(), title: false }
      entry.title = true
      list.filter((other) => other !== dayNumber).forEach((other) => entry.with.add(other))
      result[dayNumber] = entry
    }
  }
  return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, { ...value, with: [...value.with].sort((a, b) => a - b) }]))
}

export function repeatNote(entry) {
  if (!entry) return ''
  const dates = entry.with.slice(0, 3).map((other) => formatLong(dateForDay(other))).join(', ')
  const what = entry.title ? 'тот же заголовок' : entry.lines === 1 ? 'одна фраза' : `${entry.lines} фразы`
  return `Повтор: ${what}, как ${dates}`
}

function pickTopic(day, topics, usage) {
  let best = null
  for (const topic of topics) {
    if ((usage[topic.id] || 0) >= 2) continue
    const score = (topic.pillars.includes(day.pillar) ? 3 : 0) + Math.min(topic.count, 6) - (usage[topic.id] || 0) * 2
    if (topic.pillars.includes(day.pillar) && (!best || score > best.score)) best = { topic, score }
  }
  return best?.topic || null
}

function cleanTitle(day, takenTitles) {
  const source = contentPlan.find((item) => item.day === day.day)
  const key = sentenceKey(day.title)
  if (source && (takenTitles.has(key) || !day.title)) return source.title
  return day.title
}

export function locked(day) {
  return day.status === 'approved' || day.status === 'agreed' || day.manual
}

export function autoPlan(days, { signals, fromDay = 1, only, force = false, variant = 0 } = {}) {
  const targets = new Set(days
    .filter((day) => day.day >= fromDay && (only ? only.includes(day.day) : true) && (force || !locked(day)))
    .map((day) => day.day))
  const used = new Set()
  const takenTitles = new Set()
  for (const day of days) {
    if (targets.has(day.day)) continue
    sentencesOf(shownPost(day)).forEach((line) => used.add(sentenceKey(line)))
    takenTitles.add(sentenceKey(day.title))
  }
  const usage = {}
  const topics = signals?.topics || []
  const changed = []
  const next = days.map((day) => {
    if (!targets.has(day.day)) return day
    const date = dateForDay(day.day)
    const occasion = occasionFor(date)
    const topic = occasion ? null : pickTopic(day, topics, usage)
    if (topic) usage[topic.id] = (usage[topic.id] || 0) + 1
    const title = cleanTitle(day, takenTitles)
    takenTitles.add(sentenceKey(title))
    const base = { ...day, title }
    const options = { date, occasion, topic, used, variant }
    const why = []
    if (occasion) why.push(occasion.label)
    if (topic) why.push(`в лентах: «${topic.label}», ${topic.count}`)
    if (!why.length) why.push(`сцена дня: ${day.scene}`)
    const patch = {
      title,
      status: day.status === 'approved' || day.status === 'agreed' ? 'review' : day.status,
      auto: { why, refs: topic?.refs || [], at: signals?.fetchedAt || '' },
    }
    if (day.format === 'wide') patch.wideText = composeWide(base, options)
    else patch.postText = composePost(base, options)
    changed.push(day.day)
    return { ...day, ...patch }
  })
  return { days: next, changed }
}
