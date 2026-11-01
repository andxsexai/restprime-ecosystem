import { ADMIN_EMAIL, roleLabel } from './auth.js'

const HOST = 'https://ntfy.sh'
export const PUSH_TOPIC = 'restprime-kedr-desk-4f8c2a91'
const DATA_TOPIC = 'restprime-kedr-sync-9b31d7e6'
const SITE = 'https://andxsexai.github.io/restprime-ecosystem/'
export const PUSH_URL = `${HOST}/${PUSH_TOPIC}`

async function publish(body) {
  const response = await fetch(HOST, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
}

function sendData(event) {
  return publish({ topic: DATA_TOPIC, message: JSON.stringify({ v: 1, ...event }) })
}

function push(title, message, tags) {
  return publish({ topic: PUSH_TOPIC, title, message, tags, priority: 4, click: SITE })
}

async function mail(subject, fields) {
  const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...fields }),
  })
  if (!response.ok) throw new Error(`mail ${response.status}`)
}

async function settle(tasks) {
  const results = await Promise.allSettled(tasks)
  return results.some((result) => result.status === 'fulfilled')
}

export function announceSignup(person) {
  const line = `${person.name} · ${roleLabel(person.role)} · ${person.email}`
  return settle([
    sendData({ type: 'signup', id: person.id, name: person.name, email: person.email, role: person.role, at: person.at }),
    push('Новая заявка в RESTPRIME', `${line}. Откройте кабинет и подтвердите вход.`, ['bell']),
    mail(`RESTPRIME: заявка от ${person.name}`, { Имя: person.name, Почта: person.email, Роль: roleLabel(person.role), Когда: person.at, Кабинет: SITE }),
  ])
}

export function resendSignup(person) {
  return settle([sendData({ type: 'signup', id: person.id, name: person.name, email: person.email, role: person.role, at: person.at, repeat: true })])
}

export function announceDecision(person, status) {
  return settle([sendData({ type: 'decision', email: person.email, name: person.name, role: person.role, status })])
}

export function announceRecovery(person) {
  return settle([
    sendData({ type: 'recovery', email: person.email, name: person.name }),
    push('Просьба восстановить пароль', `${person.name} · ${person.email}`, ['key']),
    mail(`RESTPRIME: восстановление пароля — ${person.name}`, { Имя: person.name, Почта: person.email, Кабинет: SITE }),
  ])
}

export async function pollRelay(since = '12h') {
  const response = await fetch(`${HOST}/${DATA_TOPIC}/json?poll=1&since=${since}`)
  if (!response.ok) throw new Error(`ntfy ${response.status}`)
  const text = await response.text()
  return text.split('\n').filter(Boolean).map((line) => {
    try {
      const item = JSON.parse(line)
      if (item.event !== 'message') return null
      const event = JSON.parse(item.message)
      return event?.v === 1 && event.email ? { ...event, relayId: item.id, time: item.time } : null
    } catch {
      return null
    }
  }).filter(Boolean)
}
