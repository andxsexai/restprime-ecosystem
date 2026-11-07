import { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { generateInfinitePlan } from '../lib/generateContent.js'
import { proposePosts, shownPost } from '../lib/compose.js'
import { NOVEMBER_2026, NOVEMBER_ANNOUNCEMENT, occupancyByIso } from '../data/november2026.js'
import { StatusMark, statusTone, teamNote } from '../components/StatusButtons.jsx'
import RouletteText from '../components/RouletteText.jsx'
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
  if (status === 'event') return `block-hover border-[#C9A96A] bg-[#C9A96A]/10 text-[#F4F0E6] ${active ? 'ring-1 ring-[#C9A96A]' : ''}`
  return `block-hover border-dashed border-[#7A8580]/50 bg-transparent text-[#7A8580] ${active ? 'ring-1 ring-[#7A8580]/40' : ''}`
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
  const ideas = useMemo(() => {
    if (!selected) return []
    const source = live || {
      day: selected.dayNumber,
      scene: selected.scene,
      dish: selected.dish,
      margin: selected.margin,
      pillar: selected.pillar,
      title: selected.title,
    }
    const [year, month, day] = selected.date.split('-').map(Number)
    return proposePosts(source, new Date(year, month - 1, day), 3)
  }, [live, selected])

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
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
      <div className="order-2 space-y-5 lg:order-1 lg:col-span-8">
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
              <button key={item.date} type="button" onClick={() => chooseHall(item)} className={`group rounded-2xl border p-3 text-left ${hallClass(item.status, active)}`}>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider">
                  {item.status === 'booked' && <Lock size={11} />}
                  {item.date === todayIso ? 'Сегодня · ' : ''}{item.dayOfWeek}
                </span>
                <RouletteText className="mt-1 text-sm font-medium">{item.date.slice(8)}. {item.status === 'free' ? 'Свободно' : item.title}</RouletteText>
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
                  <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setPickedDate(item.date) }} className={`group block-hover rounded-2xl border p-3 text-left ${item.date === todayIso ? 'border-[#C6FF5E]' : ''} ${liveDay ? statusTone(liveDay.status).ring : ''} ${hallSlot?.status === 'booked' ? 'bg-[#0A0F0B]/80' : hallSlot?.status === 'event' ? 'border-[#C9A96A] bg-[#C9A96A]/10' : ''} ${active ? 'bg-[#C6FF5E]/10' : 'border-[#C9A96A]/20 bg-[#121A14]/60'}`}>
                    <span className="text-[10px] uppercase tracking-wider text-[#7A8580]">{item.date === todayIso ? 'Сегодня · ' : ''}{item.type === 'reel' ? 'Рилс' : 'Пост'} · {item.label}</span>
                    <RouletteText className="mt-1 text-sm font-medium text-[#F4F0E6]">{hallSlot?.status === 'booked' ? hallSlot.title : liveDay?.event?.title || liveDay?.title || item.title}</RouletteText>
                    {hallSlot?.status === 'booked' ? <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#7A8580]"><Lock size={11} />Занято</span> : liveDay ? <span className="mt-1 block"><StatusMark status={liveDay.status} decidedBy={liveDay.decidedBy} /></span> : <span className="mt-1 block text-xs text-[#C9A96A]">{item.rubric}</span>}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <aside className="group order-1 sticky top-20 z-20 mb-2 self-start max-h-[calc(100vh-5.5rem)] lg:order-2 lg:col-span-4 lg:mb-0">
        <div className="flex max-h-[inherit] flex-col overflow-hidden rounded-3xl border border-[#C9A96A]/25 bg-[#121A14]/90 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[#C9A96A]/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <div className="shrink-0 border-b border-white/10 px-5 pb-3 pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">День в окне</p>
            <h3 className="font-display mt-1 text-3xl italic leading-none text-[#F4F0E6]">
              <RouletteText>{slot ? `${slot.date.slice(8)} ноября` : selected?.label || 'Выберите день'}</RouletteText>
            </h3>
            {slot && <p className="mt-2 text-sm text-[#7A8580]">{slot.dayOfWeek} · {slot.status === 'free' ? 'свободно' : slot.status === 'event' ? 'событие зала' : 'зал занят'}</p>}
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {slot && (
              <div className="rounded-2xl border border-white/10 px-3 py-3">
                <RouletteText className="text-sm text-[#F4F0E6]">{slot.status === 'free' ? 'Можно поставить свой формат' : slot.title}</RouletteText>
                {slot.status === 'booked' && <p className="mt-1 text-xs text-[#7A8580]">Зал занят. Свой ивент на эту дату не ставим. В пост гостю свадьбу не пишем.</p>}
                {slot.event && <p className="mt-2 text-sm leading-relaxed text-[#F4F0E6]/80">{slot.event.hook} {slot.event.how?.[0]}</p>}
              </div>
            )}
            {!selected && <p className="text-sm text-[#7A8580]">Выберите день сетки или контент-плана — окно останется рядом, когда пойдёте вниз.</p>}
            {selected && (
              <>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">{selected.rubric}</p>
                {live && <StatusMark status={live.status} decidedBy={live.decidedBy} />}
                {live && teamNote(live) && <p className={`text-sm font-semibold ${statusTone(live.status).text}`}>{teamNote(live)}</p>}
                <h4 className="font-display text-2xl italic text-[#F4F0E6]">
                  <RouletteText>{live?.event?.title || live?.title || selected.title}</RouletteText>
                </h4>
                <p className="text-sm text-[#7A8580]">{selected.hook}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{draft}</p>
                <div className="flex flex-wrap gap-2">
                  <PremiumButton onClick={() => onCopy(draft)}>Скопировать пост дня</PremiumButton>
                  {selected.inCabinet && <PremiumButton tone="ghost" onClick={() => onOpenDay(selected.dayNumber)}>Открыть в плане</PremiumButton>}
                </div>
                {ideas.length > 0 && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Ещё заходы</p>
                    <p className="text-xs leading-relaxed text-[#7A8580]">Тот же день, другая рубрика. Чужой текст не копируем, блюдо только из меню.</p>
                    {ideas.map((idea) => (
                      <article key={idea.id} className="group rounded-2xl border border-white/10 bg-[#0A0F0B]/70 p-3">
                        <RouletteText className="text-[11px] uppercase tracking-[0.14em] text-[#C9A96A]">{idea.rubric}</RouletteText>
                        <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/85">{idea.text}</p>
                        <button type="button" onClick={() => onCopy(idea.text)} className="mt-2 text-xs text-[#C9A96A] underline decoration-[#C9A96A]/30 underline-offset-2">Скопировать этот</button>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="border-t border-white/10 pt-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Анонс ноября</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/85">{NOVEMBER_ANNOUNCEMENT}</p>
              <PremiumButton className="mt-3" onClick={() => onCopy(NOVEMBER_ANNOUNCEMENT)}>Скопировать анонс</PremiumButton>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function monthTitle(key) {
  const [year, month] = key.split('-').map(Number)
  const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  return `${names[month - 1]} ${year}`
}
