import DayPhoto from './DayPhoto.jsx'
import ExtensionBar from './ExtensionBar.jsx'
import { FLAGSHIP } from '../data/place.js'
import { shownPost, wordCount } from '../lib/compose.js'
import {
  WEEKDAYS, calendarCells, dateForDay, formatLong, formatWeekday, monthTitle, planDayForDate, sameDay,
} from '../lib/planDates.js'

export default function TodayScreen({
  days, day, todayNumber, news, canAct, onPick, onFormat, onImprove, onImproveReel, onApprove, onReplace, onChat, onToggleExtension,
}) {
  const cells = calendarCells()
  const now = new Date()
  const todayItem = days.find((item) => item.day === todayNumber)
  const selectedDate = dateForDay(day.day)
  const isToday = todayNumber === day.day
  const first = cells[0]
  const last = cells[cells.length - 1]
  const span = first.getMonth() === last.getMonth()
    ? monthTitle(first)
    : `${monthTitle(first).split(' ')[0]} — ${monthTitle(last)}`
  const text = shownPost(day)

  return (
    <section className="space-y-5">
      <div className="grid items-stretch gap-5 lg:grid-cols-12">
        <div className="relative flex min-h-[290px] flex-col justify-end overflow-hidden rounded-3xl border border-white/15 p-6 sm:p-8 lg:col-span-7">
          <img src={`${import.meta.env.BASE_URL}hero.jpg`} alt="Сосновый лес у ресторана KEDR" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/25 to-obsidian/90" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/90">{FLAGSHIP.badge}</p>
            <h1 className="font-fraunces mt-2 text-4xl leading-tight text-white sm:text-5xl">{FLAGSHIP.title}</h1>
          </div>
        </div>
        <div className="metal-slide flex flex-col justify-between rounded-3xl p-6 lg:col-span-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Сегодня · {todayItem ? formatLong(dateForDay(todayNumber)) : formatLong(now)}</p>
            <h2 className="font-fraunces mt-2 text-3xl text-white">{isToday ? day.title : todayItem?.title}</h2>
            <p className="mt-3 text-sm text-slate-300">{isToday ? 'Пост, Reels и тема этого дня.' : `Сейчас открыт ${formatLong(selectedDate)}. Сегодня в плане другой день.`}</p>
          </div>
          {!isToday && todayNumber && (
            <button type="button" onClick={() => onPick(todayNumber)} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-sm text-white">Вернуться к сегодня</button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-12">
        <div className="liquid-panel p-4 lg:col-span-4">
          <p className="px-1 text-sm font-semibold text-ink">{span}</p>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-ink/45">
            {WEEKDAYS.map((name) => <span key={name}>{name}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const number = planDayForDate(cell)
              const picked = number === day.day
              const live = sameDay(cell, now)
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  disabled={!number}
                  onClick={() => number && onPick(number)}
                  className={`press grid h-10 place-items-center rounded-2xl text-sm ${picked ? 'bg-[#2f6b4f] font-semibold text-white' : live ? 'bg-[#e7f0ea] font-semibold text-kedr' : number ? 'text-ink hover:bg-card' : 'text-ink/25'}`}
                >
                  {cell.getDate()}
                </button>
              )
            })}
          </div>
        </div>

        <article className="liquid-panel overflow-hidden p-4 lg:col-span-5">
          <DayPhoto day={day.day} className="h-52 w-full rounded-[22px] object-cover" />
          <p className="mt-4 text-sm text-gold">
            Пост · {day.pillar} · {formatWeekday(selectedDate)} · {day.format === 'wide' ? `широкий, ${wordCount(text)} из 500` : 'короткий'}
          </p>
          <p className="mt-2 whitespace-pre-wrap font-editorial text-base leading-relaxed text-white/90">{text}</p>
          <ExtensionBar day={day} canAct={canAct} onToggle={(id) => onToggleExtension(day.day, id)} />
          <p className="mt-3 text-sm text-ink/50">{day.dish} · {day.margin}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={!canAct} onClick={() => onFormat('short')} className={`press rounded-full px-3 py-2 text-sm disabled:opacity-40 ${day.format !== 'wide' ? 'bg-[#2f6b4f] text-white' : 'border border-ink/10 text-ink'}`}>Короткий</button>
            <button type="button" disabled={!canAct} onClick={() => onFormat('wide')} className={`press rounded-full px-3 py-2 text-sm disabled:opacity-40 ${day.format === 'wide' ? 'bg-[#2f6b4f] text-white' : 'border border-ink/10 text-ink'}`}>Широкий</button>
            <button type="button" disabled={!canAct} onClick={onImprove} className="press rounded-full border border-ink/10 px-4 py-2 text-sm text-ink disabled:opacity-40">Улучшить пост</button>
            <button type="button" disabled={!canAct} onClick={onReplace} className="press rounded-full border border-ink/10 px-4 py-2 text-sm text-ink disabled:opacity-40">Переделать</button>
            <button type="button" disabled={!canAct} onClick={onChat} className="press rounded-full border border-ink/10 px-4 py-2 text-sm text-ink disabled:opacity-40">В чат</button>
            <button type="button" disabled={!canAct} onClick={onApprove} className="press rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-2 text-sm font-bold text-obsidian disabled:opacity-40">Утвердить</button>
          </div>
        </article>

        <aside className="space-y-4 lg:col-span-3">
          <div className="liquid-panel p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Тема дня</p>
            <h2 className="font-fraunces mt-2 text-3xl text-ink">{day.warmupTheme}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">{day.scene}</p>
          </div>
          <div className="liquid-panel p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Reels</p>
            <p className="mt-2 text-base font-semibold text-ink">{day.reelHook}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{day.reelScript}</p>
            <p className="mt-2 text-xs text-ink/45">Звук: {day.reelAudio}</p>
            <button type="button" disabled={!canAct} onClick={onImproveReel} className="press mt-4 rounded-full border border-ink/10 px-4 py-2 text-sm text-ink disabled:opacity-40">Улучшить сценарий</button>
          </div>
        </aside>
      </div>

      <div className="liquid-panel p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Лента до сегодня</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Что уже вышло к {formatLong(now)}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {news.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="press rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gold">{item.dateLabel} · {item.source}</p>
              <p className="mt-1 font-semibold text-ink">{item.title}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{item.watch}</p>
            </a>
          ))}
          {news.length === 0 && <p className="text-sm text-ink/60">К этой дате в ленте ещё нет материалов.</p>}
        </div>
      </div>
    </section>
  )
}
