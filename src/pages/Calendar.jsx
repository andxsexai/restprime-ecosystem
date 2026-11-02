import { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { generateInfinitePlan } from '../lib/generateContent.js'
import { shownPost } from '../lib/compose.js'
import { NOVEMBER_2026, NOVEMBER_ANNOUNCEMENT, occupancyByIso } from '../data/november2026.js'
import { StatusMark, statusTone, teamNote } from '../components/StatusButtons.jsx'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'post', label: 'Посты' },
  { id: 'reel', label: 'Рилс' },
]

const HALL = [
  { id: 'all', label: 'Вся сетка' },
  { id: 'booked', label: 'Занято' },
  { id: 'event', label: 'События' },
  { id: 'free', label: 'Свободно' },
]

function hallClass(status, active) {
  if (status === 'booked') return `cursor-default border-white/10 bg-[#0A0F0B]/90 text-[#7A8580] ${active ? 'ring-1 ring-white/20' : ''}`
  if (status === 'event') return `border-[#C9A96A] bg-[#C9A96A]/10 text-[#F4F0E6] transition hover:scale-[1.02] ${active ? 'ring-1 ring-[#C9A96A]' : ''}`
  return `border-dashed border-[#7A8580]/50 bg-transparent text-[#7A8580] ${active ? 'ring-1 ring-[#7A8580]/40' : ''}`
}

