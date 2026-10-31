export const PLAN_START = new Date(2026, 9, 31)
export const PLAN_LIMIT = 365

export function moscowToday() {
  const stamp = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const [year, month, day] = stamp.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WEEK = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

export function planDayForDate(date) {
  const start = new Date(PLAN_START)
  start.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - start.getTime()) / 86400000) + 1
  if (diff < 1 || diff > PLAN_LIMIT) return null
  return diff
}

export function dateForDay(dayNumber) {
  const date = new Date(PLAN_START)
  date.setDate(date.getDate() + dayNumber - 1)
  return date
}

export function formatLong(date) {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatWeekday(date) {
  return WEEK[date.getDay()]
}

export function monthTitle(date) {
  return `${MONTHS_NOM[date.getMonth()]} ${date.getFullYear()}`
}

export function isoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function calendarCells() {
  const end = dateForDay(30)
  const cursor = new Date(PLAN_START)
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7))
  const cells = []
  while (cursor <= end || cells.length % 7 !== 0) {
    cells.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
    if (cells.length > 42) break
  }
  return cells
}

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
