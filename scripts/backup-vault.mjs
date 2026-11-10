import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { absorbDesk, collectDesk, emptyPurged } from '../src/lib/deskSync.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VAULT_PATH = resolve(ROOT, 'src/data/teamVault.json')
const PUBLIC_PATH = resolve(ROOT, 'public/teamVault.json')
const TOPIC = 'https://ntfy.sh/restprime-kedr-team-5d27e0b4/json?poll=1&since=all'

async function readVault() {
  try {
    return JSON.parse(await readFile(VAULT_PATH, 'utf8'))
  } catch {
    return { v: 1, at: 0, tasks: [], notes: [], taskLog: [], days: [], purged: emptyPurged() }
  }
}

async function pollTeam() {
  const response = await fetch(TOPIC, { cache: 'no-store' })
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
  const text = await response.text()
  return text.split('\n').filter(Boolean).map((line) => {
    try {
      const item = JSON.parse(line)
      if (item.event !== 'message') return null
      const event = JSON.parse(item.message)
      return event?.v === 1 ? { ...event, relayId: item.id, time: item.time } : null
    } catch {
      return null
    }
  }).filter(Boolean)
}

const vault = await readVault()
let next = {
  tasks: vault.tasks || [],
  notes: vault.notes || [],
  taskLog: vault.taskLog || [],
  days: vault.days || [],
  purged: vault.purged || emptyPurged(),
}

try {
  const events = await pollTeam()
  collectDesk(events).forEach((snap) => {
    next = absorbDesk(next, snap, '')
  })
} catch (error) {
  console.warn('ntfy недоступен, сейф остаётся как в git:', error.message)
}

const SKIP_IDS = new Set(['desk-phone-check', 'note-phone-check'])
next.tasks = (next.tasks || []).filter((item) => !SKIP_IDS.has(item.id))
next.notes = (next.notes || []).filter((item) => !SKIP_IDS.has(item.id) && (item.title || item.body))

const saved = {
  v: 1,
  at: Date.now(),
  tasks: next.tasks,
  notes: next.notes,
  taskLog: next.taskLog || [],
  days: next.days || vault.days || [],
  purged: next.purged || emptyPurged(),
}

const json = `${JSON.stringify(saved, null, 2)}\n`
await writeFile(VAULT_PATH, json)
await writeFile(PUBLIC_PATH, json)
console.log(`Сейф: ${saved.tasks.length} задач, ${saved.notes.length} заметок, ${saved.days.length} дней плана`)
