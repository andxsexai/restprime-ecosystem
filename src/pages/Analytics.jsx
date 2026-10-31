import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { statusSeries, weekSeries } from '../lib/mockData.js'
import GlassCard from '../components/ui/GlassCard.jsx'

export default function Analytics({ days, todayNumber }) {
  const week = weekSeries(days, todayNumber)
  const status = statusSeries(days)
  const words = week.reduce((sum, item) => sum + item.words, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className="lg:col-span-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Семь дней</p>
        <p className="font-display mt-2 text-5xl italic text-[#F4F0E6]">{words}</p>
        <p className="mt-1 text-sm text-[#7A8580]">слов в постах плана, не просмотров</p>
      </GlassCard>
      <GlassCard className="lg:col-span-8">
        <h2 className="font-display text-3xl italic text-[#F4F0E6]">Слова по дням</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week}>
              <CartesianGrid stroke="rgba(201,169,106,0.12)" vertical={false} />
              <XAxis dataKey="label" stroke="#7A8580" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#7A8580" fontSize={12} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: '#121A14', border: '1px solid rgba(201,169,106,0.3)', borderRadius: 12, color: '#F4F0E6' }} />
              <Bar dataKey="words" name="Слова" fill="#C9A96A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard className="lg:col-span-12">
        <h2 className="font-display text-3xl italic text-[#F4F0E6]">Статус тридцати дней</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {status.map((item) => (
            <div key={item.name} className="rounded-2xl border border-[#C9A96A]/20 px-4 py-3">
              <p className="text-xs text-[#7A8580]">{item.name}</p>
              <p className="font-display text-4xl italic text-[#F4F0E6]">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
