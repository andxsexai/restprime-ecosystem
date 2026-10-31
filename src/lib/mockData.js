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
  const approved = days.filter((day) => day.status === 'approved').length
  const review = days.length - approved
  return [
    { name: 'На проверке', value: review },
    { name: 'Утверждено', value: approved },
  ]
}
