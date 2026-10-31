import { useState } from 'react'
import { writeFromNews } from '../lib/compose.js'
import { dateForDay, formatLong } from '../lib/planDates.js'

export default function TrendFeed({ items, days, day, canAct, onWrite, onPick }) {
  const [openId, setOpenId] = useState(items[0]?.id || null)
  const current = items.find((item) => item.id === openId) || items[0]
  const kedrText = current ? writeFromNews(day, current, 'short') : ''

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Лента</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Сначала оригинал, потом текст KEDR</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Источник — издание или сайт, с которого взята заметка. Ссылка открывает оригинал. Ниже агент собирает пост выбранного дня: сцена и блюдо остаются из меню KEDR.
        </p>
        <label className="mt-4 block text-sm text-ink/70">
          День, на который собрать пост
          <select value={day.day} onChange={(event) => onPick(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-ink">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · {item.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className={`w-full rounded-2xl border p-4 text-left ${item.id === current?.id ? 'border-[#C9A96A] bg-[#C9A96A]/10' : 'border-white/10 bg-card'}`}
            >
              <p className="text-xs font-semibold text-[#C9A96A]">{item.source}</p>
              <p className="mt-1 text-[11px] text-ink/50">{item.service} · {item.dateLabel}</p>
              <p className="mt-2 text-sm text-ink">{item.title}</p>
            </button>
          ))}
        </div>
        {current && (
          <div className="space-y-4 lg:col-span-8">
            <article className="rounded-[28px] border border-white/10 bg-card p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#C9A96A]">Оригинал</p>
              <h3 className="font-fraunces mt-2 text-3xl text-ink">{current.title}</h3>
              <p className="mt-2 text-sm text-[#C9A96A]">{current.source} · {current.service} · {current.dateLabel}</p>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink/85">{current.watch}</p>
              <a href={current.url} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl border border-[#C9A96A]/40 px-4 py-2 text-sm text-[#F4F0E6]">Открыть оригинал</a>
            </article>
            <article className="rounded-[28px] border border-[#C6FF5E]/25 bg-card p-6">
              <p className="text-xs uppercase tracking-[0.16em] text-[#C6FF5E]">Текст KEDR · {formatLong(dateForDay(day.day))}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{kedrText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={!canAct} onClick={() => onWrite(current, 'short')} className="rounded-xl bg-[#C6FF5E] px-4 py-2 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Поставить на этот день</button>
                <button type="button" disabled={!canAct} onClick={() => onWrite(current, 'wide')} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink disabled:opacity-40">Широкий, до 500 слов</button>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  )
}
