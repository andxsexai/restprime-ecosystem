import { ShieldCheck } from 'lucide-react'
import { dateForDay, formatLong } from '../lib/planDates.js'
import { shownPost } from '../lib/compose.js'
import { checkPlan } from '../lib/checkAgent.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import { StatusMark } from '../components/StatusButtons.jsx'

const TONE = {
  stop: 'border-red-300/50 bg-red-300/10',
  fix: 'border-[#C9A96A]/40 bg-[#C9A96A]/10',
  ok: 'border-[#7DCE6A]/35 bg-[#7DCE6A]/10',
}

export default function CheckDesk({ days, canAct, onOpen, onRebuild, onReview }) {
  const report = checkPlan(days)
  return (
    <section className="space-y-5">
      <GlassCard className="rounded-[28px] p-5">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]"><ShieldCheck size={14} />Агент проверки</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Смотрит план сам</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Это и есть автопроверка текстов: часы, скидка на день рождения, чужие цитаты, задвоенные телефоны, мероприятие без строки в посте, повторы. Аналитика по словам убрана — она ничего не ловила.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-red-300/40 px-4 py-3">
            <p className="text-xs text-ink/50">Стоп</p>
            <p className="font-fraunces text-4xl text-red-200">{report.stop}</p>
          </div>
          <div className="rounded-2xl border border-[#C9A96A]/35 px-4 py-3">
            <p className="text-xs text-ink/50">Поправить</p>
            <p className="font-fraunces text-4xl text-[#C9A96A]">{report.fix}</p>
          </div>
          <div className="rounded-2xl border border-[#7DCE6A]/35 px-4 py-3">
            <p className="text-xs text-ink/50">Чисто</p>
            <p className="font-fraunces text-4xl text-[#7DCE6A]">{report.ok}</p>
          </div>
        </div>
      </GlassCard>
      <div className="grid gap-3 lg:grid-cols-2">
        {report.days.map((item) => {
          const day = days.find((entry) => entry.day === item.day)
          if (!day) return null
          return (
            <GlassCard key={item.day} className={`rounded-2xl p-4 ${TONE[item.level]}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-fraunces text-2xl text-ink">{formatLong(dateForDay(item.day))}</p>
                <StatusMark status={day.status} decidedBy={day.decidedBy} />
                <span className="text-[11px] uppercase tracking-widest text-ink/45">{item.level === 'ok' ? 'чисто' : item.level === 'stop' ? 'стоп' : 'поправить'}</span>
              </div>
              <p className="mt-1 text-sm text-ink/80">{item.title}</p>
              {item.event && <p className="mt-1 text-xs text-[#C6FF5E]">Мероприятие: {item.event.title}</p>}
              {item.issues.length === 0 ? (
                <p className="mt-2 text-sm text-[#7DCE6A]">Замечаний нет. Можно читать в плане и утверждать.</p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                  {item.issues.map((issue) => (
                    <li key={issue.id}>
                      <span className={issue.level === 'stop' ? 'text-red-200' : 'text-[#C9A96A]'}>{issue.text}</span>
                      {issue.fix && <span className="block text-xs text-ink/50">{issue.fix}</span>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 line-clamp-3 text-xs text-ink/55">{shownPost(day)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpen(item.day)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink">Открыть день</button>
                <button type="button" disabled={!canAct} onClick={() => onRebuild(item.day)} className="rounded-full bg-[#C6FF5E] px-3 py-1.5 text-xs font-semibold text-[#0A0F0B] disabled:opacity-40">Пересобрать</button>
                <button type="button" disabled={!canAct} onClick={() => onReview(day)} className="rounded-full border border-[#C9A96A]/40 px-3 py-1.5 text-xs text-[#C9A96A] disabled:opacity-40">На проверку</button>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </section>
  )
}
