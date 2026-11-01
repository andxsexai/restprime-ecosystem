import { useMemo, useState } from 'react'
import { Clapperboard, Copy, MessagesSquare, PenLine, RefreshCw } from 'lucide-react'
import { reelText, threeDays } from '../lib/threeDays.js'

const SHORT_WEEK = { понедельник: 'пн', вторник: 'вт', среда: 'ср', четверг: 'чт', пятница: 'пт', суббота: 'сб', воскресенье: 'вс' }

function stampOf(iso) {
  if (!iso) return 'ещё не снимали'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(/[\s\u202f\u00a0]+/g, ' ')
}

function Refs({ refs }) {
  if (!refs?.length) return null
  return (
    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink/50">
      {refs.map((ref) => (
        <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-gold">{ref.from}</a>
      ))}
    </p>
  )
}

function Actions({ canAct, label, onCopy, onPlace, onChat, copied }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9A96A]/40 px-3 py-2 text-xs text-ink">
        <Copy size={13} /> {copied ? 'Скопировано' : 'Скопировать'}
      </button>
      <button type="button" disabled={!canAct} onClick={onPlace} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A96A] px-3 py-2 text-xs font-semibold text-[#0A0F0B] disabled:opacity-40">
        <PenLine size={13} /> {label}
      </button>
      <button type="button" disabled={!canAct} onClick={onChat} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs text-ink disabled:opacity-40">
        <MessagesSquare size={13} /> В чат команде
      </button>
    </div>
  )
}

export default function ThreeDaysDesk({ days, signals, fromDay, canAct, onPlacePost, onPlaceReel, onSendChat, onCopy }) {
  const [variant, setVariant] = useState(0)
  const [pickedDay, setPickedDay] = useState(0)
  const [copied, setCopied] = useState('')
  const plan = useMemo(() => threeDays(days, { signals, fromDay, variant }), [days, signals, fromDay, variant])
  const current = plan[pickedDay] || plan[0]
  const topics = (signals?.topics || []).slice(0, 5)

  async function copy(id, text) {
    await onCopy(text)
    setCopied(id)
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-[#C6FF5E]">Авто · 3 дня вперёд</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Три поста и три рилс на каждый день</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Собрано из того, о чём писали каналы за последние три дня, повода дня и свежей идеи «Кедра». Блюда и цены — только из меню, фразы не повторяются между карточками. Чужой текст не цитируем.
        </p>
        <p className="mt-2 text-xs text-ink/50">Лента от {stampOf(signals?.fetchedAt)}, обновляется каждые 3 часа.</p>
        {topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span key={topic.id} className="rounded-full border border-[#C6FF5E]/30 px-3 py-1 text-xs text-[#C6FF5E]">{topic.label} · {topic.count}</span>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setVariant((value) => value + 1)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C6FF5E] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">
          <RefreshCw size={15} /> Другие идеи
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {plan.map((entry, index) => (
          <button
            key={entry.day}
            type="button"
            onClick={() => setPickedDay(index)}
            className={`shrink-0 rounded-2xl border px-4 py-2 text-left ${index === pickedDay ? 'border-[#C9A96A] bg-[#C9A96A]/15 text-[#C9A96A]' : 'border-white/10 text-ink/80'}`}
          >
            <span className="block text-sm font-semibold">{entry.label}</span>
            <span className="block text-[11px] text-ink/50">{SHORT_WEEK[entry.weekday] || entry.weekday} · в плане: {entry.planTitle}</span>
          </button>
        ))}
      </div>

      {current && (
        <>
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold"><PenLine size={14} /> Посты на {current.label}</p>
            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
              {current.posts.map((post) => (
                <article key={post.id} className="flex min-w-0 flex-col rounded-[24px] border border-white/10 bg-card p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#C6FF5E]">{post.kind}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{post.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/50">{post.why}</p>
                  <Refs refs={post.refs} />
                  <p className="mt-3 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{post.text}</p>
                  <Actions
                    canAct={canAct}
                    label={`Поставить на ${current.label}`}
                    copied={copied === post.id + variant}
                    onCopy={() => copy(post.id + variant, post.text)}
                    onPlace={() => onPlacePost(current.day, post)}
                    onChat={() => onSendChat(`Идея поста на ${current.label}: ${post.title}`, { kind: 'post', day: current.day, title: post.title, body: post.text })}
                  />
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-gold"><Clapperboard size={14} /> Рилс на {current.label}</p>
            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
              {current.reels.map((reel) => (
                <article key={reel.id} className="flex min-w-0 flex-col rounded-[24px] border border-white/10 bg-card p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#C6FF5E]">{reel.kind}</p>
                  <h3 className="mt-1 text-lg font-semibold text-ink">{reel.hook}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink/50">{reel.why}</p>
                  <Refs refs={reel.refs} />
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{reel.shots}</p>
                  <p className="mt-3 flex-1 text-xs text-ink/60">Звук: {reel.sound}</p>
                  <Actions
                    canAct={canAct}
                    label={`Рилс на ${current.label}`}
                    copied={copied === reel.id + variant}
                    onCopy={() => copy(reel.id + variant, reelText(reel))}
                    onPlace={() => onPlaceReel(current.day, reel)}
                    onChat={() => onSendChat(`Идея рилс на ${current.label}: ${reel.hook}`, { kind: 'reel', day: current.day, title: reel.hook, body: `${reel.shots}\n\nЗвук: ${reel.sound}` })}
                  />
                </article>
              ))}
            </div>
          </div>
        </>
      )}
      {!canAct && <p className="text-sm text-ink/50">Ставить в план и писать в чат можно после входа и подтверждения разработчиком. Копировать можно сразу.</p>}
    </section>
  )
}
