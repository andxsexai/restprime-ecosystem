import { useEffect, useState } from 'react'
import { FLAGSHIP } from '../data/place.js'
import StatusButtons, { statusLabel } from '../components/StatusButtons.jsx'
import { dateForDay, formatLong } from '../lib/planDates.js'

const LINKS = [
  { label: 'Сайт зала', href: FLAGSHIP.site },
  { label: 'Меню PDF', href: 'https://kedr-res.ru/menu--2026-10-23.pdf' },
  { label: 'Telegram', href: FLAGSHIP.telegram },
  { label: 'Instagram', href: FLAGSHIP.instagram },
]

export default function SiteDesk({ days, notes, onNotes, onPatch, onStatus, onRestore }) {
  const [dayNumber, setDayNumber] = useState(days[0]?.day || 1)
  const current = days.find((item) => item.day === Number(dayNumber)) || days[0]
  const [draft, setDraft] = useState(current)
  const [note, setNote] = useState(notes || '')

  useEffect(() => { setDraft(current) }, [current])

  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-4 rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-5 lg:col-span-5">
        <p className="text-xs uppercase tracking-[0.16em] text-[#C6FF5E]">Только разработчик</p>
        <h2 className="font-display text-4xl italic text-[#F4F0E6]">Тексты кабинета</h2>
        <p className="text-sm leading-relaxed text-[#7A8580]">
          Эта вкладка правит то, что видит команда в кабинете: заголовок дня, короткий и широкий пост, хук и сценарий Reels, статус и служебную заметку. Страницу kedr-res.ru она не меняет. Блюда и цены не выдумываются: их можно сверить по меню.
        </p>
        <div className="flex flex-wrap gap-2">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="rounded-full border border-[#C9A96A]/40 px-3 py-1.5 text-xs text-[#C9A96A]">{link.label}</a>
          ))}
        </div>
        <label className="block text-sm text-[#F4F0E6]">
          День
          <select value={current.day} onChange={(event) => setDayNumber(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · {statusLabel(item.status)} · {item.title}</option>
            ))}
          </select>
        </label>
        <StatusButtons value={current.status} onChange={(status) => onStatus(current.day, status)} />
        <button type="button" onClick={() => onRestore(current.day)} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-[#F4F0E6]">Вернуть исходный текст дня</button>
        <label className="block text-sm text-[#F4F0E6]">
          Заметка кабинета
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="mt-2 w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm" />
        </label>
        <button type="button" onClick={() => onNotes(note)} className="rounded-xl border border-[#C9A96A]/35 px-4 py-2 text-sm text-[#F4F0E6]">Сохранить заметку</button>
      </div>
      <form
        className="space-y-3 rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-5 lg:col-span-7"
        onSubmit={(event) => {
          event.preventDefault()
          onPatch(current.day, {
            title: draft.title,
            postText: draft.postText,
            wideText: draft.wideText || '',
            reelHook: draft.reelHook,
            reelScript: draft.reelScript,
          })
        }}
      >
        <p className="text-xs text-[#C9A96A]">{formatLong(dateForDay(current.day))} · правка текстов</p>
        <p className="text-xs text-[#7A8580]">Блюдо дня, его не переписываем: {current.dish}</p>
        <input value={draft.title || ''} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-[#F4F0E6]" aria-label="Заголовок" />
        <textarea value={draft.postText || ''} onChange={(event) => setDraft({ ...draft, postText: event.target.value })} rows={8} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Короткий пост" />
        <textarea value={draft.wideText || ''} onChange={(event) => setDraft({ ...draft, wideText: event.target.value })} rows={5} placeholder="Широкий пост, если нужен" className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Широкий пост" />
        <input value={draft.reelHook || ''} onChange={(event) => setDraft({ ...draft, reelHook: event.target.value })} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Хук Reels" />
        <textarea value={draft.reelScript || ''} onChange={(event) => setDraft({ ...draft, reelScript: event.target.value })} rows={4} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Сценарий Reels" />
        <button type="submit" className="rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B]">Записать в день</button>
      </form>
    </section>
  )
}