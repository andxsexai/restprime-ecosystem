import { Lock, PartyPopper } from 'lucide-react'
import { groupTitle } from '../data/eventFormats.js'
import { NOVEMBER_2026, NOVEMBER_ANNOUNCEMENT } from '../data/november2026.js'
import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'
import { shownPost } from '../lib/compose.js'
import { dateForDay, formatLong } from '../lib/planDates.js'
import GlassCard from '../components/ui/GlassCard.jsx'
import { StatusMark } from '../components/StatusButtons.jsx'

function channelTitle(id) {
  return TELEGRAM_CHANNELS.find((item) => item.id === id)?.title || `@${id}`
}

export default function EventsDesk({ days, canAct, onOpenThemes, onOpenPosts, onOpenPlan, onOpenCalendar, onRemove, onFocus, onCopy }) {
  const events = days.filter((day) => day.event?.title)
  const hallBusy = NOVEMBER_2026.filter((item) => item.status === 'booked')
  return (
    <section className="space-y-5">
      <GlassCard className="rounded-[28px] p-5">
        <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]"><PartyPopper size={14} />Ноябрь в плане</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Сетка зала и плюс к посту</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70">
          Занятые даты закрыты. Свободные вечера ноября уже стоят в постах и рилсах. Карточка в «Темах» больше не нужна для этой сетки.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onOpenCalendar} className="rounded-xl bg-[#C9A96A] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">Календарь ноября</button>
          <button type="button" onClick={onOpenPlan} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink">План</button>
          <button type="button" onClick={onOpenPosts} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink">Посты</button>
          <button type="button" onClick={onOpenThemes} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink">Другой формат</button>
        </div>
      </GlassCard>

      <GlassCard className="rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#7A8580]">Занято — не ставим свой ивент</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {hallBusy.map((item) => (
            <span key={item.date} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#7A8580]">
              <Lock size={11} />{item.date.slice(8)} ноября · {item.title}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="rounded-2xl p-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#C6FF5E]">Анонс для Telegram</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{NOVEMBER_ANNOUNCEMENT}</p>
        <button type="button" onClick={() => onCopy(NOVEMBER_ANNOUNCEMENT)} className="mt-3 rounded-xl border border-[#C6FF5E]/40 px-4 py-2 text-sm text-[#C6FF5E]">Скопировать анонс</button>
      </GlassCard>

      {events.length === 0 ? (
        <GlassCard className="rounded-2xl p-5">
          <p className="text-sm text-ink/70">Сетка ноября ещё не легла на дни плана. Обновите страницу.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((day) => (
            <GlassCard key={day.day} className="rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-widest text-[#C6FF5E]">{groupTitle(day.event.group)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h3 className="font-fraunces text-3xl text-ink">{day.event.title}</h3>
                <StatusMark status={day.status} decidedBy={day.decidedBy} />
              </div>
              <p className="mt-1 text-sm text-[#C9A96A]">{formatLong(dateForDay(day.day))} · {day.title}</p>
              <p className="mt-3 text-lg text-[#C9A96A]">{day.event.hook}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{shownPost(day)}</p>
              <p className="mt-3 text-xs text-ink/50">Рилс: {day.reelHook}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink/60">{day.reelScript}</p>
              {(day.event.ads || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {day.event.ads.map((item) => (
                    <a key={`${day.day}-${item.id}`} href={`https://t.me/${item.id}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#C6FF5E]/30 px-3 py-1 text-[11px] text-[#C6FF5E]">
                      {channelTitle(item.id)}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onFocus(day.day)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink">Этот день</button>
                <button type="button" onClick={onOpenPosts} className="rounded-full border border-[#C9A96A]/40 px-3 py-1.5 text-xs text-[#C9A96A]">К постам</button>
                {day.occupancy?.status !== 'event' && (
                  <button type="button" onClick={() => onRemove(day.day)} className="rounded-full border border-red-300/40 px-3 py-1.5 text-xs text-red-200">Убрать из плана</button>
                )}
              </div>
              {!canAct && <p className="mt-2 text-[11px] text-ink/45">Смотреть можно сразу. Писать команде — после входа.</p>}
            </GlassCard>
          ))}
        </div>
      )}
    </section>
  )
}