export default function Calendar({ days, todayIso, onOpenDay, onCopy }) {
  const [filter, setFilter] = useState('all')
  const [hall, setHall] = useState('all')
  const [span, setSpan] = useState('near')
  const [selectedId, setSelectedId] = useState(todayIso || null)
  const [pickedDate, setPickedDate] = useState(todayIso || '2026-11-01')
  const plan = useMemo(() => generateInfinitePlan(), [])
  const visible = plan.filter((item) => filter === 'all' || item.type === filter)
  const selected = plan.find((item) => item.id === selectedId) || null
  const live = selected?.inCabinet ? days.find((day) => day.day === selected.dayNumber) : null
  const draft = live ? shownPost(live) : selected?.draft || ''
  const slot = occupancyByIso(pickedDate)
  const hallDays = NOVEMBER_2026.filter((item) => hall === 'all' || item.status === hall)

  const months = []
  visible.forEach((item) => {
    const key = item.date.slice(0, 7)
    const bucket = months.find((month) => month.key === key)
    if (bucket) bucket.items.push(item)
    else months.push({ key, items: [item] })
  })
  const monthKeys = months.map((month) => month.key)
  const todayKey = (todayIso || monthKeys[0] || '').slice(0, 7)
  const start = Math.max(0, monthKeys.indexOf(todayKey))
  const nearKeys = new Set(monthKeys.slice(start, start + 3))
  const shown = months.filter((month) => (span === 'near' ? nearKeys.has(month.key) : !nearKeys.has(month.key)))

  function chooseHall(item) {
    setPickedDate(item.date)
    const planDay = plan.find((entry) => entry.date === item.date)
    if (planDay) setSelectedId(planDay.id)
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <p className="font-display text-4xl italic text-[#F4F0E6]">Ноябрь 2026 · зал</p>
        <p className="max-w-2xl text-sm text-[#7A8580]">Занятые даты закрыты: на них нельзя поставить свой формат. Свободные заполняем кино, практикой и столом. Пруд, смузи и кинотеатр под открытым небом не обещаем.</p>
        <div className="flex flex-wrap gap-2">
          {HALL.map((item) => (
            <button key={item.id} type="button" onClick={() => setHall(item.id)} className={`rounded-full px-4 py-2 text-sm ${hall === item.id ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'border border-[#C9A96A]/25 text-[#F4F0E6]'}`}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {hallDays.map((item) => {
            const active = item.date === pickedDate
            return (
              <button key={item.date} type="button" onClick={() => chooseHall(item)} className={`rounded-2xl border p-3 text-left ${hallClass(item.status, active)}`}>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  {item.status === 'booked' && <Lock size={11} />}
                  {item.date === todayIso ? 'Сегодня · ' : ''}{item.dayOfWeek}
                </span>
                <span className="mt-1 block text-sm font-medium">{item.date.slice(8)}. {item.status === 'free' ? 'Свободно' : item.title}</span>
                <span className="mt-1 block text-[11px] opacity-70">{item.status === 'booked' ? 'Занято' : item.status === 'event' ? 'Событие' : 'Можно поставить формат'}</span>
              </button>
            )
          })}
        </div>

        <p className="font-display pt-4 text-4xl italic text-[#F4F0E6]">Сегодня {plan.find((item) => item.date === todayIso)?.label || 'вне плана'}</p>
        <p className="max-w-2xl text-sm text-[#7A8580]">Ниже — три ближайших месяца контент-плана. Ноябрьская занятость зала уже стоит сверху.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setSpan('near')} className={`rounded-full px-4 py-2 text-sm ${span === 'near' ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'border border-[#C9A96A]/25 text-[#F4F0E6]'}`}>3 месяца</button>
          <button type="button" onClick={() => setSpan('rest')} className={`rounded-full px-4 py-2 text-sm ${span === 'rest' ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'border border-[#C9A96A]/25 text-[#F4F0E6]'}`}>Остальной год</button>
          {FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-4 py-2 text-sm ${filter === item.id ? 'bg-[#C6FF5E] text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
              {item.label}
            </button>
          ))}
        </div>
        {shown.map((month) => (
          <section key={month.key}>
            <h2 className="font-display mb-3 text-3xl italic text-[#F4F0E6]">{monthTitle(month.key)}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {month.items.map((item) => {
                const active = item.id === selectedId
                const liveDay = item.inCabinet ? days.find((day) => day.day === item.dayNumber) : null
                const hallSlot = occupancyByIso(item.date)
                return (
                  <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setPickedDate(item.date) }} className={`rounded-2xl border p-3 text-left ${item.date === todayIso ? 'border-[#C6FF5E]' : ''} ${liveDay ? statusTone(liveDay.status).ring : ''} ${hallSlot?.status === 'booked' ? 'bg-[#0A0F0B]/80' : hallSlot?.status === 'event' ? 'border-[#C9A96A] bg-[#C9A96A]/10' : ''} ${active ? 'bg-[#C6FF5E]/10' : 'border-[#C9A96A]/20 bg-[#121A14]/60'}`}>
                    <span className="text-[10px] uppercase tracking-wider text-[#7A8580]">{item.date === todayIso ? 'Сегодня · ' : ''}{item.type === 'reel' ? 'Рилс' : 'Пост'} · {item.label}</span>
                    <span className="mt-1 block text-sm font-medium text-[#F4F0E6]">{hallSlot?.status === 'booked' ? hallSlot.title : liveDay?.event?.title || liveDay?.title || item.title}</span>
                    {hallSlot?.status === 'booked' ? <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#7A8580]"><Lock size={11} />Занято</span> : liveDay ? <span className="mt-1 block"><StatusMark status={liveDay.status} decidedBy={liveDay.decidedBy} /></span> : <span className="mt-1 block text-xs text-[#C9A96A]">{item.rubric}</span>}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <GlassCard className="h-fit lg:sticky lg:top-20 lg:col-span-4">
        {slot && (
          <div className="mb-4 rounded-2xl border border-white/10 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">{slot.date.slice(8)} ноября · {slot.dayOfWeek}</p>
            <p className="mt-1 text-sm text-[#F4F0E6]">{slot.status === 'free' ? 'Свободно — можно поставить формат' : slot.title}</p>
            {slot.status === 'booked' && <p className="mt-1 text-xs text-[#7A8580]">Зал занят. Свой ивент на эту дату не ставим. В пост гостю свадьбу не пишем.</p>}
            {slot.event && <p className="mt-2 text-sm leading-relaxed text-[#F4F0E6]/80">{slot.event.hook} {slot.event.how?.[0]}</p>}
          </div>
        )}
        {!selected && <p className="text-sm text-[#7A8580]">Выберите день сетки или контент-плана.</p>}
        {selected && (
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">{selected.label} · {selected.rubric}</p>
            {live && <div className="mt-2"><StatusMark status={live.status} decidedBy={live.decidedBy} /></div>}
            {live && teamNote(live) && <p className={`mt-2 text-sm font-semibold ${statusTone(live.status).text}`}>{teamNote(live)}</p>}
            <h3 className="font-display mt-2 text-3xl italic text-[#F4F0E6]">{live?.event?.title || live?.title || selected.title}</h3>
            <p className="mt-2 text-sm text-[#7A8580]">{selected.hook}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{draft}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PremiumButton onClick={() => onCopy(draft)}>Скопировать пост дня</PremiumButton>
              {selected.inCabinet && <PremiumButton tone="ghost" onClick={() => onOpenDay(selected.dayNumber)}>Открыть в плане</PremiumButton>}
            </div>
          </>
        )}
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Анонс ноября</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/85">{NOVEMBER_ANNOUNCEMENT}</p>
          <PremiumButton className="mt-3" onClick={() => onCopy(NOVEMBER_ANNOUNCEMENT)}>Скопировать анонс</PremiumButton>
        </div>
      </GlassCard>
    </div>
  )
}

function monthTitle(key) {
  const [year, month] = key.split('-').map(Number)
  const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  return `${names[month - 1]} ${year}`
}
