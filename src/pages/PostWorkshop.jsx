import { useEffect, useRef, useState } from 'react'
import EmojiBar from '../components/EmojiBar.jsx'
import StatusButtons from '../components/StatusButtons.jsx'
import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'

export default function PostWorkshop({ days, day, canAct, onPick, onSave, onStatus }) {
  const postRef = useRef(null)
  const [title, setTitle] = useState(day.title)
  const [postText, setPostText] = useState(day.postText)
  const [reelHook, setReelHook] = useState(day.reelHook)
  const [reelScript, setReelScript] = useState(day.reelScript || '')

  useEffect(() => {
    setTitle(day.title)
    setPostText(day.postText)
    setReelHook(day.reelHook)
    setReelScript(day.reelScript || '')
  }, [day])

  function insertEmoji(emoji) {
    const node = postRef.current
    const start = node?.selectionStart ?? postText.length
    const end = node?.selectionEnd ?? postText.length
    const next = `${postText.slice(0, start)}${emoji}${postText.slice(end)}`
    setPostText(next)
    requestAnimationFrame(() => {
      node?.focus()
      const caret = start + emoji.length
      node?.setSelectionRange(caret, caret)
    })
  }

  return (
    <section className="grid gap-4 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-4">
        {days.map((item) => {
          const date = dateForDay(item.day)
          const active = item.day === day.day
          return (
            <button key={item.day} type="button" onClick={() => onPick(item.day)} className={`w-full rounded-2xl border px-3 py-2 text-left ${active ? 'border-[#C9A96A] bg-[#C9A96A]/10' : 'border-[#C9A96A]/20 bg-[#121A14]/60'}`}>
              <span className="text-xs text-[#C9A96A]">{formatLong(date)} · {formatWeekday(date)}</span>
              <span className="mt-0.5 block text-sm text-[#F4F0E6]">{item.title}</span>
            </button>
          )
        })}
      </div>
      <form
        className="space-y-3 rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-5 lg:col-span-8"
        onSubmit={(event) => {
          event.preventDefault()
          onSave(day.day, { title: title.trim(), postText, reelHook, reelScript })
        }}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-[#C9A96A]">Ручная доработка · {formatLong(dateForDay(day.day))}</p>
        <StatusButtons value={day.status} disabled={!canAct} onChange={(status) => onStatus(day.day, status)} />
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-[#F4F0E6]" aria-label="Заголовок" />
        <EmojiBar onPick={insertEmoji} />
        <textarea ref={postRef} value={postText} onChange={(event) => setPostText(event.target.value)} rows={12} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm leading-relaxed text-[#F4F0E6]" aria-label="Текст поста" />
        <input value={reelHook} onChange={(event) => setReelHook(event.target.value)} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Хук Reels" />
        <textarea value={reelScript} onChange={(event) => setReelScript(event.target.value)} rows={4} className="w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-sm text-[#F4F0E6]" aria-label="Сценарий Reels" />
        <button type="submit" disabled={!canAct} className="rounded-xl bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Сохранить правку</button>
      </form>
    </section>
  )
}
