import { NOTES_CAP } from './notes.js'

const PURGE_CAP = 400
const LOG_CAP = 200
const TASK_CAP = 400
const PART_LIMIT = 24
const MESSAGE_LIMIT = 3000
const NOTE_SYNC_BODY = 2400
const TITLE_SYNC = 400

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

function titleKey(item) {
  return String(item?.title || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function mergeItems(local = [], remote = [], dead = []) {
  const purged = new Set(dead || [])
  const map = new Map()
  for (const item of [...(remote || []), ...(local || [])]) {
    if (!item?.id || purged.has(item.id)) continue
    const prev = map.get(item.id)
    if (!prev || stampOf(item) >= stampOf(prev)) map.set(item.id, item)
  }
  const unique = new Map()
  for (const item of map.values()) {
    const key = titleKey(item)
    if (!key) {
      unique.set(item.id, item)
      continue
    }
    const twin = [...unique.values()].find((other) => titleKey(other) === key)
    if (!twin) {
      unique.set(item.id, item)
      continue
    }
    if (stampOf(item) >= stampOf(twin)) {
      unique.delete(twin.id)
      unique.set(item.id, item)
    }
  }
  for (const id of purged) unique.delete(id)
  return [...unique.values()]
}

export function mergeLog(local = [], remote = []) {
  const map = new Map()
  for (const item of [...(remote || []), ...(local || [])]) {
    if (item?.id) map.set(item.id, item)
  }
  return [...map.values()].slice(0, LOG_CAP)
}

function utf8Size(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length
}

function compactTask(task) {
  if (!task?.id) return null
  return {
    id: task.id,
    title: String(task.title || '').slice(0, TITLE_SYNC),
    assignee: task.assignee || '',
    due: task.due || '',
    day: task.day || null,
    by: task.by || '',
    createdAt: task.createdAt || '',
    doneAt: task.doneAt || '',
    doneBy: task.doneBy || '',
    trashedAt: task.trashedAt || '',
    trashedBy: task.trashedBy || '',
    editedAt: task.editedAt || '',
    editedBy: task.editedBy || '',
    touchMs: Number(task.touchMs) || 0,
    updatedMs: Number(task.updatedMs) || 0,
    editedMs: Number(task.editedMs) || 0,
    trashedMs: Number(task.trashedMs) || 0,
  }
}

function compactNote(note) {
  if (!note?.id) return null
  return {
    id: note.id,
    scope: note.scope === 'group' ? 'group' : 'personal',
    title: String(note.title || '').slice(0, 120),
    body: String(note.body || '').slice(0, NOTE_SYNC_BODY),
    owner: note.owner || 'guest',
    by: note.by || '',
    from: note.from || note.owner || '',
    day: note.day || null,
    pinned: Boolean(note.pinned),
    archived: Boolean(note.archived),
    createdAt: note.createdAt || '',
    updatedAt: note.updatedAt || '',
    updatedMs: Number(note.updatedMs) || 0,
    trashedAt: note.trashedAt || '',
    trashedBy: note.trashedBy || '',
    trashedMs: Number(note.trashedMs) || 0,
    sync: note.sync !== false,
  }
}

export function packDays(days = []) {
  return (days || []).map((day) => ({
    day: day.day,
    status: day.status || '',
    decidedBy: day.decidedBy || '',
    decidedRole: day.decidedRole || '',
    decidedAt: day.decidedAt || '',
    format: day.format || '',
    variant: Number(day.variant) || 0,
    manual: Boolean(day.manual),
    postText: day.manual ? String(day.postText || '').slice(0, 1800) : '',
  })).filter((day) => (day.status && day.status !== 'review') || day.manual || day.decidedAt)
}

export function absorbDayPatches(localDays = [], patches = []) {
  if (!Array.isArray(localDays) || !localDays.length) return Array.isArray(patches) ? patches : []
  if (!patches?.length) return localDays
  const map = new Map(patches.map((item) => [Number(item.day), item]))
  return localDays.map((day) => {
    const patch = map.get(Number(day.day))
    if (!patch) return day
    return {
      ...day,
      status: patch.status || day.status,
      decidedBy: patch.decidedBy || day.decidedBy,
      decidedRole: patch.decidedRole || day.decidedRole,
      decidedAt: patch.decidedAt || day.decidedAt,
      format: patch.format || day.format,
      variant: patch.variant ?? day.variant,
      manual: Boolean(patch.manual) || Boolean(day.manual),
      postText: patch.manual && patch.postText ? patch.postText : day.postText,
    }
  })
}

export function packDesk({ tasks = [], taskLog = [], notes = [], purged = emptyPurged(), days = [], email = '' }) {
  const syncNotes = (notes || [])
    .filter((note) => note.scope === 'group' || (email && note.owner === email))
    .map(compactNote)
    .filter(Boolean)
  return {
    at: Date.now(),
    tasks: (tasks || []).map(compactTask).filter(Boolean).slice(0, TASK_CAP),
    taskLog: (taskLog || []).slice(0, 40),
    notes: syncNotes.slice(0, NOTES_CAP),
    days: packDays(days),
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
    days: absorbDayPatches(local.days, snap.days),
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

function deskFits(slice) {
  return utf8Size({ v: 1, ...slice }) <= MESSAGE_LIMIT
}

export async function pushDeskSnapshot(publishTeam, snap) {
  const at = snap.at || Date.now()
  const tasks = (snap.tasks || []).map(compactTask).filter(Boolean)
  const notes = (snap.notes || []).map(compactNote).filter(Boolean)
  const taskLog = (snap.taskLog || []).slice(0, 40)
  const purged = snap.purged || emptyPurged()
  const days = packDays(snap.days)
  const slices = []
  let bag = { tasks: [], notes: [], taskLog: [], days: [] }

  const trial = (next, withPurged) => ({
    type: 'desk',
    at,
    tasks: next.tasks,
    notes: next.notes,
    taskLog: next.taskLog,
    days: next.days || [],
    purged: withPurged ? purged : emptyPurged(),
  })

  const commit = (withPurged = false) => {
    if (bag.tasks.length || bag.notes.length || bag.taskLog.length || bag.days.length || !slices.length) {
      slices.push(trial(bag, withPurged))
    }
    bag = { tasks: [], notes: [], taskLog: [], days: [] }
  }

  const add = (key, item) => {
    const next = { ...bag, [key]: [...bag[key], item] }
    if (!deskFits(trial(next, false)) && (bag.tasks.length || bag.notes.length || bag.taskLog.length || bag.days.length)) {
      commit(false)
      bag = { tasks: [], notes: [], taskLog: [], days: [], [key]: [item] }
      return
    }
    bag = next
  }

  tasks.forEach((item) => add('tasks', item))
  notes.forEach((item) => add('notes', item))
  taskLog.forEach((item) => add('taskLog', item))
  days.forEach((item) => add('days', item))
  commit(true)
  if (slices.length) slices[slices.length - 1] = { ...slices[slices.length - 1], purged }

  for (const slice of slices) {
    await publishTeam(slice)
  }
}
