import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, Image as ImageIcon, Sparkles } from 'lucide-react'
import { dateForDay, isoDate } from '../lib/planDates.js'
import { occupancyForDay } from '../data/november2026.js'
import { dailyFromDay, logEntry, weeklySummary } from '../lib/dailyDesk.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'
import { StatusMark } from '../components/StatusButtons.jsx'

const LOG_KEY = 'restprime-content-log'

function readLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOG_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function DailyDesk({ days, today, canAct, onCopy, onStatus }) {
  const [picked, setPicked] = useState(today?.day || days[0]?.day || 1)
  const [log, setLog] = useState(readLog)
  const [form, setForm] = useState({ replies: '', reach: '', likes: '' })
  const day = days.find((item) => item.day === Number(picked)) || days[0]
  const date = dateForDay(day.day)
  const pack = useMemo(() => dailyFromDay(day, occupancyForDay(day.day), date), [day, date])
  const parts = (pack.post || '').split('\n\n')
  const question = parts.length > 2 ? parts[parts.length - 2] : ''
  const entry = log.find((item) => item.date === pack.date) || null
  const report = useMemo(() => weeklySummary(log, date), [log, date])

  useEffect(() => {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(log)) } catch { /* память закрыта */ }
  }, [log])

  function saveEntry() {
    if (!pack.post) return
    setLog((current) => logEntry(current, {
      date: pack.date,
      rubric: pack.rubric,
      format: pack.format,
      published: true,
      replies: Number(form.replies) || 0,
      reach: Number(form.reach) || 0,
      likes: Number(form.likes) || 0,
    }))
    setForm({ replies: '', reach: '', likes: '' })
    onStatus?.(day.day, 'approved')
  }

  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <GlassCard className="space-y-4 lg:col-span-5">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]"><Sparkles size={14} />Автомат дня</p>
        <h2 className="font-display text-4xl italic text-[#F4F0E6]">{pack.label}</h2>
        <p className="text-sm leading-relaxed text-[#7A8580]">
          {pack.weekday} · {pack.rubric} · формат: {pack.format}. {pack.inPlan ? `День ${pack.day} плана.` : 'Даты нет в плане — рубрика взята по дню недели.'}
          {pack.event ? ` Плюсом событие: ${pack.event.title}.` : ''}
        </p>
        <label className="block text-sm text-[#F4F0E6]">
          День
          <select value={day.day} onChange={(event) => setPicked(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{isoDate(dateForDay(item.day))} · {item.title}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <PremiumButton tone="signal" disabled={!canAct || !pack.post || day.status === 'approved'} onClick={() => onStatus?.(day.day, 'approved')}>День выполнен</PremiumButton>
          <StatusMark status={day.status} decidedBy={day.decidedBy} />
        </div>
        <div className="rounded-2xl border border-[#C9A96A]/25 p-3">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]"><ClipboardList size={13} />Учёт публикации</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {['replies', 'reach', 'likes'].map((key) => (
              <label key={key} className="text-[11px] text-[#7A8580]">
                {key === 'replies' ? 'Ответы' : key === 'reach' ? 'Охват' : 'Лайки'}
                <input
                  inputMode="numeric"
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value.replace(/\D/g, '') })}
                  className="mt-1 w-full rounded-xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-2 py-2 text-sm text-[#F4F0E6]"
                />
              </label>
            ))}
          </div>
          <button type="button" disabled={!canAct || !pack.post} onClick={saveEntry} className="mt-2 w-full rounded-xl border border-[#C6FF5E]/40 px-3 py-2 text-xs text-[#C6FF5E] disabled:opacity-40">Сохранить и отметить выполненным</button>
          {entry && <p className="mt-2 text-xs text-[#7DCE6A]">Записано: ответы {entry.replies || 0}, охват {entry.reach || 0}, лайки {entry.likes || 0}.</p>}
        </div>
      </GlassCard>

      <div className="space-y-4 lg:col-span-7">
        <GlassCard className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Пост</p>
          {pack.post ? (
            <>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#F4F0E6]">{pack.post}</pre>
              <div className="flex flex-wrap items-center gap-2">
                <PremiumButton tone="ghost" onClick={() => onCopy?.(pack.post)}>Скопировать пост</PremiumButton>
                {question && <span className="rounded-full border border-[#C9A96A]/40 px-3 py-1.5 text-xs text-[#C9A96A]">Вопрос дня: {question}</span>}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#F4F0E6]">Зал занят: {pack.occupancy}. Пост на этот день не ставим.</p>
          )}
        </GlassCard>

        {pack.frames.length > 0 && (
          <GlassCard className="space-y-3">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]"><ImageIcon size={13} />Три кадра</p>
            {pack.frames.map((frame) => (
              <article key={frame.id} className="rounded-2xl border border-white/10 p-3">
                <p className="text-xs text-[#C9A96A]">{frame.label} · {frame.lens}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#F4F0E6]/85">{frame.prompt}</p>
                <button type="button" onClick={() => onCopy?.(frame.prompt)} className="mt-1 text-[11px] text-[#C9A96A] underline decoration-[#C9A96A]/30 underline-offset-2">Скопировать кадр</button>
              </article>
            ))}
          </GlassCard>
        )}

        {pack.afisha && (
          <GlassCard className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Афиша · фон и блоки отдельно</p>
            <p className="text-xs text-[#7A8580]">{pack.afisha.canvas}</p>
            <p className="text-xs leading-relaxed text-[#F4F0E6]/85">{pack.afisha.background}</p>
            <ul className="space-y-1 text-xs text-[#F4F0E6]/85">
              {pack.afisha.blocks.map((block) => (
                <li key={block.role}><span className="text-[#C9A96A]">{block.role}:</span> «{block.text}» — {block.place}, {block.font}, {block.size}</li>
              ))}
            </ul>
            <PremiumButton tone="ghost" onClick={() => onCopy?.(pack.afisha.background)}>Скопировать фон</PremiumButton>
          </GlassCard>
        )}

        {pack.checklist.length > 0 && (
          <GlassCard className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Чек-лист публикации</p>
            {pack.checklist.map((line) => (
              <p key={line} className="flex gap-2 text-xs leading-relaxed text-[#F4F0E6]/85"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#7DCE6A]" />{line}</p>
            ))}
          </GlassCard>
        )}

        <GlassCard className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Сводка недели {report.from} — {report.to}</p>
          {report.note ? <p className="text-xs text-[#7A8580]">{report.note}</p> : null}
          {report.rows.length > 0 && (
            <>
              <div className="grid gap-1 text-xs text-[#F4F0E6]/85">
                {report.rows.map((row) => (
                  <p key={row.rubric} className="flex items-baseline justify-between gap-2 rounded-xl border border-white/10 px-3 py-1.5">
                    <span>{row.rubric}</span>
                    <span className="text-[#7A8580]">{row.posts} пост · {row.replies} отв. · {row.reach} охв.</span>
                  </p>
                ))}
              </div>
              <p className="text-xs text-[#C9A96A]">
                {report.best ? `Больше ответов на пост: ${report.best.rubric}. ` : ''}
                {report.swap ? `Заменить «${report.weak.rubric}» на «${report.swap.to}»: ${report.swap.why}.` : 'Менять рубрику пока рано: данных мало или лидеры совпадают.'}
              </p>
            </>
          )}
          <p className="text-[11px] text-[#7A8580]">Учёт в кабинете живёт в этом браузере. Общая база для сводки — src/data/contentLog.json и npm run post:week.</p>
        </GlassCard>
      </div>
    </section>
  )
}
