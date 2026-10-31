import { useState } from 'react'
import { ExternalLink, Radar, Sparkles } from 'lucide-react'
import { dateForDay, formatLong } from '../lib/planDates.js'
import { occasionFor } from '../lib/writer.js'
import GlassCard from './ui/GlassCard.jsx'

function stampOf(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'нет данных'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date)
}

const DATES = Array.from({ length: 30 }, (_, index) => {
  const date = dateForDay(index + 1)
  const occasion = occasionFor(date)
  return occasion?.kind === 'date' ? { day: index + 1, label: occasion.label, when: formatLong(date) } : null
}).filter(Boolean)

export default function AutoPlanCard({ signals, repeatCount, canAct, onAutoPlan, onFixRepeats }) {
  const [open, setOpen] = useState('')
  const topics = signals?.topics || []
  const current = topics.find((topic) => topic.id === open)
  return (
    <GlassCard className="space-y-4 rounded-[28px] border border-[#C6FF5E]/25 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]"><Radar size={14} />Автоплан</p>
          <h2 className="font-fraunces mt-1 text-2xl text-ink sm:text-3xl">План сам собирается по ленте</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/70">
            Лента от {stampOf(signals?.fetchedAt)}, {signals?.total || 0} постов и новостей. Обновляется каждое утро в 08:00 — дни впереди пересобираются сами. Утверждённое и ручные правки не трогаем, чужой текст не берём, только тему.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button type="button" disabled={!canAct} onClick={onAutoPlan} className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#C6FF5E] px-4 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">
            <Sparkles size={15} />Собрать план по ленте
          </button>
          <button type="button" disabled={!canAct || !repeatCount} onClick={onFixRepeats} className={`press inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm disabled:opacity-40 ${repeatCount ? 'border-red-300/60 text-red-200' : 'border-white/15 text-ink/60'}`}>
            {repeatCount ? `Убрать повторы · ${repeatCount} дн.` : 'Повторов нет'}
          </button>
        </div>
      </div>
      {topics.length > 0 && (
        <div>
          <p className="text-xs text-ink/60">Темы в лентах сейчас — нажмите, чтобы увидеть источники</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {topics.slice(0, 8).map((topic) => (
              <button key={topic.id} type="button" onClick={() => setOpen(open === topic.id ? '' : topic.id)} className={`shrink-0 rounded-full px-3 py-2 text-xs ${open === topic.id ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-ink'}`}>
                {topic.label} · {topic.count}
              </button>
            ))}
          </div>
          {current && (
            <ul className="mt-2 space-y-1.5 rounded-2xl border border-white/10 p-3 text-sm">
              {current.refs.map((ref) => (
                <li key={ref.url}>
                  <a href={ref.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[#C9A96A]">
                    <ExternalLink size={13} />{ref.from}{ref.date ? ` · ${ref.date.split('-').reverse().slice(0, 2).join('.')}` : ''}
                  </a>
                </li>
              ))}
              <li className="pt-1 text-xs text-ink/55">В пост пойдёт своя фраза KEDR на эту тему, например: «{current.angles[0]}»</li>
            </ul>
          )}
        </div>
      )}
      {DATES.length > 0 && (
        <p className="text-xs text-ink/60">Даты в плане: {DATES.map((item) => item.label).join(' · ')}</p>
      )}
    </GlassCard>
  )
}
