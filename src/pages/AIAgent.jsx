import { useMemo, useState } from 'react'
import { contentPlan } from '../data/contentPlan.js'
import { RUBRICS, generateTelegramPost } from '../lib/generateContent.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'

export default function AIAgent({ day, canAct, onApply, onCopy }) {
  const dishes = useMemo(() => contentPlan.map((item) => ({ id: item.day, label: item.dish, scene: item.scene, margin: item.margin })), [])
  const [rubricId, setRubricId] = useState('sense')
  const [topic, setTopic] = useState(day.scene)
  const [dishId, setDishId] = useState(day.day)
  const plate = dishes.find((item) => item.id === Number(dishId)) || dishes[0]
  const text = generateTelegramPost(rubricId, topic, { dish: plate.label, margin: plate.margin })

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className="space-y-4 lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]">Правило 70/30</p>
        <h2 className="font-display text-4xl italic text-[#F4F0E6]">Пост для Telegram</h2>
        <p className="text-sm leading-relaxed text-[#7A8580]">Сначала сцена. Потом одно блюдо из плана меню. В конце адрес, часы и телефон. Чужие рестораны из каналов сюда не попадают.</p>
        <label className="block text-sm text-[#F4F0E6]">
          Рубрика
          <select value={rubricId} onChange={(event) => setRubricId(event.target.value)} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3">
            {RUBRICS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        <label className="block text-sm text-[#F4F0E6]">
          Сцена
          <textarea value={topic} onChange={(event) => setTopic(event.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3" />
        </label>
        <label className="block text-sm text-[#F4F0E6]">
          Блюдо из меню
          <select value={dishId} onChange={(event) => setDishId(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3">
            {dishes.map((item) => <option key={item.id} value={item.id}>День {item.id}. {item.label}</option>)}
          </select>
        </label>
      </GlassCard>
      <GlassCard className="lg:col-span-7">
        <p className="text-xs text-[#7A8580]">Готовый текст · день {day.day}</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#F4F0E6]">{text}</pre>
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton tone="signal" onClick={() => onCopy(text)}>Скопировать</PremiumButton>
          <PremiumButton disabled={!canAct} onClick={() => onApply(text)}>Поставить на выбранный день</PremiumButton>
        </div>
      </GlassCard>
    </div>
  )
}
