import { useEffect, useRef, useState } from 'react'
import { Copy, Save, Sparkles } from 'lucide-react'
import EmojiBar from '../components/EmojiBar.jsx'
import ExtensionBar from '../components/ExtensionBar.jsx'
import StatusButtons, { statusLabel } from '../components/StatusButtons.jsx'
import { repeatNote } from '../lib/autoPlan.js'
import { shownPost, wideFromDay, wordCount } from '../lib/compose.js'
import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'

const SHORT_WEEK = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const FIELD = 'w-full rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] px-3 py-3 text-base text-[#F4F0E6] focus:border-[#C9A96A] focus:outline-none sm:text-sm'

function bodyOf(day) {
  return day.format === 'wide' ? (day.wideText || wideFromDay(day)) : (day.postText || '')
}

export default function PostWorkshop({ days, day, canAct, repeats = {}, onPick, onSave, onStatus, onFormat, onToggleExtension, onCopy, onAuto }) {
  const postRef = useRef(null)
  const stripRef = useRef(null)
  const [title, setTitle] = useState(day.title)
  const [body, setBody] = useState(bodyOf(day))
  const [reelHook, setReelHook] = useState(day.reelHook)
  const [reelScript, setReelScript] = useState(day.reelScript || '')
  const wide = day.format === 'wide'
  const saved = bodyOf(day)

  useEffect(() => {
    setTitle(day.title)
    setBody(bodyOf(day))
    setReelHook(day.reelHook)
    setReelScript(day.reelScript || '')
  }, [day.day, day.format, day.postText, day.wideText, day.title, day.reelHook, day.reelScript])

  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector(`[data-day="${day.day}"]`)
    if (!strip || !chip) return
    if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
    else strip.scrollTo({ top: chip.offsetTop - strip.clientHeight / 2, behavior: 'smooth' })
  }, [day.day])

  useEffect(() => {
    const node = postRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.max(node.scrollHeight, 220)}px`
  }, [body])

  const dirty = title !== day.title || body !== saved || reelHook !== day.reelHook || reelScript !== (day.reelScript || '')
  const draftDay = { ...day, title, [wide ? 'wideText' : 'postText']: body }
  const preview = shownPost(draftDay)

  function patch() {
    return { title: title.trim() || day.title, [wide ? 'wideText' : 'postText']: body, reelHook, reelScript }
  }

  function save() {
    if (!dirty) return
    onSave(day.day, patch())
  }

  function choose(dayNumber) {
    if (dayNumber === day.day) return
    if (dirty && canAct && window.confirm('Есть несохранённые правки. Сохранить перед переходом?')) onSave(day.day, patch())
    onPick(dayNumber)
  }

  function insertEmoji(emoji) {
    const node = postRef.current
    const start = node?.selectionStart ?? body.length
    const end = node?.selectionEnd ?? body.length
    setBody(`${body.slice(0, start)}${emoji}${body.slice(end)}`)
    requestAnimationFrame(() => {
      node?.focus()
      const caret = start + emoji.length
      node?.setSelectionRange(caret, caret)
    })
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div ref={stripRef} className="relative -mx-4 flex min-w-0 snap-x gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:col-span-4 lg:mx-0 lg:max-h-[78vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:px-0 lg:pr-1">
        {days.map((item) => {
          const date = dateForDay(item.day)
          const active = item.day === day.day
          return (
            <button
              key={item.day}
              data-day={item.day}
              type="button"
              onClick={() => choose(item.day)}
              className={`w-[132px] shrink-0 snap-start rounded-2xl border px-3 py-2 text-left lg:w-full ${active ? 'border-[#C9A96A] bg-[#C9A96A]/15' : 'border-[#C9A96A]/20 bg-[#121A14]/60'}`}
            >
              <span className="block text-xs text-[#C9A96A]">{formatLong(date)} · {SHORT_WEEK[date.getDay()]}</span>
              <span className="mt-0.5 block truncate text-sm text-[#F4F0E6]">{item.title}</span>
              <span className={`mt-0.5 block text-[10px] ${repeats[item.day] ? 'text-red-300' : 'text-[#7A8580]'}`}>{repeats[item.day] ? 'есть повтор' : item.manual ? 'ручная правка' : statusLabel(item.status)}</span>
            </button>
          )
        })}
      </div>
      <form
        className="min-w-0 space-y-4 rounded-3xl border border-[#C9A96A]/20 bg-[#121A14]/60 p-4 pb-0 sm:p-5 sm:pb-0 lg:col-span-8"
        onSubmit={(event) => { event.preventDefault(); save() }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.16em] text-[#C9A96A]">{formatLong(dateForDay(day.day))} · {formatWeekday(dateForDay(day.day))}</p>
          <StatusButtons value={day.status} disabled={!canAct} onChange={(status) => onStatus(day.day, status)} />
        </div>
        {repeats[day.day] && <p className="rounded-2xl border border-red-300/40 px-3 py-2 text-sm text-red-200">{repeatNote(repeats[day.day])}. Нажмите «Новая версия» или перепишите фразу.</p>}
        <label className="block space-y-1.5">
          <span className="text-xs text-[#7A8580]">Заголовок</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={FIELD} />
        </label>
        <div className="flex rounded-full border border-white/10 p-1 text-sm">
          {[['short', 'Короткий'], ['wide', 'Широкий']].map(([id, label]) => (
            <button key={id} type="button" disabled={!canAct} onClick={() => onFormat(day.day, id)} className={`min-h-10 flex-1 rounded-full disabled:opacity-40 ${day.format === id || (!day.format && id === 'short') ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'text-[#F4F0E6]/80'}`}>{label}</button>
          ))}
        </div>
        <EmojiBar onPick={insertEmoji} />
        <label className="block space-y-1.5">
          <span className="flex justify-between text-xs text-[#7A8580]"><span>Текст поста</span><span>{wordCount(body)} слов</span></span>
          <textarea ref={postRef} value={body} onChange={(event) => setBody(event.target.value)} className={`${FIELD} resize-none leading-relaxed`} />
        </label>
        <ExtensionBar day={draftDay} canAct={canAct} onToggle={(id) => onToggleExtension(day.day, id)} />
        <details className="rounded-2xl border border-white/10 px-3 py-2">
          <summary className="cursor-pointer py-1 text-sm text-[#C9A96A]">Как уйдёт в канал</summary>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/85">{preview}</p>
        </details>
        <details className="rounded-2xl border border-white/10 px-3 py-2">
          <summary className="cursor-pointer py-1 text-sm text-[#C9A96A]">Рилс этого дня</summary>
          <div className="mt-2 space-y-3 pb-2">
            <label className="block space-y-1.5">
              <span className="text-xs text-[#7A8580]">Первая фраза</span>
              <input value={reelHook} onChange={(event) => setReelHook(event.target.value)} className={FIELD} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-[#7A8580]">Что в кадре</span>
              <textarea value={reelScript} onChange={(event) => setReelScript(event.target.value)} rows={4} className={FIELD} />
            </label>
          </div>
        </details>
        <div className="sticky bottom-0 z-20 -mx-4 flex gap-2 border-t border-[#C9A96A]/20 bg-[#121A14]/95 px-4 pt-3 backdrop-blur sm:-mx-5 sm:px-5" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <button type="submit" disabled={!canAct || !dirty} className="press inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#C9A96A] px-4 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">
            <Save size={16} />{dirty ? 'Сохранить' : 'Сохранено'}
          </button>
          <button type="button" onClick={() => onCopy(preview)} className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C9A96A]/40 px-3 text-sm text-[#C9A96A]" aria-label="Скопировать">
            <Copy size={16} /><span className="hidden sm:inline">Скопировать</span>
          </button>
          <button type="button" disabled={!canAct} onClick={() => onAuto(day.day)} className="press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C6FF5E]/40 px-3 text-sm text-[#C6FF5E] disabled:opacity-40" aria-label="Новая версия">
            <Sparkles size={16} /><span className="hidden sm:inline">Новая версия</span>
          </button>
        </div>
      </form>
    </section>
  )
}
