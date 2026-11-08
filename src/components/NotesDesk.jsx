import { useEffect, useMemo, useState } from 'react'
import { Archive, Check, Copy, ListChecks, Pin, PinOff, Plus, RotateCcw, Search, StickyNote, Trash2, X } from 'lucide-react'
import { copyText } from '../lib/clipboard.js'
import { dateForDay, formatLong } from '../lib/planDates.js'
import {
  GROUP_LIMIT,
  PERSONAL_LIMIT,
  TITLE_LIMIT,
  authorName,
  canEditNote,
  isTrashed,
  livingNotes,
  makeNote,
  noteStamp,
  ownerKey,
  previewNote,
  searchNotes,
  sortNotes,
  visibleNotes,
} from '../lib/notes.js'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'personal', label: 'Личные' },
  { id: 'group', label: 'Общие' },
  { id: 'pinned', label: 'Закреплённые' },
  { id: 'archived', label: 'Архив' },
  { id: 'trash', label: 'Корзина' },
]

function matchesFilter(note, filter) {
  if (filter === 'trash') return isTrashed(note)
  if (isTrashed(note)) return false
  if (filter === 'archived') return note.archived
  if (note.archived) return false
  if (filter === 'personal') return note.scope === 'personal'
  if (filter === 'group') return note.scope === 'group'
  if (filter === 'pinned') return note.pinned
  return true
}

