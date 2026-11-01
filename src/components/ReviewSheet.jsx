import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'
import { shownPost } from '../lib/compose.js'
import { Chameleon, StatusMark, teamNote } from './StatusButtons.jsx'

export default function ReviewSheet({ day, onApprove, onAgree, onRedo, onClose }) {
  if (!day) return null
  const date = dateForDay(day.day)
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-3 sm:items-center">
      <section className="w-full max-w-xl rounded-[28px] border border-[#C9A96A]/35 bg-[#121A14] p-5 shadow-2xl">
        <p className="font-fraunces text-4xl tracking-[0.12em] text-[#C9A96A]">ПРОВЕРКА</p>
        <p className="mt-2 text-sm text-[#7A8580]">{formatLong(date)} · {formatWeekday(date)} · {day.title}</p>
        <div className="mt-2"><StatusMark status={day.status} decidedBy={day.decidedBy} /></div>
        {teamNote(day) && <p className="mt-2 text-sm text-[#7DCE6A]">{teamNote(day)}</p>}
        <p className="mt-4 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{shownPost(day)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={onApprove} className="inline-flex items-center gap-1.5 rounded-xl bg-[#7DCE6A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B]"><Chameleon />Утвердил</button>
          <button type="button" onClick={onAgree} className="rounded-xl border border-[#C9A96A]/40 px-4 py-2.5 text-sm text-[#F4F0E6]">Согласовано</button>
          <button type="button" onClick={onRedo} className="rounded-xl bg-[#C6FF5E] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B]">Переделать</button>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-[#F4F0E6]/70">Закрыть</button>
        </div>
      </section>
    </div>
  )
}
