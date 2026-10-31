import { useMemo, useState } from 'react'
import { generateInfinitePlan } from '../lib/generateContent.js'
import { shownPost } from '../lib/compose.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'post', label: 'Посты' },
  { id: 'reel', label: 'Рилс' },
]

export default function Calendar({ days, todayIso, onOpenDay, onCopy }) {
  const [filter, setFilter] = useState('all')
  const [span, setSpan] = useState('near')
  const [selectedId, setSelectedId] = useState(todayIso || null)
  const plan = useMemo(() => generateInfinitePlan(), [])
  const visible = plan.filter((item) => filter === 'all' || item.type === filter)
  const selected = plan.find((item) => item.id === selectedId) || null
  const live = selected?.inCabinet ? days.find((day) => day.day === selected.dayNumber) : null
  const draft = live ? shownPost(live) : selected?.draft || ''

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-8">
        <p className="font-display text-4xl italic text-[#F4F0E6]">Сегодня {plan.find((item) => item.date === todayIso)?.label || 'вне плана'}</p>
        <p className="max-w-2xl text-sm text-[#7A8580]">На экране три ближайших месяца. Остальной год открывается отдельной вкладкой и не грузит список сразу.</p>
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
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border p-3 text-left ${item.date === todayIso ? 'border-[#C6FF5E]' : ''} ${active ? 'bg-[#C6FF5E]/10' : 'border-[#C9A96A]/20 bg-[#121A14]/60'}`}>
                    <span className="text-[10px] uppercase tracking-wider text-[#7A8580]">{item.date === todayIso ? 'Сегодня · ' : ''}{item.type === 'reel' ? 'Рилс' : 'Пост'} · {item.label}</span>
                    <span className="mt-1 block text-sm font-medium text-[#F4F0E6]">{item.title}</span>
                    <span className="mt-1 block text-xs text-[#C9A96A]">{item.rubric}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
      <GlassCard className="h-fit lg:sticky lg:top-20 lg:col-span-4">
        {!selected && <p className="text-sm text-[#7A8580]">Выберите день. Первые тридцать — живой план из кабинета. Дальше черновики по сезону: своя сцена на каждый день и блюда только из меню от 23 октября.</p>}
        {selected && (
          <>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">{selected.label} · {selected.rubric}</p>
            <h3 className="font-display mt-2 text-3xl italic text-[#F4F0E6]">{live?.title || selected.title}</h3>
            <p className="mt-2 text-sm text-[#7A8580]">{selected.hook}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{draft}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PremiumButton onClick={() => onCopy(draft)}>Скопировать</PremiumButton>
              {selected.inCabinet && <PremiumButton tone="ghost" onClick={() => onOpenDay(selected.dayNumber)}>Открыть в плане</PremiumButton>}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  )
}

function monthTitle(key) {
  const [year, month] = key.split('-').map(Number)
  const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  return `${names[month - 1]} ${year}`
}
