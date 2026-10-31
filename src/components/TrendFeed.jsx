import { useState } from 'react'
import { wordCount, WIDE_SAMPLE } from '../lib/compose.js'
import { dateForDay, formatLong } from '../lib/planDates.js'

export default function TrendFeed({ items, days, day, canAct, onWrite, onPick }) {
  const [openId, setOpenId] = useState(items[0]?.id || null)
  const [sample, setSample] = useState(false)
  const current = items.find((item) => item.id === openId) || items[0]

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-ink/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#2f6b4f]">Мировая лента</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Новости ресторанного года</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
          Материал до сегодняшнего дня. Из него можно переписать пост на любой день плана: короткий или широкий, до 500 слов.
        </p>
        <label className="mt-4 block text-sm text-ink/70">
          День для нового поста
          <select value={day.day} onChange={(event) => onPick(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-ink">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · день {item.day} · {item.title}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setSample((value) => !value)} className="press mt-4 text-sm text-[#2f6b4f]">
          {sample ? 'Скрыть образец широкого поста' : 'Показать образец широкого поста'}
        </button>
        {sample && (
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-paper p-4 font-sans text-sm leading-relaxed text-ink/80">{WIDE_SAMPLE}</pre>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className={`press w-full rounded-2xl border p-4 text-left ${item.id === current?.id ? 'border-[#2f6b4f] bg-card' : 'border-ink/10 bg-card'}`}
            >
              <p className="text-xs text-[#2f6b4f]">{item.dateLabel} · {item.source}</p>
              <p className="mt-1 font-semibold text-ink">{item.title}</p>
            </button>
          ))}
        </div>
        {current && (
          <article className="rounded-[28px] border border-ink/10 bg-card p-6 lg:col-span-7">
            <p className="text-xs text-[#2f6b4f]">{current.service}</p>
            <h3 className="font-fraunces mt-2 text-3xl text-ink">{current.title}</h3>
            <p className="mt-4 text-base leading-relaxed text-ink/80">{current.watch}</p>
            <a href={current.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-[#2f6b4f] underline-offset-4 hover:underline">Открыть источник</a>
            <div className="mt-6 rounded-2xl bg-paper p-4 text-sm leading-relaxed text-ink/80">
              <p className="font-semibold text-ink">Как ляжет на день {day.day}</p>
              <p className="mt-2">{current.title}. Сцена дня: {day.scene}. Опора меню: {day.dish}.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={!canAct} onClick={() => onWrite(current, 'short')} className="press rounded-full bg-[#2f6b4f] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">Короткий пост</button>
              <button type="button" disabled={!canAct} onClick={() => onWrite(current, 'wide')} className="press rounded-full border border-ink/10 px-4 py-2.5 text-sm text-ink disabled:opacity-40">Широкий, до 500 слов</button>
            </div>
            <p className="mt-3 text-xs text-ink/50">Широкий образец — {wordCount(WIDE_SAMPLE)} слов. Потолок формата — 500.</p>
          </article>
        )}
      </div>
    </section>
  )
}
