import { Component, useMemo, useState } from 'react'
import { Plus, RotateCcw, X } from 'lucide-react'
import { TREND_SITES } from '../data/telegramChannels.js'
import telegramFeed from '../data/telegramFeed.json'
import { channelTraits, traitNotes } from '../lib/compose.js'
import { copyText } from '../lib/clipboard.js'
import { formatLong, moscowKey, recentMoscowKeys } from '../lib/planDates.js'

class DeskGuard extends Component {
  constructor(props) {
    super(props)
    this.state = { error: '' }
  }

  static getDerivedStateFromError(error) {
    return { error: String(error?.message || error || 'ошибка раздела') }
  }

  render() {
    if (this.state.error) {
      return (
        <p className="rounded-[28px] border border-white/10 bg-card p-6 text-sm leading-relaxed text-[#C9A96A]">
          Раздел каналов не открылся: {this.state.error}
        </p>
      )
    }
    return this.props.children
  }
}

function moscowLabel(iso) {
  if (!iso) return 'без даты'
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)).replace(/[\s\u202f\u00a0]+/g, ' ').trim()
}

function windowLabel(keys) {
  const dates = keys.map((key) => {
    const [year, month, day] = key.split('-').map(Number)
    return formatLong(new Date(year, month - 1, day))
  })
  return dates.length > 1 ? `С ${dates[dates.length - 1]} по ${dates[0]}` : dates[0]
}

