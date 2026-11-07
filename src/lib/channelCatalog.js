import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'

export function parseHandle(raw) {
  const text = String(raw || '').trim()
  if (!text) return ''
  const cleaned = text
    .replace(/^https?:\/\//i, '')
    .replace(/^(t\.me|telegram\.me|www\.t\.me)\//i, '')
    .replace(/^s\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
    .trim()
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(cleaned)) return ''
  return cleaned
}

export function emptyPrefs() {
  return { hidden: [], custom: [] }
}

export function normalizePrefs(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return emptyPrefs()
  return {
    hidden: (Array.isArray(raw.hidden) ? raw.hidden : []).map((id) => String(id || '').trim()).filter(Boolean),
    custom: (Array.isArray(raw.custom) ? raw.custom : []).filter((item) => item && parseHandle(item.id)),
  }
}

function sameId(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase()
}

export function findDefault(id) {
  return TELEGRAM_CHANNELS.find((item) => sameId(item.id, id)) || null
}

export function liveChannels(prefs = emptyPrefs()) {
  const hidden = new Set((prefs.hidden || []).map((id) => String(id).toLowerCase()))
  const base = TELEGRAM_CHANNELS.filter((item) => !hidden.has(item.id.toLowerCase()))
  const extra = (prefs.custom || []).filter((item) => item?.id && !hidden.has(String(item.id).toLowerCase()) && !base.some((entry) => sameId(entry.id, item.id)))
  return [...base, ...extra]
}

export function hiddenDefaults(prefs = emptyPrefs()) {
  const hidden = new Set((prefs.hidden || []).map((id) => String(id).toLowerCase()))
  return TELEGRAM_CHANNELS.filter((item) => hidden.has(item.id.toLowerCase()))
}

export function makeCustomChannel({ handle, title }) {
  const id = parseHandle(handle)
  if (!id) return null
  const known = findDefault(id)
  if (known) return { ...known, restored: true }
  return {
    id,
    title: String(title || '').trim() || id,
    place: 'Москва',
    kind: 'свой канал',
    voice: 'Добавлен вручную. Тон берём из поста канала, чужой текст в посты «Кедра» не копируем.',
    custom: true,
  }
}

export function addChannel(prefs, draft) {
  const next = { hidden: [...(prefs.hidden || [])], custom: [...(prefs.custom || [])] }
  const made = makeCustomChannel(draft)
  if (!made) return { prefs: next, error: 'Нужен публичный @канал: латиница, без чата-приглашения.' }
  const key = made.id.toLowerCase()
  next.hidden = next.hidden.filter((id) => String(id).toLowerCase() !== key)
  if (made.restored) return { prefs: next, channel: findDefault(made.id), restored: true }
  if (next.custom.some((item) => sameId(item.id, made.id))) return { prefs: next, error: 'Этот канал уже в списке.' }
  next.custom = [made, ...next.custom]
  return { prefs: next, channel: made }
}

export function removeChannel(prefs, id) {
  const next = { hidden: [...(prefs.hidden || [])], custom: [...(prefs.custom || [])] }
  const custom = next.custom.find((item) => sameId(item.id, id))
  if (custom) {
    next.custom = next.custom.filter((item) => !sameId(item.id, id))
    return { prefs: next, removed: custom }
  }
  const known = findDefault(id)
  if (known && !next.hidden.some((item) => sameId(item, known.id))) next.hidden = [...next.hidden, known.id]
  return { prefs: next, hidden: known }
}

export function restoreChannel(prefs, id) {
  return {
    hidden: (prefs.hidden || []).filter((item) => !sameId(item, id)),
    custom: [...(prefs.custom || [])],
  }
}

export function restoreAll(prefs) {
  return { hidden: [], custom: [...(prefs.custom || [])] }
}
