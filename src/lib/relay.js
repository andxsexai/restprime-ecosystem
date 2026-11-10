import { ADMIN_EMAIL, roleLabel } from './auth.js'

const HOST = 'https://ntfy.sh'
const TEST = (() => {
  try { return new URLSearchParams(window.location.search).get('relay')?.replace(/[^\w-]/g, '') || '' } catch { return '' }
})()
export const PUSH_TOPIC = TEST ? `restprime-test-${TEST}-desk` : 'restprime-kedr-desk-4f8c2a91'
const DATA_TOPIC = TEST ? `restprime-test-${TEST}-sync` : 'restprime-kedr-sync-9b31d7e6'
const TEAM_TOPIC = TEST ? `restprime-test-${TEST}-team` : 'restprime-kedr-team-5d27e0b4'
export const RELAY_TEST = TEST
const SITE = 'https://andxsexai.github.io/restprime-ecosystem/'
export const PUSH_URL = `${HOST}/${PUSH_TOPIC}`

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

let publishChain = Promise.resolve()

function enqueuePublish(job) {
  const run = publishChain.then(job, job)
  publishChain = run.then(() => undefined, () => undefined)
  return run
}

async function publishOnce(body, attempt = 0) {
  const response = await withTimeout(fetch(HOST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
  if (response.status === 429 && attempt < 2) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    return publishOnce(body, attempt + 1)
  }
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
}

function publish(body) {
  return enqueuePublish(() => publishOnce(body))
}

function sendData(event) {
  return publish({ topic: DATA_TOPIC, message: JSON.stringify({ v: 1, ...event }) })
}

function push(title, message, tags) {
  return publish({ topic: PUSH_TOPIC, title, message, tags, priority: 4, click: SITE })
}

async function mail(subject, fields) {
  const response = await withTimeout(fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...fields }),
  }), 8000)
  if (!response.ok) throw new Error(`mail ${response.status}`)
}

async function settle(tasks) {
  const results = await Promise.allSettled(tasks)
  return results.some((result) => result.status === 'fulfilled')
}

function signupPayload(person, extra = {}) {
  return { type: 'signup', id: person.id, name: person.name, email: person.email, role: person.role, at: person.at, ...extra }
}

export function announceSignup(person) {
  const line = `${person.name} · ${roleLabel(person.role)} · ${person.email}`
  const payload = signupPayload(person)
  const tasks = [sendData(payload), publishTeam(payload)]
  if (!TEST) {
    tasks.push(push('Новая заявка в RESTPRIME', `${line}. Откройте кабинет и подтвердите вход.`, ['bell']))
    tasks.push(mail(`RESTPRIME: заявка от ${person.name}`, { Имя: person.name, Почта: person.email, Роль: roleLabel(person.role), Когда: person.at, Кабинет: SITE }))
  }
  return settle(tasks)
}

export function resendSignup(person) {
  const payload = signupPayload(person, { repeat: true })
  return settle([sendData(payload), publishTeam(payload)])
}

export function announceDecision(person, status) {
  const payload = { type: 'decision', email: person.email, name: person.name, role: person.role, status }
  return settle([sendData(payload), publishTeam(payload)])
}

export function announceRecovery(person) {
  const payload = { type: 'recovery', email: person.email, name: person.name }
  const tasks = [sendData(payload), publishTeam(payload)]
  if (!TEST) {
    tasks.push(push('Просьба восстановить пароль', `${person.name} · ${person.email}`, ['key']))
    tasks.push(mail(`RESTPRIME: восстановление пароля — ${person.name}`, { Имя: person.name, Почта: person.email, Кабинет: SITE }))
  }
  return settle(tasks)
}

function parseLines(text, accept) {
  return text.split('\n').filter(Boolean).map((line) => {
    try {
      const item = JSON.parse(line)
      if (item.event !== 'message') return null
      const event = JSON.parse(item.message)
      return accept(event, item)
    } catch {
      return null
    }
  }).filter(Boolean)
}

export async function pollRelay(since = '12h') {
  const response = await withTimeout(fetch(`${HOST}/${DATA_TOPIC}/json?poll=1&since=${since}`), 10000)
  if (response.status === 429) return []
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
  const text = await response.text()
  return parseLines(text, (event, item) => (event?.v === 1 && event.email ? { ...event, relayId: item.id, time: item.time } : null))
}

export function sendTeam(event) {
  return publishTeam(event)
}

export function publishTeam(event) {
  return publish({ topic: TEAM_TOPIC, message: JSON.stringify({ v: 1, ...event }) })
}

const TEAM_TYPES = new Set(['chat', 'task', 'note', 'desk', 'desk-part', 'signup', 'decision', 'recovery'])

async function readTeam(since) {
  const response = await withTimeout(fetch(`${HOST}/${TEAM_TOPIC}/json?poll=1&since=${encodeURIComponent(since)}`, { cache: 'no-store' }), 10000)
  if (response.status === 429) return []
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
  const text = await response.text()
  return parseLines(text, (event, item) => (event?.v === 1 && TEAM_TYPES.has(event.type) ? { ...event, relayId: item.id, time: item.time } : null))
}

export async function pollTeam(since = 'all') {
  try {
    return await readTeam(since)
  } catch {
    return []
  }
}
