import { useMemo, useState } from 'react'
import { Check, RotateCcw, Trash2, X } from 'lucide-react'
import { ROLES, roleLabel } from '../lib/auth.js'
import { dateForDay, formatLong } from '../lib/planDates.js'

const PANES = [
  { id: 'open', label: 'В работе' },
  { id: 'done', label: 'Выполнено' },
  { id: 'log', label: 'История' },
]

function dueLabel(iso) {
  if (!iso) return 'без даты'
  const [year, month, day] = iso.split('-').map(Number)
  return formatLong(new Date(year, month - 1, day))
}

function ownerLabel(task, members) {
  if (task.assignee?.startsWith('role:')) return roleLabel(task.assignee.slice(5))
  const person = members.find((member) => member.email === task.assignee)
  return person ? `${person.name} · ${roleLabel(person.role)}` : 'Без исполнителя'
}

function owners(task, members) {
  if (task.assignee?.startsWith('role:')) return [task.assignee]
  const person = members.find((member) => member.email === task.assignee)
  return person ? [task.assignee, `role:${person.role}`] : [task.assignee]
}

export default function TaskDesk({ tasks, log, members, days, todayIso, todayDay, canAct, session, onClose, onAdd, onToggle, onRemove, onSeedDay }) {
  const [pane, setPane] = useState('open')
  const [who, setWho] = useState('all')
  const [draft, setDraft] = useState({ title: '', assignee: `role:${session?.role && session.role !== 'developer' ? session.role : 'director'}`, due: todayIso, day: todayDay?.day || '' })

  const lanes = useMemo(() => [
    ...ROLES.map((role) => ({ id: `role:${role.id}`, label: role.label })),
    ...members.map((member) => ({ id: member.email, label: `${member.name} лично` })),
  ], [members])

  const filtered = tasks.filter((task) => who === 'all' || owners(task, members).includes(who))
  const open = filtered.filter((task) => !task.doneAt).sort((a, b) => String(a.due).localeCompare(String(b.due)))
  const done = filtered.filter((task) => task.doneAt).sort((a, b) => String(b.doneAt).localeCompare(String(a.doneAt)))
  const counts = Object.fromEntries(lanes.map((lane) => [lane.id, tasks.filter((task) => !task.doneAt && owners(task, members).includes(lane.id)).length]))

  function submit(event) {
    event.preventDefault()
    if (!draft.title.trim()) return
    onAdd({ ...draft, title: draft.title.trim(), day: draft.day ? Number(draft.day) : null })
    setDraft({ ...draft, title: '' })
  }

  function card(task) {
    const late = !task.doneAt && task.due && task.due < todayIso
    const planDay = days.find((item) => item.day === task.day)
    return (
      <article key={task.id} className="rounded-2xl border border-white/10 bg-[#0A0F0B] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-base leading-snug text-[#F4F0E6] ${task.doneAt ? 'line-through opacity-60' : ''}`}>{task.title}</p>
            <p className="mt-1 text-xs text-[#C9A96A]">{ownerLabel(task, members)}</p>
            <p className={`mt-1 text-xs ${late ? 'text-[#FF8A7A]' : 'text-[#7A8580]'}`}>
              {late ? 'Просрочено · ' : 'Срок · '}{dueLabel(task.due)}
              {planDay ? ` · пост ${formatLong(dateForDay(planDay.day))}` : ''}
            </p>
            {task.doneAt && <p className="mt-1 text-xs text-[#C6FF5E]">Выполнил {task.doneBy} · {task.doneAt}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            <button type="button" disabled={!canAct} onClick={() => onToggle(task.id)} aria-label={task.doneAt ? 'Вернуть в работу' : 'Отметить выполненной'} className={`grid h-10 w-10 place-items-center rounded-xl disabled:opacity-40 ${task.doneAt ? 'border border-white/15 text-[#F4F0E6]' : 'bg-[#C6FF5E] text-[#0A0F0B]'}`}>
              {task.doneAt ? <RotateCcw size={16} /> : <Check size={16} />}
            </button>
            <button type="button" disabled={!canAct} onClick={() => onRemove(task.id)} aria-label="Удалить задачу" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-[#7A8580] disabled:opacity-40">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-black/50" onClick={onClose}>
      <aside onClick={(event) => event.stopPropagation()} className="flex h-full w-full flex-col bg-[#121A14] sm:max-w-[520px] sm:border-l sm:border-[#C9A96A]/20">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Команда</p>
            <h2 className="font-display text-4xl italic leading-none text-[#F4F0E6]">Задачи</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть задачи" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-[#F4F0E6]"><X size={18} /></button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => setWho('all')} className={`shrink-0 rounded-full px-3 py-2 text-xs ${who === 'all' ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
            Все · {tasks.filter((task) => !task.doneAt).length}
          </button>
          {lanes.map((lane) => (
            <button key={lane.id} type="button" onClick={() => setWho(lane.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs ${who === lane.id ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
              {lane.label} · {counts[lane.id] || 0}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 px-4 pt-3 sm:px-6">
          {PANES.map((item) => (
            <button key={item.id} type="button" onClick={() => setPane(item.id)} className={`rounded-xl px-2 py-2.5 text-sm ${pane === item.id ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/10 text-[#F4F0E6]'}`}>
              {item.label}{item.id === 'open' ? ` · ${open.length}` : item.id === 'done' ? ` · ${done.length}` : ''}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
          {pane === 'open' && (
            <>
              <form onSubmit={submit} className="space-y-2 rounded-2xl border border-[#C9A96A]/25 p-3">
                <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} disabled={!canAct} placeholder={canAct ? 'Что сделать' : 'Задачи ставит подтверждённая команда'} className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-base text-[#F4F0E6] outline-none focus:border-[#C9A96A] disabled:opacity-50" />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select value={draft.assignee} onChange={(event) => setDraft({ ...draft, assignee: event.target.value })} disabled={!canAct} className="rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] disabled:opacity-50">
                    {ROLES.map((role) => <option key={role.id} value={`role:${role.id}`}>Роль · {role.label}</option>)}
                    {members.map((member) => <option key={member.email} value={member.email}>{member.name} · {roleLabel(member.role)}</option>)}
                  </select>
                  <input type="date" value={draft.due} onChange={(event) => setDraft({ ...draft, due: event.target.value })} disabled={!canAct} className="rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] disabled:opacity-50" />
                </div>
                <select value={draft.day} onChange={(event) => setDraft({ ...draft, day: event.target.value })} disabled={!canAct} className="w-full rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] disabled:opacity-50">
                  <option value="">Без поста</option>
                  {days.map((item) => <option key={item.day} value={item.day}>Пост · {formatLong(dateForDay(item.day))} · {item.title}</option>)}
                </select>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" disabled={!canAct || !draft.title.trim()} className="rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Поставить задачу</button>
                  {todayDay && <button type="button" disabled={!canAct} onClick={onSeedDay} className="rounded-xl border border-[#C6FF5E]/40 px-4 py-2.5 text-sm text-[#C6FF5E] disabled:opacity-40">Задачи на {formatLong(dateForDay(todayDay.day))}</button>}
                </div>
              </form>
              {open.length === 0 && <p className="text-sm leading-relaxed text-[#7A8580]">Открытых задач нет. Кнопка с сегодняшней датой раздаёт по ролям три дела дня: утвердить пост, подготовить кадр и опубликовать.</p>}
              {open.map(card)}
            </>
          )}
          {pane === 'done' && (
            <>
              {done.length === 0 && <p className="text-sm text-[#7A8580]">Выполненных задач пока нет.</p>}
              {done.map(card)}
            </>
          )}
          {pane === 'log' && (
            <ol className="space-y-2">
              {log.length === 0 && <p className="text-sm text-[#7A8580]">История пустая. Здесь будет видно, кто поставил, закрыл и вернул задачу.</p>}
              {log.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-[#F4F0E6]/85">
                  <span className="block text-[11px] text-[#7A8580]">{entry.at}</span>
                  {entry.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      </aside>
    </div>
  )
}

export function taskStamp(date = new Date()) {
  const day = formatLong(date)
  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
}
