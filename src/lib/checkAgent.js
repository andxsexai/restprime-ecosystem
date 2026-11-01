import { shownPost, wordCount } from './compose.js'
import { findRepeats, repeatNote } from './autoPlan.js'
import { eventMentioned } from './eventDay.js'
import { CONTACT_LINES } from './writer.js'

const FORBIDDEN = [
  { id: 'pond', re: /пруд/i, text: 'Пруда у зала в кабинете нет — не обещаем.' },
  { id: 'hotel', re: /отел/i, text: 'Отель не обещаем.' },
  { id: 'tincture', re: /настоек|настойк/i, text: 'Настоек в меню нет. Есть глинтвейн, коктейль «Кедр», «Хвойный вечер».' },
  { id: 'hours', re: /с\s*1[38]:30|до\s*13:30|с\s*[89]:00|закрыт\s*в\s*23/i, text: 'Часы зала: каждый день с 12:00 до 24:00.' },
  { id: 'dayn', re: /день\s+\d{1,2}\b/i, text: 'В тексте для гостя не пишем «день N». Пишем дату, например «5 ноября».' },
  { id: 'insta', re: /instagram|инстаграм/i, ok: /kedr_zaytsevo/i, text: 'Instagram зала — @kedr_zaytsevo.' },
  { id: 'tg', re: /t\.me\/(?!kedrrest)\w+|telegram[^\n]{0,40}@(?!kedrrest)/i, text: 'Свой канал — @kedrrest. Чужие ссылки в пост зала не ставим.' },
]

function count(text, re) {
  return (String(text || '').match(new RegExp(re, 'g')) || []).length
}

function issuesFor(day, repeats = {}) {
  const text = shownPost(day)
  const issues = []
  const push = (level, id, textLine, fix) => issues.push({ level, id, text: textLine, fix })

  if (!text.trim()) push('stop', 'empty', 'Пост пустой.', 'Собрать текст агентом.')
  if (!/kedr-res\.ru/i.test(text)) push('fix', 'cta', 'Нет ссылки на бронь kedr-res.ru.', 'Добавить kedr-res.ru в конец.')
  if (count(text, /274-53-54/g) > 1 || count(text, /979-53-54/g) > 1) {
    push('fix', 'phone', 'Телефон задвоен.', 'Оставить одну строку: ' + CONTACT_LINES.phones)
  }
  if (count(text, /kedr-res\.ru/gi) > 2) push('fix', 'cta-dup', 'Ссылка на сайт повторяется слишком часто.', 'Оставить одну в конце.')
  if ((/рожд/i.test(`${day.scene} ${day.title} ${text}`) || day.event?.id === 'birthday') && !/10%/.test(text)) {
    push('stop', 'birthday', 'День рождения без скидки 10% на три дня до и после.', 'Вернуть правило скидки.')
  }
  if (day.event && !eventMentioned(text, day.event)) {
    push('stop', 'event', `На ${day.event.title} нет строки в посте.`, 'Мероприятие должно идти плюсом к тексту дня.')
  }
  if (day.format === 'wide' && wordCount(text) > 500) {
    push('fix', 'wide', `Широкий пост ${wordCount(text)} слов, лимит 500.`, 'Укоротить.')
  }
  if (repeats[day.day]) push('fix', 'repeat', repeatNote(repeats[day.day]), 'Пересобрать, чтобы фразы не совпадали с другими днями.')

  for (const rule of FORBIDDEN) {
    if (rule.re.test(text) && !(rule.ok && rule.ok.test(text))) push('stop', rule.id, rule.text, 'Убрать из текста.')
  }

  const quoted = text.match(/[«"]([^»"]{80,})[»"]/)
  if (quoted) push('stop', 'quote', 'Похоже на чужую цитату. Берём тему, не чужие фразы.', 'Пересобрать своим текстом.')

  return issues
}

export function checkDay(day, repeats = {}) {
  const issues = issuesFor(day, repeats)
  const level = issues.some((item) => item.level === 'stop') ? 'stop' : issues.length ? 'fix' : 'ok'
  return { day: day.day, title: day.title, event: day.event || null, level, issues }
}

export function checkPlan(days) {
  const repeats = findRepeats(days)
  const list = days.map((day) => checkDay(day, repeats))
  const stop = list.filter((item) => item.level === 'stop').length
  const fix = list.filter((item) => item.level === 'fix').length
  const ok = list.filter((item) => item.level === 'ok').length
  return { days: list, stop, fix, ok, total: list.length, repeats }
}