export default function NotesDesk({
  notes,
  members,
  days,
  session,
  canAct,
  focusId,
  onClose,
  onUpsert,
  onRemove,
  onRestore,
  onPurge,
  onToTask,
  onCopy,
}) {
  const owner = ownerKey(session)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(focusId || '')
  const [draft, setDraft] = useState(null)
  const [saved, setSaved] = useState(false)

  const mine = useMemo(() => visibleNotes(notes, owner), [notes, owner])
  const shown = useMemo(
    () => sortNotes(searchNotes(mine.filter((note) => matchesFilter(note, filter)), query)),
    [mine, filter, query],
  )
  const selected = mine.find((note) => note.id === selectedId) || null
  const counts = {
    all: mine.filter((note) => !note.archived && !isTrashed(note)).length,
    personal: mine.filter((note) => !note.archived && !isTrashed(note) && note.scope === 'personal').length,
    group: mine.filter((note) => !note.archived && !isTrashed(note) && note.scope === 'group').length,
    pinned: mine.filter((note) => !note.archived && !isTrashed(note) && note.pinned).length,
    archived: mine.filter((note) => note.archived && !isTrashed(note)).length,
    trash: mine.filter(isTrashed).length,
  }
  const inTrash = isTrashed(selected)
  const editable = canEditNote(selected, session, canAct) && !inTrash
  const limit = selected?.scope === 'group' ? GROUP_LIMIT : PERSONAL_LIMIT

  useEffect(() => {
    if (focusId) setSelectedId(focusId)
  }, [focusId])

  useEffect(() => {
    if (!selected) {
      setDraft(null)
      return
    }
    setDraft({ title: selected.title, body: selected.body, day: selected.day || '' })
    setSaved(false)
  }, [selected?.id])

  useEffect(() => {
    if (!selected || !draft || !editable) return undefined
    const dirty = draft.title !== selected.title || draft.body !== selected.body || String(draft.day || '') !== String(selected.day || '')
    if (!dirty) return undefined
    const timer = setTimeout(() => {
      onUpsert({
        ...selected,
        title: draft.title,
        body: draft.body,
        day: draft.day ? Number(draft.day) : null,
        updatedAt: noteStamp(),
        updatedMs: Date.now(),
      })
      setSaved(true)
    }, 450)
    return () => clearTimeout(timer)
  }, [draft, selected, editable])

  function create(scope) {
    if (scope === 'group' && !canAct) return
    const note = makeNote({
      scope,
      title: '',
      body: '',
      owner,
      by: authorName(session),
    })
    onUpsert(note)
    setFilter(scope)
    setSelectedId(note.id)
  }

  function patch(next) {
    if (!selected || !editable) return
    onUpsert({ ...selected, ...next, updatedAt: noteStamp(), updatedMs: Date.now() })
  }

  async function copy() {
    const text = `${selected?.title || ''}\n\n${selected?.body || ''}`.trim()
    const ok = await copyText(text)
    if (ok && onCopy) onCopy('Заметка скопирована.')
  }

  return (
    <div className="fixed inset-0 z-[112] flex items-stretch justify-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-4" onClick={onClose}>
      <section onClick={(event) => event.stopPropagation()} className="flex h-full w-full flex-col bg-[#121A14] sm:h-[90vh] sm:max-w-5xl sm:rounded-[28px] sm:border sm:border-[#C9A96A]/20">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]"><StickyNote size={13} />Заметки</p>
            <h2 className="font-display text-4xl italic leading-none text-[#F4F0E6]">Личные и общие</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть заметки" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-[#F4F0E6]"><X size={18} /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
          <aside className={`${selected ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col border-white/10 lg:col-span-5 lg:border-r`}>
            <div className="space-y-3 p-4 sm:p-5">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8580]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти по тексту" className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] py-3 pl-9 pr-3 text-sm text-[#F4F0E6] outline-none focus:border-[#C9A96A]" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((item) => (
                  <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1.5 text-xs ${filter === item.id ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
                    {item.label} · {counts[item.id]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => create('personal')} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A96A] px-3 py-2 text-sm font-semibold text-[#0A0F0B]"><Plus size={14} />Личная</button>
                <button type="button" disabled={!canAct} onClick={() => create('group')} className="inline-flex items-center gap-1.5 rounded-xl border border-[#C6FF5E]/40 px-3 py-2 text-sm text-[#C6FF5E] disabled:opacity-40"><Plus size={14} />Общая</button>
              </div>
              {!canAct && <p className="text-xs leading-relaxed text-[#7A8580]">Личные заметки пишутся сразу на этом устройстве. Общие видит команда — для них нужен вход.</p>}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-5 sm:px-5">
              {shown.length === 0 && <p className="text-sm text-[#7A8580]">{filter === 'trash' ? 'Корзина пустая.' : 'Пока пусто. Личная заметка не уходит в общий чат.'}</p>}
              {shown.map((note) => (
                <button key={note.id} type="button" onClick={() => setSelectedId(note.id)} className={`w-full rounded-2xl border p-3 text-left ${note.id === selectedId ? 'border-[#C9A96A] bg-[#C9A96A]/10' : 'border-white/10 bg-[#0A0F0B]'}`}>
                  <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#7A8580]">
                    {note.pinned && <Pin size={11} className="text-[#C9A96A]" />}
                    {note.scope === 'group' ? 'Общая' : 'Личная'}
                    {note.archived ? ' · архив' : ''}
                    {isTrashed(note) ? ' · корзина' : ''}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-[#F4F0E6]">{note.title || 'Без названия'}</span>
                  <span className="mt-1 block text-xs text-[#7A8580]">{previewNote(note.body)}</span>
                  <span className="mt-1 block text-[11px] text-[#C9A96A]">{isTrashed(note) ? `${note.trashedBy || note.by} · ${note.trashedAt}` : `${note.by} · ${note.updatedAt}`}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className={`${selected ? 'flex' : 'hidden lg:flex'} min-h-0 flex-col lg:col-span-7`}>
            {!selected && (
              <div className="flex flex-1 items-center justify-center p-8 text-sm text-[#7A8580]">Выберите заметку слева или создайте новую.</div>
            )}
            {selected && inTrash && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
                  <button type="button" onClick={() => setSelectedId('')} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-[#F4F0E6] lg:hidden">К списку</button>
                  <p className="text-xs text-[#FF8A7A]">В корзине · {selected.trashedBy || selected.by} · {selected.trashedAt}</p>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                  <h3 className="font-display text-3xl italic text-[#F4F0E6]">{selected.title || 'Без названия'}</h3>
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[#F4F0E6]/80">{selected.body || 'Пустая заметка'}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={!canEditNote(selected, session, canAct)} onClick={() => { onRestore(selected.id); setFilter('all') }} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40"><RotateCcw size={15} />Вернуть</button>
                    <button type="button" disabled={!canEditNote(selected, session, canAct)} onClick={() => { onPurge(selected.id); setSelectedId('') }} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-[#FF8A7A] disabled:opacity-40"><Trash2 size={15} />Навсегда</button>
                  </div>
                </div>
              </div>
            )}
            {selected && draft && !inTrash && (
              <>
                <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5">
                  <button type="button" onClick={() => setSelectedId('')} className="rounded-xl border border-white/15 px-3 py-2 text-xs text-[#F4F0E6] lg:hidden">К списку</button>
                  <p className="text-xs text-[#7A8580]">{selected.scope === 'group' ? `Общая · ${members.length} в команде` : 'Только на этом устройстве'}{saved ? ' · сохранено' : ''}</p>
                  <div className="flex gap-1">
                    <button type="button" disabled={!editable} onClick={() => patch({ pinned: !selected.pinned })} aria-label={selected.pinned ? 'Открепить' : 'Закрепить'} className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-[#C9A96A] disabled:opacity-40">{selected.pinned ? <PinOff size={15} /> : <Pin size={15} />}</button>
                    <button type="button" disabled={!editable} onClick={() => patch({ archived: !selected.archived })} aria-label={selected.archived ? 'Вернуть из архива' : 'В архив'} className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-[#F4F0E6] disabled:opacity-40"><Archive size={15} /></button>
                    <button type="button" onClick={copy} aria-label="Скопировать" className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 text-[#F4F0E6]"><Copy size={15} /></button>
                    <button type="button" disabled={!editable} onClick={() => { onRemove(selected.id); setFilter('trash'); setSelectedId(selected.id) }} aria-label="Удалить заметку" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[#7A8580] disabled:opacity-40"><Trash2 size={15} /></button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                  <input
                    value={draft.title}
                    maxLength={TITLE_LIMIT}
                    disabled={!editable}
                    onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                    placeholder="Заголовок"
                    className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 font-display text-3xl italic text-[#F4F0E6] outline-none focus:border-[#C9A96A] disabled:opacity-60"
                  />
                  <textarea
                    value={draft.body}
                    maxLength={limit}
                    disabled={!editable}
                    onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                    placeholder={selected.scope === 'group' ? 'Что нужно знать всей команде' : 'Черновик, список, мысль — только вам'}
                    className="min-h-[42vh] w-full resize-y rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-base leading-relaxed text-[#F4F0E6] outline-none focus:border-[#C9A96A] disabled:opacity-60"
                  />
                  <p className="text-[11px] text-[#7A8580]">{draft.body.length} / {limit}{selected.scope === 'group' && !selected.sync ? ' · слишком длинно для общего канала, видна на этом устройстве' : ''}</p>
                  <select value={draft.day} disabled={!editable} onChange={(event) => setDraft({ ...draft, day: event.target.value })} className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] disabled:opacity-50">
                    <option value="">Без поста</option>
                    {days.map((item) => <option key={item.day} value={item.day}>Пост · {formatLong(dateForDay(item.day))} · {item.title}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={!canAct} onClick={() => onToTask(selected)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C6FF5E] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40"><ListChecks size={15} />Сделать задачей</button>
                    <button type="button" disabled={!editable} onClick={() => {
                      const copyNote = makeNote({ ...selected, id: undefined, title: `${selected.title} (копия)`, body: selected.body, owner, by: authorName(session), day: selected.day })
                      onUpsert(copyNote)
                      setSelectedId(copyNote.id)
                    }} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-[#F4F0E6] disabled:opacity-40">Дублировать</button>
                    {selected.archived && <span className="inline-flex items-center gap-1 rounded-xl border border-[#C6FF5E]/30 px-3 py-2 text-xs text-[#C6FF5E]"><Check size={12} />В архиве</span>}
                  </div>
                  <p className="text-xs text-[#7A8580]">Создал {selected.by} · {selected.createdAt}. Правили {selected.updatedAt}.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export function CompactNotes({ notes, session, canAct, onUpsert, onOpen, onRemove }) {
  const owner = ownerKey(session)
  const [scope, setScope] = useState('personal')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const mine = livingNotes(notes, owner)
  const recent = sortNotes(mine.filter((note) => !note.archived)).slice(0, 6)

  function submit(event) {
    event.preventDefault()
    if (scope === 'group' && !canAct) return
    if (!title.trim() && !body.trim()) return
    const note = makeNote({ scope, title, body, owner, by: authorName(session) })
    onUpsert(note)
    setTitle('')
    setBody('')
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="space-y-2 rounded-2xl border border-[#C9A96A]/25 p-3">
        <div className="flex gap-1">
          <button type="button" onClick={() => setScope('personal')} className={`rounded-full px-3 py-1.5 text-xs ${scope === 'personal' ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>Личная</button>
          <button type="button" onClick={() => setScope('group')} className={`rounded-full px-3 py-1.5 text-xs ${scope === 'group' ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>Общая</button>
        </div>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={TITLE_LIMIT} placeholder={scope === 'group' && !canAct ? 'Общие заметки — после входа' : 'Заголовок заметки'} disabled={scope === 'group' && !canAct} className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-base text-[#F4F0E6] outline-none focus:border-[#C9A96A] disabled:opacity-50" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} maxLength={scope === 'group' ? GROUP_LIMIT : PERSONAL_LIMIT} disabled={scope === 'group' && !canAct} placeholder="Коротко здесь. Длинный текст — в большом окне." className="w-full resize-y rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm leading-relaxed text-[#F4F0E6] outline-none focus:border-[#C9A96A] disabled:opacity-50" />
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={(scope === 'group' && !canAct) || (!title.trim() && !body.trim())} className="rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Сохранить</button>
          <button type="button" onClick={() => onOpen('')} className="rounded-xl border border-[#C6FF5E]/40 px-4 py-2.5 text-sm text-[#C6FF5E]">Большое окно</button>
        </div>
      </form>
      {recent.length === 0 && <p className="text-sm leading-relaxed text-[#7A8580]">Заметок ещё нет. Личные остаются на этом устройстве. Общие видит команда.</p>}
      {recent.map((note) => (
        <article key={note.id} className="rounded-2xl border border-white/10 bg-[#0A0F0B] p-4">
          <div className="flex items-start justify-between gap-3">
            <button type="button" onClick={() => onOpen(note.id)} className="min-w-0 text-left">
              <p className="text-[10px] uppercase tracking-wider text-[#7A8580]">{note.scope === 'group' ? 'Общая' : 'Личная'}{note.pinned ? ' · закреплена' : ''}</p>
              <p className="mt-1 text-base text-[#F4F0E6]">{note.title || 'Без названия'}</p>
              <p className="mt-1 text-xs text-[#7A8580]">{previewNote(note.body, 110)}</p>
            </button>
            <button type="button" disabled={!canEditNote(note, session, canAct)} onClick={() => onRemove(note.id)} aria-label="Удалить заметку" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-[#7A8580] disabled:opacity-40">
              <Trash2 size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
