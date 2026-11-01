import { useEffect, useMemo, useState } from 'react'
import { Copy, MessagesSquare, PenLine, RefreshCw } from 'lucide-react'
import { dateForDay, formatLong } from '../lib/planDates.js'
import { reworkFor } from '../lib/rework.js'

function stampOf(iso) {
  if (!iso) return 'ещё не собирали'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(/[\s\u202f\u00a0]+/g, ' ')
}

function moscowLabel(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(/[\s\u202f\u00a0]+/g, ' ')
}

export default function ReworkDesk({ pack, days, focusId, canAct, onPlace, onSendChat, onCopy }) {
  const items = pack?.items || []
  const [openId, setOpenId] = useState(focusId || items[0]?.id || '')
  const [dayNumber, setDayNumber] = useState(0)
  const [variant, setVariant] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (focusId) setOpenId(focusId)
  }, [focusId])

  const current = items.find((item) => item.id === openId) || items[0]
  const target = days.find((item) => item.day === (dayNumber || current?.day)) || days[0]
  const live = useMemo(() => {
    if (!current || !target) return null
    if (!variant && target.day === current.day) return current
    return { ...current, ...reworkFor(target, current.source, { variant }), day: target.day, dish: target.dish, planTitle: target.title }
  }, [current, target, variant])

  if (!items.length) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#C6FF5E]">Агент · переработка</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Пока нечего перерабатывать</h2>
        <p className="mt-2 text-sm text-ink/60">Как только лента снимет свежие посты за три дня, агент сам соберёт для каждого текст KEDR.</p>
      </section>
    )
  }

  async function copy() {
    if (!live) return
    await onCopy(live.text)
    setCopied(true)
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-[#C6FF5E]/25 bg-card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#C6FF5E]">Агент · отдельное окно</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Переработка каждого актуального поста</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Агент заранее, каждые три часа, подбирает рубрику и собирает текст KEDR на каждый пост из ленты. Слева оригинал, справа наша версия. Чужие фразы не берём, блюдо только из меню.
        </p>
        <p className="mt-2 text-xs text-ink/50">Собрано {stampOf(pack?.fetchedAt)} · {items.length} постов в окне.</p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
          {items.map((item) => {
            const active = item.id === current?.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setOpenId(item.id); setDayNumber(item.day); setVariant(0); setCopied(false) }}
                className={`w-full rounded-2xl border p-4 text-left ${active ? 'border-[#C6FF5E] bg-[#C6FF5E]/10' : 'border-white/10 bg-card'}`}
              >
                <p className="text-[11px] text-[#C6FF5E]">{item.from} · {item.kind === 'news' ? 'новость' : 'Telegram'}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink">{item.source}</p>
                <p className="mt-2 text-[11px] text-ink/45">На {formatLong(dateForDay(item.day))} · {item.rubric?.title}</p>
              </button>
            )
          })}
        </div>

        {live && current && (
          <div className="min-w-0 space-y-4 lg:col-span-8">
            <article className="rounded-[28px] border border-white/10 bg-card p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-gold">Оригинал · {current.from}</p>
              <p className="mt-1 text-xs text-ink/50">{moscowLabel(current.date)}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{current.source}</p>
              {current.url && <a href={current.url} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl border border-white/15 px-4 py-2 text-sm text-ink/80">Открыть источник</a>}
            </article>

            <article className="rounded-[28px] border border-[#C6FF5E]/30 bg-card p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#C6FF5E]">Текст KEDR · {formatLong(dateForDay(target.day))}</p>
              <p className="mt-1 text-sm text-ink/55">{live.why}</p>
              <p className="mt-1 text-xs text-ink/45">Блюдо дня: {live.dish}. В плане: {live.planTitle}.</p>
              <label className="mt-3 block text-xs text-ink/60">
                День, на который поставить
                <select
                  value={target.day}
                  onChange={(event) => setDayNumber(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-ink"
                >
                  {days.map((item) => (
                    <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · {item.title}</option>
                  ))}
                </select>
              </label>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{live.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9A96A]/40 px-3 py-2 text-xs text-ink">
                  <Copy size={13} /> {copied ? 'Скопировано' : 'Скопировать'}
                </button>
                <button type="button" disabled={!canAct} onClick={() => onPlace(target.day, live)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C6FF5E] px-3 py-2 text-xs font-semibold text-[#0A0F0B] disabled:opacity-40">
                  <PenLine size={13} /> Поставить на {formatLong(dateForDay(target.day))}
                </button>
                <button type="button" disabled={!canAct} onClick={() => onSendChat(`Переработка «${current.from}» на ${formatLong(dateForDay(target.day))}`, { kind: 'post', day: target.day, title: live.topic?.label || current.from, body: live.text })} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs text-ink disabled:opacity-40">
                  <MessagesSquare size={13} /> В чат команде
                </button>
                <button type="button" onClick={() => setVariant((value) => value + 1)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#C6FF5E]/40 px-3 py-2 text-xs text-[#C6FF5E]">
                  <RefreshCw size={13} /> Другая рубрика
                </button>
              </div>
              {!canAct && <p className="mt-3 text-xs text-ink/50">Ставить и писать в чат можно после входа. Смотреть и копировать — сразу.</p>}
            </article>
          </div>
        )}
      </div>
    </section>
  )
}
