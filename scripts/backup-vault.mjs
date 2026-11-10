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

function compactSignup(item) {
  const email = String(item?.email || '').trim().toLowerCase()
  if (!email) return null
  return {
    id: item.id || '',
    name: String(item.name || 'Сотрудник').slice(0, 80),
    email,
    role: item.role || 'director',
    at: item.at || '',
    status: item.status === 'rejected' ? 'rejected' : item.status === 'active' ? 'active' : 'pending',
  }
}

const vault = await readVault()
let next = {
  tasks: vault.tasks || [],
  notes: vault.notes || [],
  taskLog: vault.taskLog || [],
  days: vault.days || [],
  purged: vault.purged || emptyPurged(),
}
const signups = new Map((vault.signups || []).map((item) => {
  const packed = compactSignup(item)
  return packed ? [packed.email, packed] : null
}).filter(Boolean))

try {
  const events = await pollTeam()
  collectDesk(events).forEach((snap) => {
    next = absorbDesk(next, snap, '')
  })
  for (const event of events) {
    if (event.type === 'signup') {
      const packed = compactSignup(event)
      if (packed && !signups.has(packed.email)) signups.set(packed.email, packed)
    }
    if (event.type === 'decision' && event.email) {
      const email = String(event.email).trim().toLowerCase()
      const prev = signups.get(email)
      if (prev) signups.set(email, { ...prev, status: event.status === 'active' ? 'active' : 'rejected' })
    }
  }
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
  signups: [...signups.values()],
}

const json = `${JSON.stringify(saved, null, 2)}\n`
await writeFile(VAULT_PATH, json)
await writeFile(PUBLIC_PATH, json)
console.log(`Сейф: ${saved.tasks.length} задач, ${saved.notes.length} заметок, ${saved.days.length} дней плана, ${saved.signups.length} заявок`)