function ChannelDeskView({ channels = [], hidden = [], canAct, onWrite, onRework, onOpenRework, onAdd, onRemove, onRestore, onRestoreAll }) {
  const list = Array.isArray(channels) ? channels : []
  const hiddenList = Array.isArray(hidden) ? hidden : []
  const [openId, setOpenId] = useState('all')
  const [place, setPlace] = useState('all')
  const [copiedId, setCopiedId] = useState('')
  const [handle, setHandle] = useState('')
  const [title, setTitle] = useState('')
  const windowKeys = useMemo(() => recentMoscowKeys(3), [])
  const windowText = windowLabel(windowKeys)
  const channel = list.find((item) => item.id === openId)
  const posts = useMemo(() => {
    const rows = []
    for (const item of list) {
      const pack = telegramFeed.channels?.[item.id]
      for (const post of pack?.posts || []) {
        if (!windowKeys.includes(moscowKey(post.date))) continue
        rows.push({ ...post, channelId: item.id, channelTitle: pack?.title || item.title, kind: item.kind })
      }
    }
    return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }, [list, windowKeys])
  const allowed = new Set(list.filter((item) => place === 'all' || item.place === place).map((item) => item.id))
  const visible = (openId === 'all' ? posts : posts.filter((post) => post.channelId === openId)).filter((post) => allowed.has(post.channelId))
  const traits = useMemo(() => channelTraits(channel ? (telegramFeed.channels?.[channel.id]?.posts || []) : []), [channel])
  const notes = traitNotes(traits)
  const fetched = telegramFeed.fetchedAt ? moscowLabel(telegramFeed.fetchedAt) : 'ещё не снимали'
  const shown = list.filter((item) => place === 'all' || item.place === place)

  async function copyPost(post) {
    const body = `${post.channelTitle}\n${moscowLabel(post.date)}\n${post.url}\n\n${post.text}`
    await copyText(body)
    setCopiedId(post.id + post.channelId)
  }

  function submit(event) {
    event.preventDefault()
    const result = onAdd?.({ handle, title })
    if (result?.ok) {
      setHandle('')
      setTitle('')
      if (result.id) setOpenId(result.id)
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Telegram · {list.length} каналов и {TREND_SITES.length} трендов</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Каналы и тренды</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          {windowText}, по часам Москвы. Список каналов ваш: ненужные убираете, свои добавляете по @ или ссылке t.me. Текст на карточке целиком. «Переработка» открывает отдельное окно.
        </p>
        <p className="mt-2 text-xs text-ink/50">Последний съём: {fetched}. В окне {posts.length} постов.</p>
        {onOpenRework && (
          <button type="button" onClick={() => onOpenRework('')} className="mt-3 rounded-xl bg-[#C6FF5E] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">Открыть все переработки</button>
        )}
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-[28px] border border-[#C9A96A]/25 bg-card p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[#C9A96A]">Добавить канал</p>
        <p className="text-sm leading-relaxed text-ink/70">Вставьте @имя или ссылку t.me. Лента появится, если канал публичный и уже есть в последнем съёме. Иначе останется ссылкой в кабинете.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@night2daymoscow или t.me/канал" className="rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] outline-none focus:border-[#C9A96A]" />
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Как называть, если имя неудобное" className="rounded-xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6] outline-none focus:border-[#C9A96A]" />
        </div>
        <button type="submit" disabled={!handle.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40"><Plus size={15} />Добавить</button>
      </form>

      {hiddenList.length > 0 && (
        <div className="rounded-[28px] border border-white/10 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.16em] text-[#7A8580]">Убраны · {hiddenList.length}</p>
            <button type="button" onClick={onRestoreAll} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#F4F0E6]"><RotateCcw size={12} />Вернуть все</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hiddenList.map((item) => (
              <button key={item.id} type="button" onClick={() => onRestore(item.id)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#7A8580]">
                Вернуть {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[28px] border border-white/10 bg-card p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[#C9A96A]">Тренды Москвы и мира</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TREND_SITES.map((site) => (
            <a key={site.url} href={site.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-[#C9A96A]/30 px-3 py-2 text-left">
              <span className="block text-[10px] uppercase tracking-wider text-[#C9A96A]">{site.place}</span>
              <span className="block text-sm text-[#F4F0E6]">{site.title}</span>
              <span className="block text-[11px] text-ink/50">{site.note}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'Москва', 'Мир'].map((item) => (
          <button key={item} type="button" onClick={() => { setPlace(item); setOpenId('all') }} className={`rounded-full px-4 py-2 text-sm ${place === item ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-ink'}`}>
            {item === 'all' ? 'Все города' : item}
          </button>
        ))}
        <button type="button" onClick={() => setOpenId('all')} className={`rounded-full border px-4 py-2 text-sm ${openId === 'all' ? 'border-[#C9A96A] bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border-white/15 text-ink'}`}>
          Все каналы · {posts.length}
        </button>
        {shown.map((item) => {
          const count = posts.filter((post) => post.channelId === item.id).length
          const active = item.id === openId
          const packed = telegramFeed.channels?.[item.id]
          return (
            <span key={item.id} className={`inline-flex items-center rounded-full border ${active ? 'border-[#C9A96A] bg-[#C9A96A]/15 text-[#C9A96A]' : 'border-white/10 text-ink/80'}`}>
              <button type="button" onClick={() => setOpenId(item.id)} className="px-4 py-2 text-sm">
                {item.title} · {item.feed === false || (!packed?.posts?.length && item.custom) ? 'без ленты' : item.quiet ? 'молчит' : count}
              </button>
              <button type="button" onClick={() => { onRemove?.(item.id); if (openId === item.id) setOpenId('all') }} aria-label={`Убрать ${item.title}`} className="grid h-8 w-8 place-items-center rounded-full text-[#7A8580] hover:text-[#F4F0E6]">
                <X size={13} />
              </button>
            </span>
          )
        })}
      </div>

      {channel && (
        <article className="rounded-[28px] border border-white/10 bg-card p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-gold">{channel.kind}{channel.custom ? ' · свой' : ''}</p>
          <h3 className="font-fraunces mt-2 text-3xl text-ink">{channel.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{channel.voice}</p>
          <a href={`https://t.me/${channel.id}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-gold underline decoration-gold/30 underline-offset-2">
            Открыть @{channel.id} в Telegram
          </a>
          <div className="mt-4 flex flex-wrap gap-2">
            {notes.map((note) => (
              <span key={note} className="rounded-full border border-gold/30 px-3 py-1 text-xs text-gold">{note}</span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={!canAct} onClick={() => onWrite(channel, 'short')} className="rounded-xl bg-[#C9A96A] px-4 py-2 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Короткий в этом тоне</button>
            <button type="button" disabled={!canAct} onClick={() => onWrite(channel, 'wide')} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink disabled:opacity-40">Широкий, до 500 слов</button>
            <button type="button" onClick={() => { onRemove?.(channel.id); setOpenId('all') }} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-[#7A8580]">Убрать из списка</button>
          </div>
        </article>
      )}

      <div className="space-y-3">
        {visible.length === 0 && <p className="rounded-[28px] border border-white/10 bg-card p-6 text-sm text-ink/60">За эти три дня в выбранных каналах нет текстовых постов.</p>}
        {visible.map((post) => {
          const copyKey = post.id + post.channelId
          return (
            <article key={copyKey} className="rounded-[28px] border border-white/10 bg-card p-5">
              <p className="text-xs text-[#C9A96A]">
                {post.channelTitle} · {moscowLabel(post.date)}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-ink/90">{post.text}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => copyPost(post)} className="rounded-xl border border-[#C9A96A]/40 px-4 py-2 text-sm text-[#F4F0E6]">
                  {copiedId === copyKey ? 'Скопировано' : 'Скопировать'}
                </button>
                <a href={post.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink/80">Посмотреть</a>
                <button type="button" onClick={() => onRework(post)} className="rounded-xl bg-[#C6FF5E] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">Смотреть переработку</button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function ChannelDesk(props) {
  return (
    <DeskGuard>
      <ChannelDeskView {...props} />
    </DeskGuard>
  )
}
