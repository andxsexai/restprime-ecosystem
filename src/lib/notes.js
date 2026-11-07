export const PERSONAL_LIMIT = 20000
export const GROUP_LIMIT = 2400
export const TITLE_LIMIT = 120
export const NOTES_CAP = 200

export function ownerKey(session) {
  return session?.email || 'guest'
}

export function authorName(session) {
  return session?.name || 'Гость'
}

export function noteStamp(date = new Date()) {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date).replace(/[\s\u202f\u00a0]+/g, ' ')
}

export function makeNote({ scope = 'personal', title = '', body = '', owner, by, day = null, id }) {
  const now = noteStamp()
  const cleanTitle = String(title || '').trim().slice(0, TITLE_LIMIT)
  const limit = scope === 'group' ? GROUP_LIMIT : PERSONAL_LIMIT
  const cleanBody = String(body || '').slice(0, limit)
  return {
    id: id || Math.random().toString(36).slice(2, 10),
    scope: scope === 'group' ? 'group' : 'personal',
    title: cleanTitle,
    body: cleanBody,
    owner: owner || 'guest',
    by: by || 'Гость',
    from: owner || 'guest',
    day: day || null,
    pinned: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
    updatedMs: Date.now(),
    sync: scope === 'group' && cleanBody.length <= GROUP_LIMIT,
  }
}

export function visibleNotes(notes, owner) {
  return (notes || []).filter((note) => note.scope === 'group' || note.owner === owner)
}

export function previewNote(body, length = 90) {
  const text = String(body || '').replace(/\s+/g, ' ').trim()
  if (!text) return 'Пустая заметка'
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export function searchNotes(notes, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return notes
  return notes.filter((note) => `${note.title} ${note.body} ${note.by}`.toLowerCase().includes(q))
}

export function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1
    return (b.updatedMs || 0) - (a.updatedMs || 0)
  })
}

export function upsertNote(list, note) {
  const current = list.find((item) => item.id === note.id)
  const next = !current || (note.updatedMs || 0) >= (current.updatedMs || 0) ? note : current
  return [next, ...list.filter((item) => item.id !== next.id)].slice(0, NOTES_CAP)
}

export function canEditNote(note, session, canAct) {
  if (!note) return false
  if (note.scope === 'personal') return note.owner === ownerKey(session)
  return Boolean(canAct)
}
