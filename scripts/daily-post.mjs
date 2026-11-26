import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dailyPackage, logEntry, photoGeneralPrompt, planTable, weeklySummary } from '../src/lib/dailyDesk.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOG_FILE = resolve(ROOT, 'src/data/contentLog.json')

const args = process.argv.slice(2)
const flag = (name) => args.includes(`--${name}`)
const value = (name) => {
  const at = args.indexOf(`--${name}`)
  return at >= 0 ? args[at + 1] : ''
}

function readLog() {
  if (!existsSync(LOG_FILE)) return []
  try {
    const parsed = JSON.parse(readFileSync(LOG_FILE, 'utf8'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLog(entries) {
  mkdirSync(dirname(LOG_FILE), { recursive: true })
  writeFileSync(LOG_FILE, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
}

function todayArg() {
  const raw = value('date')
  if (!raw) return new Date()
  const [year, month, day] = raw.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

function printPlan() {
  console.log('| День | Дата | День недели | Рубрика | Формат | Тема |')
  console.log('| --- | --- | --- | --- | --- | --- |')
  for (const row of planTable()) {
    const extra = row.event ? ` — ${row.event}` : ''
    console.log(`| ${row.day} | ${row.label} | ${row.weekday} | ${row.rubric} | ${row.format} | ${row.title}${extra} |`)
  }
}

function printPackage(pack) {
  const head = pack.inPlan ? `день ${pack.day} плана` : 'вне 30-дневного плана — рубрика по дню недели'
  console.log(`# ${pack.label}, ${pack.weekday} · ${pack.rubric} · формат: ${pack.format} (${head})`)
  if (pack.booked) {
    console.log(`\nЗал занят: ${pack.occupancy}. Пост на этот день не ставим.`)
    return
  }
  console.log(`\n## ПОСТ\n\n${pack.post}`)
  console.log('\n## ПРОМПТЫ ДЛЯ ФОТО')
  for (const frame of pack.frames) console.log(`\n${frame.label} · ${frame.lens}\n${frame.prompt}`)
  console.log(`\nОбщий кадр · 50mm f/1.2\n${photoGeneralPrompt()}`)
  if (pack.afisha) {
    console.log(`\n## АФИША\n\n${pack.afisha.canvas}`)
    console.log(`\nФон:\n${pack.afisha.background}`)
    console.log('\nТекстовые блоки:')
    for (const block of pack.afisha.blocks) {
      console.log(`- ${block.role}: «${block.text}» — ${block.place}, ${block.font}, ${block.size}`)
    }
  }
  console.log('\n## ЧЕК-ЛИСТ ПУБЛИКАЦИИ')
  for (const line of pack.checklist) console.log(`- ${line}`)
}

function printSummary(entries) {
  const report = weeklySummary(entries, todayArg())
  console.log(`# Сводка ${report.from} — ${report.to}\n`)
  if (report.note) {
    console.log(report.note)
    return
  }
  console.log('| Рубрика | Постов | Ответы | Охват | Лайки | Ответов на пост |')
  console.log('| --- | --- | --- | --- | --- | --- |')
  for (const row of report.rows) {
    console.log(`| ${row.rubric} | ${row.posts} | ${row.replies} | ${row.reach} | ${row.likes} | ${row.perPost} |`)
  }
  console.log(`\nБольше всего ответов на пост: ${report.best ? `${report.best.rubric} (${report.best.perPost})` : 'нет данных'}.`)
  if (report.swap) {
    console.log(`Слабая рубрика: ${report.weak.rubric} (${report.weak.perPost} отв./пост). На следующую неделю — заменить на «${report.swap.to}»: ${report.swap.why}.`)
  } else {
    console.log('Менять рубрику пока нет оснований: данных мало или лидеры совпадают.')
  }
  if (report.note) console.log(report.note)
}

if (flag('log')) {
  const date = value('date')
  if (!date) {
    console.error('Нужна дата: --log --date 2026-11-26 --replies 4 --reach 1800 --likes 42')
    process.exit(1)
  }
  const patch = { date, published: true }
  for (const key of ['replies', 'reach', 'likes', 'rubric', 'format', 'note']) {
    const raw = value(key)
    if (raw) patch[key] = key === 'replies' || key === 'reach' || key === 'likes' ? Number(raw) : raw
  }
  const entries = logEntry(readLog(), patch)
  writeLog(entries)
  const saved = entries.find((entry) => entry.date === date)
  console.log(`Учёт обновлён: ${date} · ${saved.rubric || 'рубрика не указана'} · ответы ${saved.replies || 0}, охват ${saved.reach || 0}, лайки ${saved.likes || 0}.`)
} else if (flag('summary')) {
  printSummary(readLog())
} else if (flag('plan')) {
  printPlan()
} else {
  printPackage(dailyPackage(todayArg()))
}
