import { useState } from 'react'
import { RUBRICS, generateTelegramPost } from '../lib/generateContent.js'
import { dateForDay, formatLong } from '../lib/planDates.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'

const RUBRIC_SOURCES = {
  sense: 'Сенсорика берёт дорогу, свет и тишину. Блюдо не открывает текст.',
  kitchen: 'Кухня изнутри говорит о тарелке только если она есть в меню этого дня.',
  events: 'События держат повод: день рождения в меню — скидка 10%, три дня до и три после.',
  people: 'Люди — про тех, кто уже сел, не про чужой зал.',
  engage: 'Вовлечение задаёт один вопрос и оставляет kedr-res.ru.',
  service: 'Сервис говорит, куда писать, и не обещает бронь на следующий год.',
}

export default function AIAgent({ days, day, canAct, onPick, onRebuild, onUndo, onCopy }) {
  const [picked, setPicked] = useState(day.day)
  const [rubricId, setRubricId] = useState('sense')
  const current = days.find((item) => item.day === picked) || day
  const rubric = RUBRICS.find((item) => item.id === rubricId) || RUBRICS[0]
  const text = generateTelegramPost(rubricId, current.scene, { dish: current.dish, margin: current.margin })
  const when = formatLong(dateForDay(current.day))

  function choose(dayNumber) {
    setPicked(dayNumber)
    onPick(dayNumber)
  }

  function rebuild() {
    onRebuild(current.day, text)
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className="space-y-4 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]">Агент</p>
        <h2 className="font-display text-4xl italic text-[#F4F0E6]">Пересобрать день</h2>
        <p className="text-sm leading-relaxed text-[#7A8580]">
          Выбранный день подсвечен сразу. «Пересобрать» пишет тот текст, который виден справа, именно на эту дату. Раньше уведомление называло номер плана, и казалось, что текст ушёл в другой день.
        </p>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {days.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() => choose(item.day)}
              className={`rounded-2xl border px-3 py-2 text-left ${item.day === current.day ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-white/10 text-[#F4F0E6]'}`}
            >
              <span className="font-display block text-2xl italic">{formatLong(dateForDay(item.day))}</span>
              <span className={`block text-xs ${item.day === current.day ? 'text-[#0A0F0B]/70' : 'text-[#7A8580]'}`}>{item.title}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-[#F4F0E6]">Сцена: {current.scene}</p>
        <p className="text-sm text-[#C9A96A]">Блюдо меню: {current.dish}</p>
        <div className="flex flex-wrap gap-2">
          {RUBRICS.map((item) => (
            <button key={item.id} type="button" onClick={() => setRubricId(item.id)} className={`rounded-full px-3 py-1.5 text-xs ${item.id === rubricId ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-[#F4F0E6]'}`}>
              {item.title}
            </button>
          ))}
        </div>
        <p className="rounded-2xl border border-white/10 px-3 py-3 text-sm leading-relaxed text-[#F4F0E6]/80">{RUBRIC_SOURCES[rubric.id]}</p>
      </GlassCard>
      <GlassCard className="lg:col-span-7">
        <p className="text-xs text-[#7A8580]">Куда уйдёт текст · {when} · {current.title} · {rubric.title}</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#F4F0E6]">{text}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton tone="signal" disabled={!canAct} onClick={rebuild}>Пересобрать · {when}</PremiumButton>
          <PremiumButton tone="ghost" disabled={!canAct} onClick={onUndo}>Убрать действие</PremiumButton>
          <PremiumButton tone="ghost" onClick={() => onCopy(text)}>Скопировать</PremiumButton>
        </div>
      </GlassCard>
    </div>
  )
}
