import { RotateCcw, Trash2, X } from 'lucide-react'
import { canEditNote, ownerKey, previewNote, trashedNotes, trashedOf } from '../lib/notes.js'

export function TrashRow({ kind, title, meta, onRestore, onPurge, restoreDisabled, purgeDisabled }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0A0F0B] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[#7A8580]">{kind}</p>
      <p className="mt-1 text-base text-[#F4F0E6]">{title}</p>
      {meta && <p className="mt-1 text-xs text-[#7A8580]">{meta}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={restoreDisabled} onClick={onRestore} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#C9A96A] px-3 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">
          <RotateCcw size={14} />Вернуть
        </button>
        <button type="button" disabled={purgeDisabled} onClick={onPurge} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/15 px-3 text-sm text-[#FF8A7A] disabled:opacity-40">
          <Trash2 size={14} />Навсегда
        </button>
      </div>
    </article>
  )
}

export default function TrashDesk({ tasks = [], notes = [], session, canAct, onClose, onRestoreTask, onPurgeTask, onRestoreNote, onPurgeNote, onEmpty }) {
  const owner = ownerKey(session)
  const binTasks = trashedOf(tasks)
  const binNotes = trashedNotes(notes, owner)
  const empty = binTasks.length + binNotes.length === 0

  return (
    <div className="fixed inset-0 z-[113] flex items-stretch justify-end bg-black/55 p-0 sm:items-center sm:justify-center sm:p-4" onClick={onClose}>
      <section onClick={(event) => event.stopPropagation()} className="flex h-full w-full flex-col bg-[#121A14] sm:h-[88vh] sm:max-w-xl sm:rounded-[28px] sm:border sm:border-[#C9A96A]/20">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Корзина</p>
            <h2 className="font-display text-4xl italic leading-none text-[#F4F0E6]">Задачи и заметки</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть корзину" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-[#F4F0E6]"><X size={18} /></button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-sm leading-relaxed text-[#7A8580]">Удаление сначала сюда. Вернуть можно. «Навсегда» стирает без возврата.</p>
          {!empty && (
            <button type="button" onClick={onEmpty} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-[#FF8A7A]">Очистить корзину</button>
          )}
          {empty && <p className="text-sm text-[#7A8580]">Корзина пустая.</p>}
          {binTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Задачи · {binTasks.length}</p>
              {binTasks.map((task) => (
                <TrashRow
                  key={task.id}
                  kind="Задача"
                  title={task.title}
                  meta={`${task.trashedBy || ''} · ${task.trashedAt}`}
                  restoreDisabled={!canAct}
                  purgeDisabled={!canAct}
                  onRestore={() => onRestoreTask(task.id)}
                  onPurge={() => onPurgeTask(task.id)}
                />
              ))}
            </div>
          )}
          {binNotes.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">Заметки · {binNotes.length}</p>
              {binNotes.map((note) => {
                const allowed = canEditNote(note, session, canAct)
                return (
                  <TrashRow
                    key={note.id}
                    kind={note.scope === 'group' ? 'Общая заметка' : 'Личная заметка'}
                    title={note.title || 'Без названия'}
                    meta={`${previewNote(note.body, 80)} · ${note.trashedBy || ''} · ${note.trashedAt}`}
                    restoreDisabled={!allowed}
                    purgeDisabled={!allowed}
                    onRestore={() => onRestoreNote(note.id)}
                    onPurge={() => onPurgeNote(note.id)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export function trashCount(tasks, notes, session) {
  return trashedOf(tasks || []).length + trashedNotes(notes || [], ownerKey(session)).length
}
