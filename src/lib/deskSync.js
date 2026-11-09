import { NOTES_CAP } from './notes.js'

const PART_SIZE = 2800
const PURGE_CAP = 400
const LOG_CAP = 200
const TASK_CAP = 400
const PART_LIMIT = 24

const partBuf = new Map()

export function stampOf(item) {
  if (!item) return 0
  return Math.max(
    Number(item.updatedMs) || 0,
    Number(item.touchMs) || 0,
    Number(item.trashedMs) || 0,
    Number(item.editedMs) || 0,
  )
}

export function emptyPurged() {
  return { tasks: [], notes: [] }
}

export function rememberPurged(purged = emptyPurged(), kind, ids) {
  const extra = (ids || []).filter(Boolean)
  const current = Array.isArray(purged?.[kind]) ? purged[kind] : []
  return {
    tasks: kind === 'tasks' ? [...current, ...extra].filter((id, index, list) => list.indexOf(id) === index).slice(-PURGE_CAP) : (purged.tasks || []),
    notes: kind === 'notes' ? [...current, ...extra].filter((id, index, list) => list.indexOf(id) === index).slice(-PURGE_CAP) : (purged.notes || []),
  }
}

export function mergePurged(a = emptyPurged(), b = emptyPurged()) {
  return {
    tasks: [...new Set([...(a.tasks || []), ...(b.tasks || [])])].slice(-PURGE_CAP),
    notes: [...new Set([...(a.notes || []), ...(b.notes || [])])].slice(-PURGE_CAP),
  }
}

export function mergeItems(local = [], remote = [], dead = []) {
  const purged = new Set(dead || [])
  const map = new Map()
  for (const item of [...(remote || []), ...(local || [])]) {
    if (!item?.id || purged.has(item.id)) continue
    const prev = map.get(item.id)
    if (!prev || stampOf(item) >= stampOf(prev)) map.set(item.id, item)
  }
  for (const id of purged) map.delete(id)
  return [...map.values()]
}

export function mergeLog(local = [], remote = []) {
  const map = new Map()
  for (const item of [...(remote || []), ...(local || [])]) {
    if (item?.id) map.set(item.id, item)
  }
  return [...map.values()].slice(0, LOG_CAP)
}

export function packDesk({ tasks = [], taskLog = [], notes = [], purged = emptyPurged(), email = '' }) {
  const syncNotes = (notes || []).filter((note) => note.scope === 'group' || (email && note.owner === email))
  return {
    at: Date.now(),
    tasks: (tasks || []).slice(0, TASK_CAP),
    taskLog: (taskLog || []).slice(0, LOG_CAP),
    notes: syncNotes.slice(0, NOTES_CAP),
    purged: {
      tasks: (purged.tasks || []).slice(-PURGE_CAP),
      notes: (purged.notes || []).slice(-PURGE_CAP),
    },
  }
}

export function absorbDesk(local, snap, owner) {
  const purged = mergePurged(local.purged, snap.purged)
  const incomingNotes = (snap.notes || []).filter((note) => note.scope === 'group' || (owner && note.owner === owner))
  const othersPersonal = (local.notes || []).filter((note) => note.scope === 'personal' && note.owner !== owner)
  const ownAndGroup = (local.notes || []).filter((note) => note.scope === 'group' || note.owner === owner)
  return {
    tasks: mergeItems(local.tasks, snap.tasks, purged.tasks).slice(0, TASK_CAP),
    taskLog: mergeLog(local.taskLog, snap.taskLog),
    notes: [...othersPersonal, ...mergeItems(ownAndGroup, incomingNotes, purged.notes)].slice(0, NOTES_CAP),
    purged,
  }
}

export function listFingerprint(list) {
  return (list || []).map((item) => `${item.id}:${stampOf(item)}:${item.trashedAt || ''}:${item.doneAt || ''}:${item.title || ''}:${item.body || ''}`).sort().join('|')
}

export function sameList(a, b) {
  return listFingerprint(a) === listFingerprint(b)
}

export function collectDesk(events) {
  const snaps = []
  for (const event of events || []) {
    if (event.type === 'desk' && (Array.isArray(event.tasks) || Array.isArray(event.notes))) {
      snaps.push(event)
      continue
    }
    if (event.type !== 'desk-part' || !event.gen) continue
    const slot = partBuf.get(event.gen) || { n: Number(event.n) || 0, chunks: [] }
    slot.n = Number(event.n) || slot.n
    slot.chunks[Number(event.i)] = String(event.data || '')
    partBuf.set(event.gen, slot)
    if (partBuf.size > PART_LIMIT) {
      const oldest = partBuf.keys().next().value
      partBuf.delete(oldest)
    }
    const ready = slot.n > 0 && [...Array(slot.n).keys()].every((index) => typeof slot.chunks[index] === 'string')
    if (!ready) continue
    try {
      const snap = JSON.parse(slot.chunks.slice(0, slot.n).join(''))
      snaps.push({ type: 'desk', ...snap, relayId: event.relayId, time: event.time })
    } catch {
      /* кусок не собрался — подождём следующий опрос */
    }
    partBuf.delete(event.gen)
  }
  return snaps
}

export async function pushDeskSnapshot(publishTeam, snap) {
  const body = {
    type: 'desk',
    at: snap.at,
    tasks: snap.tasks || [],
    notes: snap.notes || [],
    taskLog: snap.taskLog || [],
    purged: snap.purged || emptyPurged(),
  }
  const encoded = JSON.stringify({ v: 1, ...body })
  if (encoded.length <= 3600) return publishTeam(body)
  const raw = JSON.stringify({
    at: body.at,
    tasks: body.tasks,
    notes: body.notes,
    taskLog: body.taskLog,
    purged: body.purged,
  })
  const gen = `${body.at}-${Math.random().toString(36).slice(2, 7)}`
  const total = Math.ceil(raw.length / PART_SIZE) || 1
  for (let index = 0; index < total; index += 1) {
    await publishTeam({ type: 'desk-part', gen, i: index, n: total, data: raw.slice(index * PART_SIZE, (index + 1) * PART_SIZE) })
  }
}
