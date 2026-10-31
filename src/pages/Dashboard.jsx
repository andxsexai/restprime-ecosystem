import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { FLAGSHIP } from '../data/place.js'
import { shownPost } from '../lib/compose.js'
import { weekSeries } from '../lib/mockData.js'
import { dateForDay, formatLong } from '../lib/planDates.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'
import ExtensionBar from '../components/ExtensionBar.jsx'

export default function Dashboard({
  day, days, todayNumber, news, canAct, onPublish, onAdapt, onOpenAgent, onToggleExtension,
}) {
  const series = weekSeries(days, todayNumber || day.day)
  const text = shownPost(day)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className="lg:col-span-7">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Выход сегодня</p>
        <h2 className="font-display mt-2 text-4xl italic text-[#F4F0E6]">{day.title}</h2>
        <p className="mt-1 text-sm text-[#7A8580]">{formatLong(dateForDay(day.day))} · день {day.day}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{text}</p>
        <ExtensionBar day={day} canAct={canAct} onToggle={(id) => onToggleExtension(day.day, id)} />
        <div className="mt-4">
          <PremiumButton disabled={!canAct} onClick={onPublish}>Скопировать и открыть Telegram</PremiumButton>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]">Тексты семи дней</p>
        <h2 className="font-display mt-2 text-3xl italic text-[#F4F0E6]">Объём постов</h2>
        <p className="mt-1 text-xs leading-relaxed text-[#7A8580]">Слова в текстах плана. Это не охват Instagram: живых цифр Meta в кабинете нет.</p>
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid stroke="rgba(201,169,106,0.12)" vertical={false} />
              <XAxis dataKey="label" stroke="#7A8580" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#7A8580" fontSize={12} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: '#121A14', border: '1px solid rgba(201,169,106,0.3)', borderRadius: 12, color: '#F4F0E6' }} />
              <Line type="monotone" dataKey="words" name="Слова" stroke="#C6FF5E" strokeWidth={2} dot={{ r: 3, fill: '#C6FF5E' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="lg:col-span-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Радар</p>
        <h2 className="font-display mt-2 text-3xl italic text-[#F4F0E6]">Новости до сегодня</h2>
        <ul className="mt-4 space-y-3">
          {news.slice(0, 3).map((item) => (
            <li key={item.id} className="border-t border-[#C9A96A]/15 pt-3">
              <p className="text-xs text-[#7A8580]">{item.dateLabel} · {item.source}</p>
              <p className="mt-1 text-sm text-[#F4F0E6]">{item.title}</p>
              <PremiumButton tone="ghost" className="mt-2 px-3 py-1.5 text-xs" disabled={!canAct} onClick={() => onAdapt(item)}>
                Перенести в пост KEDR
              </PremiumButton>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="lg:col-span-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Флагман</p>
        <h2 className="font-display mt-2 text-4xl italic text-[#F4F0E6]">{FLAGSHIP.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#F4F0E6]/80">Один зал. д. Зайцево, ул. Сосновая, 3. Каждый день с 12:00 до 24:00.</p>
        <p className="mt-2 text-sm text-[#7A8580]">+7 (495) 274-53-54 · +7 (929) 979-53-54</p>
        <a href={FLAGSHIP.site} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-[#C9A96A]">kedr-res.ru</a>
      </GlassCard>

      <GlassCard className="lg:col-span-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C6FF5E]">Агент</p>
        <h2 className="font-display mt-2 text-3xl italic text-[#F4F0E6]">Тон для Telegram</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7A8580]">Семьдесят процентов — сцена вечера. Тридцать — адрес, часы и стол. Блюдо берётся из меню дня, не из чужого канала.</p>
        <PremiumButton tone="signal" className="mt-4" onClick={onOpenAgent}>Открыть агента</PremiumButton>
      </GlassCard>
    </div>
  )
}
