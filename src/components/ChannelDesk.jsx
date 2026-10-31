import { useMemo, useState } from 'react'
import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'
import telegramFeed from '../data/telegramFeed.json'
import { channelTraits, traitNotes } from '../lib/compose.js'
import { dateForDay, formatLong } from '../lib/planDates.js'

function moscowDay(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
}

function moscowLabel(iso) {
  if (!iso) return 'без даты'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(/[\s\u202f\u00a0]+/g, ' ').trim()
}

export default function ChannelDesk({ days, day, canAct, onPick, onWrite }) {
  const [openId, setOpenId] = useState('sysoevfm')
  const today = moscowDay(new Date().toISOString())
  const channel = TELEGRAM_CHANNELS.find((item) => item.id === openId) || TELEGRAM_CHANNELS[0]
  const bundle = telegramFeed.channels?.[channel.id] || { posts: [] }
  const posts = bundle.posts || []
  const traits = useMemo(() => channelTraits(posts), [posts])
  const notes = traitNotes(traits)
  const fetched = telegramFeed.fetchedAt ? moscowLabel(telegramFeed.fetchedAt) : 'ещё не снимали'

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Telegram · Москва</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Каналы ресторанов и кухни</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Публичные ленты t.me. Снимок обновляется каждый день при сборке сайта. Чужие посты остаются чужими: из них берётся только тон. Текст для KEDR собирается из сцены дня и блюда меню, без чужих тарелок и цен.
        </p>
        <p className="mt-2 text-xs text-ink/50">Последний съём: {fetched}, Москва.</p>
        <label className="mt-4 block text-sm text-ink/70">
          День, на который собрать пост
          <select value={day.day} onChange={(event) => onPick(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/15 bg-card px-3 py-3 text-ink">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · день {item.day} · {item.title}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {TELEGRAM_CHANNELS.map((item) => {
          const pack = telegramFeed.channels?.[item.id]
          const fresh = (pack?.posts || []).some((post) => moscowDay(post.date) === today)
          const active = item.id === channel.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenId(item.id)}
              className={`press rounded-2xl border p-3 text-left ${active ? 'border-gold bg-gold/10' : 'border-white/10 bg-card'}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{item.title}</span>
                {fresh && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-obsidian">сегодня</span>}
              </span>
              <span className="mt-1 block text-xs text-gold">@{item.id}</span>
              <span className="mt-1 block text-xs text-ink/55">{item.kind}</span>
            </button>
          )
        })}
      </div>

      <article className="rounded-[28px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">{channel.kind}</p>
        <h3 className="font-fraunces mt-2 text-3xl text-ink">{bundle.title || channel.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{channel.voice}</p>
        <a href={`https://t.me/${channel.id}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-gold underline-offset-4 hover:underline">Открыть @{channel.id}</a>
        <div className="mt-4 flex flex-wrap gap-2">
          {notes.map((note) => (
            <span key={note} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold">{note}</span>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!canAct} onClick={() => onWrite(channel, 'short')} className="press rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-2 text-sm font-bold text-obsidian disabled:opacity-40">Короткий пост в этом тоне</button>
          <button type="button" disabled={!canAct} onClick={() => onWrite(channel, 'wide')} className="press rounded-xl border border-white/15 px-4 py-2 text-sm text-ink disabled:opacity-40">Широкий, до 500 слов</button>
        </div>
        {!canAct && <p className="mt-2 text-xs text-ink/50">Собрать пост можно после входа. Смотреть каналы можно и так.</p>}

        <div className="mt-6 space-y-3">
          {posts.length === 0 && <p className="text-sm text-ink/60">В этом снимке нет текста. Канал открывается по ссылке выше.</p>}
          {posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-white/10 bg-paper p-4">
              <p className="text-xs text-gold">
                {moscowLabel(post.date)}
                {moscowDay(post.date) === today ? ' · сегодня' : ''}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{post.text}</p>
              <a href={post.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-gold underline-offset-4 hover:underline">Полный пост в Telegram</a>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
