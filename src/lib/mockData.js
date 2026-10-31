import { shownPost, wordCount } from './compose.js'

export function weekSeries(days, todayNumber = 1) {
  const start = Math.max(1, Number(todayNumber) || 1)
  return days
    .filter((day) => day.day >= start && day.day < start + 7)
    .map((day) => ({
      label: `${day.day}`,
      words: wordCount(shownPost(day)),
    }))
}

export function statusSeries(days) {
  return [
    { name: 'На проверке', value: days.filter((day) => day.status !== 'approved' && day.status !== 'agreed').length },
    { name: 'Утвердил', value: days.filter((day) => day.status === 'approved').length },
    { name: 'Согласовано', value: days.filter((day) => day.status === 'agreed').length },
  ]
}
