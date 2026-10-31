import { useState } from 'react'
import { RUBRICS, generateTelegramPost } from '../lib/generateContent.js'
import { dateForDay, formatLong } from '../lib/planDates.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'

export default function AIAgent({ days, day, canAct, onPick, onRebuild, onCopy }) {
  const [rubricId, setRubricId] = useState('sense')
  const rubric = RUBRICS.find((item) => item.id === rubricId) || RUBRICS[0]
  const text = generateTelegramPost(rubricId, day.scene, { dish: day.dish, margin: day.margin })

  function rebuild() {
    const index = RUBRICS.findIndex((item) => item.id === rubricId)
    const next = RUBRICS[(index + 1) % RUBRICS.length]
    setRubricId(next.id)
    onRebuild(day.day, generateTelegramPost(next.id, day.scene, { dish: day.dish, margin: day.margin }))
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className="space-y-4 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]">Агент</p>
        <h2 className="font-display text-4xl italic text-[#F4F0E6]">Пересобрать день</h2>
        <p className="text-sm leading-relaxed text-[#7A8580]">
          Сначала выбирается день плана. Агент берёт его сцену и блюдо из меню и пишет пост. Кнопка «Пересобрать» кладёт текст в этот день и ставит его на проверку. Чужие рестораны сюда не попадают.
        </p>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {days.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() => onPick(item.day)}
              className={`rounded-2xl border px-3 py-2 text-left ${item.day === day.day ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-white/10 text-[#F4F0E6]'}`}
            >
              <span className="font-display block text-2xl italic">{formatLong(dateForDay(item.day))}</span>
              <span className={`block text-xs ${item.day === day.day ? 'text-[#0A0F0B]/70' : 'text-[#7A8580]'}`}>{item.title}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-[#F4F0E6]">Сцена: {day.scene}</p>
        <p className="text-sm text-[#C9A96A]">Блюдо меню: {day.dish}</p>
        <div className="flex flex-wrap gap-2">
          {RUBRICS.map((item) => (
            <button key={item.id} type="button" onClick={() => setRubricId(item.id)} className={`rounded-full px-3 py-1.5 text-xs ${item.id === rubricId ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
              {item.title}
            </button>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="lg:col-span-7">
        <p className="text-xs text-[#7A8580]">Куда уйдёт текст · {formatLong(dateForDay(day.day))} · {rubric.title}</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#F4F0E6]">{text}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton tone="signal" disabled={!canAct} onClick={rebuild}>Пересобрать</PremiumButton>
          <PremiumButton disabled={!canAct} onClick={() => onRebuild(day.day, text)}>Поставить эту версию</PremiumButton>
          <PremiumButton tone="ghost" onClick={() => onCopy(text)}>Скопировать</PremiumButton>
        </div>
      </GlassCard>
    </div>
  )
}
