import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Download, ExternalLink, RefreshCw, Send, Upload } from 'lucide-react'
import { FLAGSHIP } from '../data/place.js'
import { TELEGRAM_CHANNELS } from '../data/telegramChannels.js'
import { groupTitle } from '../data/eventFormats.js'
import { shownPost, wordCount } from '../lib/compose.js'
import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'
import StatusButtons, { StatusMark, statusTone, teamNote } from './StatusButtons.jsx'
import ExtensionBar from './ExtensionBar.jsx'
import AutoPlanCard from './AutoPlanCard.jsx'
import { repeatNote } from '../lib/autoPlan.js'
import DayPhoto from './DayPhoto.jsx'
import { roleLabel } from '../lib/auth.js'
import Button3D from './ui/Button3D.jsx'
import GlassCard from './ui/GlassCard.jsx'

const TASKS = ['all', 'Быт', 'Гости', 'Зал', 'Меню', 'Напиток', 'Повод']
const TASK_LABEL = { all: 'Все задания', Быт: 'Быт', Гости: 'Гости', Зал: 'Зал', Меню: 'Из меню', Напиток: 'Напиток', Повод: 'Повод' }

export function PlanView({ days, status, pillar, onStatus, onPillar, onApproveAll, onAutoPlan, onFixRepeats, repeats = {}, signals, onOpen, onSetStatus, onReview, onMatch, onReplace, onForward, onImprove, onImproveReel, trends, boards, canAct }) {
  const visible = days.filter((day) => (status === 'all' || day.status === status) && (pillar === 'all' || day.pillar === pillar))
  const repeatCount = Object.keys(repeats).length
  return (
    <section className="space-y-5">
      <AutoPlanCard signals={signals} repeatCount={repeatCount} canAct={canAct} onAutoPlan={onAutoPlan} onFixRepeats={onFixRepeats} />
      <GlassCard className="space-y-4 rounded-[28px] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-fraunces text-3xl text-ink">Задания на 30 дней</h2>
            <p className="text-sm text-ink/75">Сначала сцена жизни, блюдо только если оно есть в меню от 23 октября.</p>
          </div>
          <Button3D tone="kedr" className="px-3.5 py-2 text-xs" disabled={!canAct} onClick={onApproveAll}><Check size={14} />Утвердить все</Button3D>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TASKS.map((task) => (
            <button key={task} type="button" onClick={() => onPillar(task)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${pillar === task ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'bg-paper text-ink/75'}`}>
              {TASK_LABEL[task]}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-ink/10 bg-card p-1 text-xs w-fit">
          {[['all', 'Все'], ['review', 'На проверку'], ['approved', 'Утвердил'], ['agreed', 'Согласовано']].map(([id, label]) => (
            <button key={id} type="button" onClick={() => onStatus(id)} className={`rounded-full px-3 py-1.5 ${status === id ? `${statusTone(id === 'all' ? 'review' : id).active} font-semibold` : 'text-ink/75'}`}>{label}</button>
          ))}
        </div>
        {boards?.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {boards.map((board) => (
              <a key={board.url} href={board.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-ink/10 bg-paper p-4 hover:border-[#c4a574]/50">
                <span className="text-xs uppercase tracking-[0.16em] text-gold">Смотреть снаружи</span>
                <span className="mt-1 block font-fraunces text-2xl text-ink">{board.name}</span>
                <span className="mt-1 block text-sm text-ink/75">{board.note}</span>
              </a>
            ))}
          </div>
        )}
        {trends?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {trends.map((trend) => (
              <button key={trend.id} type="button" disabled={!canAct} onClick={() => onMatch(trend)} className="shrink-0 rounded-2xl border border-ink/10 bg-card px-3 py-2 text-left text-xs text-ink/75 disabled:cursor-not-allowed disabled:opacity-40">
                <span className="block font-semibold text-ink">{trend.name}</span>
                <span className="text-ink/50">{trend.source}</span>
              </button>
            ))}
          </div>
        )}
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((day) => (
          <GlassCard key={day.day} className={`relative rounded-2xl p-4 ${statusTone(day.status).ring}`}>
            <DayPhoto day={day.day} className="mb-3 h-36 w-full rounded-2xl object-cover" />
            <button type="button" className="w-full text-left" onClick={() => onOpen(day)}>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="font-fraunces text-2xl text-gold">{formatLong(dateForDay(day.day))}</span>
                <StatusMark status={day.status} decidedBy={day.decidedBy} />
                <span className="text-[11px] text-ink/45">{formatWeekday(dateForDay(day.day))}</span>
              </div>
              <h3 className="text-base font-semibold leading-snug text-ink">{day.title}</h3>
              {day.event?.title && <p className="mt-2 rounded-full bg-[#C6FF5E]/15 px-2 py-1 text-[11px] font-semibold text-[#C6FF5E]">Плюсом: {day.event.title}</p>}
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{shownPost(day)}</p>
              <p className="mt-2 text-xs text-ink/50">{day.pillar} · {day.scene}</p>
              <p className="mt-1 text-xs text-gold">{day.dish} · {day.margin}</p>
              {teamNote(day) && <p className={`mt-1 text-xs font-semibold ${statusTone(day.status).text}`}>{teamNote(day)}</p>}
              {day.manual && <p className="mt-1 text-xs text-[#7A8580]">Ручная правка — автоплан не трогает</p>}
              {!day.manual && day.auto?.why?.length > 0 && <p className="mt-1 text-xs text-[#C6FF5E]/80">Почему так: {day.auto.why.join(' · ')}</p>}
              {repeats[day.day] && <p className="mt-1 text-xs font-semibold text-red-300">{repeatNote(repeats[day.day])}</p>}
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/70">Reels: {day.reelHook} {day.reelScript}</p>
            </button>
            <div className="mt-3 border-t border-gold/25 pt-3">
              <StatusButtons value={day.status} disabled={!canAct} onChange={(next) => onSetStatus(day.day, next)} onReview={() => onReview(day)} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={!canAct} onClick={() => onImprove(day.day)} className="press rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Улучшить пост</button>
              <button type="button" disabled={!canAct} onClick={() => onImproveReel(day.day)} className="press rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Улучшить рилс</button>
              <button type="button" disabled={!canAct} onClick={() => onReplace(day.day)} className="press rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Переделать</button>
              <button type="button" disabled={!canAct} onClick={() => onForward(day, 'post')} className="press rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">В чат</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function PostsView({ days, onCopy, onExport, canAct, onToggleExtension, onSetStatus, onReview }) {
  const [query, setQuery] = useState('')
  const visible = days.filter((day) => `${day.title} ${day.dish} ${shownPost(day)}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <section className="space-y-5">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
        <div>
          <h2 className="font-fraunces text-2xl text-ink">Посты на 30 дней</h2>
          <p className="text-sm text-ink/50">Сначала ситуация гостя, потом блюдо из меню, в конце одна ссылка на бронь.</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по блюду или теме" className="rounded-xl border border-ink/10 bg-card px-3.5 py-2 text-xs text-ink focus:border-[#C9A96A] focus:outline-none" />
          <Button3D tone="ghost" className="border-[#C9A96A]/30 px-3.5 py-2 text-xs text-gold" onClick={onExport}><Download size={14} />Скачать CSV</Button3D>
        </div>
      </GlassCard>
      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((day) => (
          <GlassCard key={day.day} className={`rounded-2xl p-5 ${statusTone(day.status).ring}`}>
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-ink/50">
              <span className="flex flex-wrap items-center gap-2">{formatLong(dateForDay(day.day))} · {formatWeekday(dateForDay(day.day))} · {day.pillar} <StatusMark status={day.status} decidedBy={day.decidedBy} /></span>
              <button type="button" onClick={() => onCopy(shownPost(day))} className="press inline-flex items-center gap-1 text-gold"><Copy size={13} />Копировать</button>
            </div>
            <DayPhoto day={day.day} className="mb-3 h-44 w-full rounded-2xl object-cover" />
            <h3 className="font-fraunces text-3xl text-ink">{day.title}</h3>
            {day.event?.title && <p className="mt-2 text-sm text-[#C6FF5E]">Плюсом к посту: {day.event.title}. {day.event.hook}</p>}
            <p className="mt-1 text-xs text-gold">{(day.format === 'wide' ? 'Широкий' : 'Короткий')} · {wordCount(shownPost(day))} слов</p>
            <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink/75">{shownPost(day)}</p>
            {onToggleExtension && <ExtensionBar day={day} canAct={canAct} onToggle={(id) => onToggleExtension(day.day, id)} />}
            <div className="mt-3">
              <StatusButtons value={day.status} disabled={!canAct} onChange={(next) => onSetStatus(day.day, next)} onReview={() => onReview(day)} />
            </div>
            <p className="mt-3 text-base text-gold">{day.reelHook}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function ReelsView({ days, day, sources, bank, custom, canAct, onPick, onImprove, onApplySource, onUseBank, onCreate, onCopy }) {
  const [pane, setPane] = useState('bank')
  const [draft, setDraft] = useState({ title: '', hook: '', shots: '' })
  const cards = [...(custom || []), ...(bank || [])]
  return (
    <section className="space-y-5">
      <GlassCard className="space-y-4 rounded-2xl p-5">
        <h2 className="font-fraunces text-2xl text-ink">Reels</h2>
        <p className="max-w-3xl text-sm text-ink/70">Сценарий по секундам: хук 0–3, зал 3–8, блюдо или мероприятие 8–13, kedr-res.ru в конце. Если на день стоит вечер из «Тем», он сам попадает в кадр 8–13 с.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPane('bank')} className={`rounded-full px-4 py-2 text-sm ${pane === 'bank' ? 'bg-[#C6FF5E] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-ink'}`}>Новые</button>
          <button type="button" onClick={() => setPane('scripts')} className={`rounded-full px-4 py-2 text-sm ${pane === 'scripts' ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-ink'}`}>Сценарии дней</button>
          <button type="button" onClick={() => setPane('trends')} className={`rounded-full px-4 py-2 text-sm ${pane === 'trends' ? 'bg-[#C9A96A] font-semibold text-[#0A0F0B]' : 'border border-white/15 text-ink'}`}>Тренды</button>
        </div>
      </GlassCard>
      {pane === 'bank' && (
        <div className="space-y-4">
          <GlassCard className="rounded-2xl p-4">
            <p className="text-sm text-ink/70">Свой ролик, без привязки к посту</p>
            <div className="mt-3 grid gap-2">
              <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Название" className="rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-2 text-sm text-ink" />
              <input value={draft.hook} onChange={(event) => setDraft({ ...draft, hook: event.target.value })} placeholder="Первая фраза" className="rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-2 text-sm text-ink" />
              <textarea value={draft.shots} onChange={(event) => setDraft({ ...draft, shots: event.target.value })} placeholder="Что в кадре" rows={3} className="rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-2 text-sm text-ink" />
            </div>
            <button type="button" disabled={!canAct || !draft.title.trim()} onClick={() => { onCreate(draft); setDraft({ title: '', hook: '', shots: '' }) }} className="mt-3 rounded-xl bg-[#C9A96A] px-4 py-2 text-sm font-semibold text-[#0A0F0B] disabled:opacity-40">Создать</button>
          </GlassCard>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((item) => (
              <GlassCard key={item.id} className="rounded-2xl p-4">
                <p className="text-[11px] uppercase tracking-widest text-[#C6FF5E]">Отдельно от поста</p>
                <h3 className="mt-1 font-fraunces text-2xl text-ink">{item.title}</h3>
                <p className="mt-3 text-sm text-[#C9A96A]">{item.hook}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{item.shots}</p>
                {item.sound && <p className="mt-2 text-[11px] text-ink/45">Звук: {item.sound}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onCopy(`${item.title}\n${item.hook}\n${item.shots}`)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink">Скопировать</button>
                  <button type="button" disabled={!canAct} onClick={() => onUseBank(day.day, item)} className="rounded-full border border-[#C9A96A]/40 px-3 py-1.5 text-xs text-[#C9A96A] disabled:opacity-40">Поставить на {formatLong(dateForDay(day.day))}</button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
      {pane === 'scripts' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {days.map((item) => (
            <GlassCard key={item.day} className="rounded-2xl p-4">
              <DayPhoto day={item.day} className="mb-3 h-32 w-full rounded-2xl object-cover" />
              <p className="text-[11px] uppercase tracking-widest text-gold">{formatLong(dateForDay(item.day))}</p>
              <h3 className="mt-1 text-sm font-semibold text-ink">{item.title}</h3>
              {item.event?.title && <p className="mt-2 text-xs text-[#C6FF5E]">Мероприятие в кадре: {item.event.title}</p>}
              <p className="mt-3 text-sm text-gold">{item.reelHook}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{item.reelScript}</p>
              <p className="mt-3 text-[11px] text-ink/50">Звук: {item.reelAudio}</p>
              <p className="mt-1 text-[11px] text-ink/45">Ситуация: {item.scene}</p>
              <button type="button" disabled={!canAct} onClick={() => onImprove(item.day)} className="press mt-3 rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Пересобрать сценарий</button>
            </GlassCard>
          ))}
        </div>
      )}
      {pane === 'trends' && (
        <div className="space-y-4">
          <GlassCard className="rounded-2xl p-4">
            <p className="text-sm text-ink/70">День, на который собрать ролик</p>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {days.map((item) => (
                <button key={item.day} type="button" onClick={() => onPick(item.day)} className={`shrink-0 rounded-2xl border px-3 py-2 text-left text-xs ${item.day === day.day ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-white/10 text-ink'}`}>
                  <span className="block font-semibold">{formatLong(dateForDay(item.day))}</span>
                  <span className="mt-0.5 block max-w-[140px] opacity-70">{item.scene}</span>
                </button>
              ))}
            </div>
          </GlassCard>
          <div className="grid gap-4 lg:grid-cols-2">
            {sources.map((source) => (
              <GlassCard key={source.id} className="rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#C9A96A]">{source.source}</p>
                <p className="mt-1 text-[11px] text-ink/50">{source.service} · {source.dateLabel}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{source.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/75">{source.watch}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#C9A96A]/35 px-3 py-1.5 text-xs text-[#F4F0E6]">Открыть источник</a>
                  <button type="button" disabled={!canAct} onClick={() => onApplySource(day.day, source)} className="rounded-xl bg-[#C6FF5E] px-3 py-1.5 text-xs font-semibold text-[#0A0F0B] disabled:opacity-40">Пересобрать на {formatLong(dateForDay(day.day))}</button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function channelTitle(id) {
  return TELEGRAM_CHANNELS.find((item) => item.id === id)?.title || `@${id}`
}

export function ThemesView({ days, day, formats, groups = [], sources, canAct, onPick, onApply, onUndo }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || 'games')
  const [pickedId, setPickedId] = useState(formats.find((item) => item.group === (groups[0]?.id || 'games'))?.id || '')
  const visible = formats.filter((item) => item.group === groupId)
  const picked = formats.find((item) => item.id === pickedId) || visible[0] || null
  const links = sources?.[picked?.group] || []

  function chooseGroup(id) {
    setGroupId(id)
    const first = formats.find((item) => item.group === id)
    if (first) setPickedId(first.id)
  }

  return (
    <section className="space-y-5">
      <GlassCard className="rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">30 форматов</p>
        <h2 className="font-fraunces mt-1 text-3xl text-ink">Темы мероприятий</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/75">
          Карточка только выбирает формат. Чтобы вечер попал в план, посты и рилс, нажмите «В план, посты и рилс». Текст дня не стирается — мероприятие дописывается плюсом. Потом его видно во вкладке «Мероприятия».
        </p>
        {day.event?.title && (
          <p className="mt-3 rounded-2xl border border-[#C6FF5E]/30 bg-[#C6FF5E]/10 px-4 py-3 text-sm text-[#C6FF5E]">
            На {formatLong(dateForDay(day.day))} уже стоит «{day.event.title}». Посты и рилс это подхватили.
          </p>
        )}
        <label className="mt-4 block text-sm text-ink/70">
          День, на который поставить тему
          <select value={day.day} onChange={(event) => onPick(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/15 bg-[#0A0F0B] px-3 py-3 text-ink">
            {days.map((item) => (
              <option key={item.day} value={item.day}>{formatLong(dateForDay(item.day))} · {item.warmupTheme} · {item.title}</option>
            ))}
          </select>
        </label>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {groups.map((group) => (
            <button key={group.id} type="button" onClick={() => chooseGroup(group.id)} className={`shrink-0 rounded-2xl border px-4 py-2 text-left ${groupId === group.id ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-white/15 text-ink'}`}>
              <span className="block text-sm font-semibold">{group.title}</span>
              <span className={`block text-[11px] ${groupId === group.id ? 'text-[#0A0F0B]/70' : 'text-ink/50'}`}>{group.note}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((format) => {
            const active = format.id === picked?.id
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => setPickedId(format.id)}
                className={`rounded-2xl border px-4 py-3 text-left ${active ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-[#C9A96A]/25 text-ink hover:border-[#C9A96A]'}`}
              >
                <span className="font-fraunces block text-xl leading-tight">{format.title}</span>
                <span className={`mt-1 block text-sm leading-snug ${active ? 'text-[#0A0F0B]/80' : 'text-[#C9A96A]'}`}>{format.hook}</span>
                <span className={`mt-1 block text-[11px] ${active ? 'text-[#0A0F0B]/60' : 'text-ink/50'}`}>{format.note}</span>
              </button>
            )
          })}
        </div>
      </GlassCard>

      {picked && (
        <div className="grid gap-4 lg:grid-cols-12">
          <GlassCard className="rounded-2xl p-5 lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.16em] text-gold">{groupTitle(picked.group)}</p>
            <h3 className="font-fraunces mt-1 text-3xl text-ink">{picked.title}</h3>
            <p className="mt-2 text-lg text-[#C9A96A]">{picked.hook}</p>
            <p className="mt-3 text-sm text-ink/70"><span className="text-gold">Что нужно. </span>{picked.need}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-gold">Как сделать в «Кедре»</p>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/85">
              {picked.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => onApply(day.day, picked)} className="rounded-xl bg-[#C9A96A] px-4 py-2 text-sm font-semibold text-[#0A0F0B]">В план, посты и рилс · {formatLong(dateForDay(day.day))}</button>
              <button type="button" onClick={onUndo} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-ink">Убрать действие</button>
            </div>
          </GlassCard>
          <GlassCard className="rounded-2xl p-5 lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#C6FF5E]">Реклама в Telegram</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">Куда ставить под этот формат</h3>
            <p className="mt-2 text-sm text-ink/60">Только каналы из нашей ленты. Свои, молчащие и «открытия-закрытия» не предлагаем: там другую аудиторию.</p>
            <div className="mt-4 space-y-3">
              {(picked.ads || []).map((item) => (
                <a key={item.id} href={`https://t.me/${item.id}`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-[#C6FF5E]/25 px-3 py-3">
                  <span className="block text-sm font-semibold text-[#C6FF5E]">{channelTitle(item.id)}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink/65">{item.why}</span>
                  <span className="mt-1 block text-[11px] text-ink/40">t.me/{item.id}</span>
                </a>
              ))}
            </div>
            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="rounded-full border border-[#C9A96A]/35 px-3 py-1 text-xs text-[#F4F0E6]">{link.place} · {link.title}</a>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </section>
  )
}

export function VideoView({ url, setUrl, presets, onAnalyze, busy, result, news, onRefresh, onApply, onTake, canAct }) {
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#C6FF5E]/40 px-3 py-1 text-xs font-semibold text-[#C6FF5E]">AI Deconstructor 2026</span>
          <span className="text-xs text-ink/50">Reels / TikTok / Shorts</span>
        </div>
        <h2 className="font-fraunces text-2xl text-ink sm:text-3xl">Разбор фуд-ролика и адаптация под <span className="text-gold">KEDR</span></h2>
        <p className="text-sm text-ink/75">Вставьте ссылку или выберите пример. Ответ собирается на этом экране, без внешнего API.</p>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="flex-1 rounded-xl border border-ink/10 bg-card px-4 py-3 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
          <Button3D onClick={onAnalyze} disabled={busy}>{busy ? 'Смотрим ролик…' : 'Разобрать'}</Button3D>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button key={preset.url} type="button" onClick={() => { setUrl(preset.url); onAnalyze(preset) }} className="rounded-lg border border-ink/10 bg-paper px-3 py-1 text-xs text-ink/75 hover:bg-paper">
              {index === 0 ? '2.4M: дымный клош' : index === 1 ? '1.8M: хвоя и настойки' : '950K: не заказывайте, если…'}
            </button>
          ))}
        </div>
        {result && (
          <div className="space-y-3 rounded-2xl border border-[#C9A96A]/30 bg-card p-5 text-sm">
            <h3 className="font-fraunces text-xl text-ink">{result.title}</h3>
            <p><span className="text-gold">Хук. </span>{result.hookAnalysis}</p>
            <p><span className="text-gold">Ритм. </span>{result.pacing}</p>
            <p><span className="text-gold">Звук. </span>{result.audioTrigger}</p>
            <p><span className="text-gold">Под KEDR. </span>{result.kedrAdaptation}</p>
          </div>
        )}
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-4 rounded-3xl p-6 lg:col-span-5">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Радар фуд-маркетинга</span>
            <button type="button" onClick={onRefresh} className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-gold"><RefreshCw size={13} />Обновить</button>
          </div>
          <h3 className="font-fraunces mb-4 text-2xl text-ink">Что работает в ресторанах сейчас</h3>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id || item.title} className="rounded-2xl border border-ink/10 bg-card p-3">
                <p className="text-[11px] text-gold">{item.dateLabel || item.tag} · {item.source || item.time}</p>
                <p className="mt-1 text-base text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-ink/75">{item.watch || item.action}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-obsidian">Открыть источник</a>}
                  {onTake && <button type="button" disabled={!canAct} onClick={() => onTake(item)} className="rounded-lg border border-[#C9A96A]/30 px-3 py-1.5 text-xs font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-40">Поставить на этот день</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#C9A96A]/25 bg-[#0A0F0B] p-4 text-xs text-ink/75">
          <p className="mb-1 font-bold text-ink">Совет агента</p>
          Ролики со склейкой около секунды и живым звуком дров держат сохранения лучше студийной музыки. Включить паттерн в дни 4, 9 и 17?
          <Button3D className="mt-2.5 w-full" disabled={!canAct} onClick={onApply}>Внедрить в план</Button3D>
        </div>
      </GlassCard>
    </section>
  )
}

export function FilesView({ files, onUpload, telegram, onAddTelegram, onDigest, canAct }) {
  const [handle, setHandle] = useState('')
  const [role, setRole] = useState('Канал гостей')
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="space-y-5 rounded-3xl p-6 lg:col-span-7">
        <div className="flex items-center justify-between">
          <h2 className="font-fraunces text-2xl text-ink">База знаний ресторана</h2>
          <span className="rounded-full border border-[#C9A96A]/30 px-2.5 py-1 text-xs font-semibold text-[#C9A96A]">Список на этом устройстве</span>
        </div>
        <p className="text-sm text-ink/75">PDF и DOC открываются отдельной ссылкой. Меню зала уже подключено. Загруженный файл можно смотреть, пока эта вкладка браузера открыта.</p>
        <label className={`block rounded-2xl border-2 border-dashed border-[#C9A96A]/30 bg-card p-6 text-center ${canAct ? 'cursor-pointer hover:border-gold' : 'cursor-not-allowed opacity-40'}`}>
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" className="hidden" disabled={!canAct} onChange={onUpload} />
          <Upload className="mx-auto mb-3 text-gold" />
          <div className="text-sm font-semibold text-ink">Перетащите файлы или выберите с компьютера</div>
          <div className="mt-1 text-xs text-ink/50">.docx, .xlsx, .csv, .pdf</div>
        </label>
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.name} className="rounded-2xl border border-ink/10 bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{file.name}</p>
                <span className="text-[11px] text-gold">{file.type} • {file.size}</span>
              </div>
              <p className="mt-2 text-xs text-ink/75">{file.insight}</p>
              {file.url ? (
                <a href={file.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#C9A96A] px-3 py-1.5 text-xs font-semibold text-[#0A0F0B]">
                  <ExternalLink size={13} /> Открыть {file.type === 'PDF' || file.type === 'DOC' || file.type === 'DOCX' ? file.type : 'файл'}
                </a>
              ) : (
                <p className="mt-2 text-xs text-ink/45">Ссылка была только в этой сессии. Загрузите файл ещё раз.</p>
              )}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="flex flex-col justify-between space-y-5 rounded-3xl p-6 lg:col-span-5">
        <div className="space-y-4">
          <h3 className="font-fraunces text-2xl text-ink">Telegram-аккаунты</h3>
          <p className="text-xs text-ink/75">Канал гостей, бот директора и чат кухни. Отправка пока отмечается в кабинете, без Bot API.</p>
          <div className="space-y-2.5">
            {telegram.map((item) => (
              <div key={item.handle} className="rounded-2xl border border-ink/10 bg-card p-3 text-xs">
                <p className="font-semibold text-ink">{item.handle}</p>
                <p className="text-ink/50">{item.role}</p>
                <p className="text-ink/60">{item.status}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 rounded-2xl border border-ink/10 bg-card p-4">
            <div className="flex gap-2">
              <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@kedr_vip_club" className="flex-1 rounded-xl border border-ink/10 bg-card px-3 py-2 text-xs text-ink focus:border-[#C9A96A] focus:outline-none" />
              <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-ink/10 bg-card px-2 text-xs text-ink/75">
                <option>Канал гостей</option>
                <option>Бот директора</option>
                <option>Чат кухни/SMM</option>
              </select>
            </div>
            <Button3D tone="ghost" className="w-full border-sky-400/40 text-xs text-sky-300" disabled={!canAct} onClick={() => { onAddTelegram(handle, role); setHandle('') }}>Привязать аккаунт</Button3D>
          </div>
        </div>
        <Button3D className="w-full" disabled={!canAct} onClick={onDigest}><Send size={14} />Отметить тестовую сводку директору</Button3D>
      </GlassCard>
    </section>
  )
}

export function InstaView({ days, canAct, onOpen, onQueue, url, setUrl, busy, result, onAnalyze }) {
  return (
    <section className="space-y-5">
      <GlassCard className="space-y-4 rounded-[28px] p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-gold">Разбор ролика</p>
        <h2 className="font-fraunces text-3xl text-ink">Как лечь на день KEDR</h2>
        <p className="text-sm text-ink/70">Вставьте ссылку на Reels. Разбор собирается здесь, без внешней публикации.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Ссылка на ролик" className="flex-1 rounded-2xl border border-white/15 bg-card px-4 py-3 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
          <Button3D onClick={() => onAnalyze()} disabled={busy}>{busy ? 'Смотрим…' : 'Разобрать'}</Button3D>
        </div>
        {result && (
          <div className="space-y-2 rounded-2xl bg-card p-4 text-sm leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">{result.title}</p>
            <p>{result.hookAnalysis}</p>
            <p>{result.pacing}</p>
            <p>{result.audioTrigger}</p>
            <p>{result.kedrAdaptation}</p>
          </div>
        )}
      </GlassCard>
      <div className="metal-slide flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Профиль с сайта kedr-res.ru</p>
          <h2 className="font-fraunces text-3xl text-ink">{FLAGSHIP.instagramHandle}</h2>
          <p className="mt-1 text-sm text-ink/75">Профиль KEDR с сайта. Текст копируется здесь и открывается в Instagram.</p>
        </div>
        <a href={FLAGSHIP.instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#C9A96A] px-4 py-2.5 text-sm font-semibold text-[#0A0F0B]">
          <ExternalLink size={14} />
          Открыть Instagram
        </a>
      </div>
      <div className="grid gap-3">
        {days.map((day) => (
          <GlassCard key={day.day} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 ${statusTone(day.status).ring}`}>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(day)}>
              <p className="flex flex-wrap items-center gap-2 text-xs text-gold">{formatLong(dateForDay(day.day))} <StatusMark status={day.status} decidedBy={day.decidedBy} /></p>
              <p className="mt-1 text-base font-semibold text-ink">{day.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-ink/75">{day.reelHook}</p>
            </button>
            <button type="button" disabled={!canAct} onClick={() => onQueue(day)} className="press rounded-full bg-[#C9A96A] px-3 py-2 text-xs font-semibold text-[#0A0F0B] disabled:cursor-not-allowed disabled:opacity-40">
              В профиль
            </button>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}

export function TeamView({ messages, members, approved, canAct, teamState, onSend, onForward }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [messages])
  return (
    <section className="grid gap-5 lg:grid-cols-12">
      <GlassCard className="flex min-h-[70vh] flex-col rounded-3xl p-4 sm:p-5 lg:col-span-8 lg:min-h-[640px]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-fraunces text-3xl text-ink">Комната команды</h2>
            <p className="text-sm text-ink/75">Обсуждение дней. Утверждённый пост или тему можно переслать одним нажатием.</p>
            {teamState && (
              <p className={`mt-1 text-xs ${teamState === 'offline' ? 'text-red-300' : 'text-[#C6FF5E]'}`}>
                {teamState === 'online' ? '● Общий чат: сообщения и задачи видят все участники, проверка каждые 20 секунд' : teamState === 'offline' ? '● Нет связи с ретранслятором — сообщения пока остаются на этом устройстве' : '● Подключаемся к общему чату…'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <span key={member.id} className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs text-ink/75">
                {member.name} · {roleLabel(member.role)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <article key={message.id || `${message.time}-${message.sender}`} className="rounded-2xl border border-ink/10 bg-card p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-gold">{message.sender}{message.role ? ` · ${message.role}` : ''}</span>
                <span className="text-ink/50">{message.time}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">{message.text}</p>
              {message.attachment && (
                <div className={`mt-3 rounded-xl border p-3 ${message.attachment.kind === 'decision' ? 'border-[#7DCE6A]/40 bg-[#7DCE6A]/10' : 'border-ink/10 bg-paper'}`}>
                  <p className={`text-[10px] uppercase tracking-[0.16em] ${message.attachment.kind === 'decision' ? 'text-[#7DCE6A]' : 'text-gold'}`}>
                    {message.attachment.kind === 'theme' ? 'Тема' : message.attachment.kind === 'reel' ? 'Рилс' : message.attachment.kind === 'decision' ? 'Команда утвердила' : 'Пост'} · {formatLong(dateForDay(message.attachment.day))}
                  </p>
                  <p className="mt-1 font-semibold text-ink">{message.attachment.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">{message.attachment.body}</p>
                </div>
              )}
            </article>
          ))}
          <div ref={endRef} />
        </div>
        {canAct ? (
          <form className="mt-4 flex gap-2 border-t border-ink/10 pt-4" onSubmit={(event) => { event.preventDefault(); onSend(text); setText('') }}>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Написать команде" className="flex-1 rounded-xl border border-ink/10 bg-card px-3 py-3 text-sm text-ink focus:border-[#C9A96A] focus:outline-none" />
            <button type="submit" className="rounded-xl bg-[#C9A96A] px-4 text-sm font-semibold text-[#0A0F0B]" aria-label="Отправить"><Send size={16} /></button>
          </form>
        ) : (
          <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/75">Чат открыт для чтения. Писать можно после входа и подтверждения разработчиком.</p>
        )}
      </GlassCard>
      <GlassCard className="rounded-3xl p-5 lg:col-span-4">
        <h3 className="font-fraunces text-2xl text-ink">Переслать в чат</h3>
        <p className="mt-1 text-sm text-ink/75">Только дни, которые уже утвердили.</p>
        <div className="mt-4 max-h-[560px] space-y-3 overflow-y-auto pr-1">
          {approved.length === 0 && <p className="text-sm text-ink/50">Пока пусто. Утвердите день в плане — он появится здесь.</p>}
          {approved.map((day) => (
            <div key={day.day} className={`rounded-2xl border bg-card p-3 ${day.status === 'approved' ? 'border-[#7DCE6A]/40' : 'border-ink/10'}`}>
              <p className="flex flex-wrap items-center gap-2 text-xs text-gold">{formatLong(dateForDay(day.day))} <StatusMark status={day.status} decidedBy={day.decidedBy} /></p>
              <p className="mt-1 font-semibold text-ink">{day.title}</p>
              {teamNote(day) && <p className={`mt-1 text-xs ${statusTone(day.status).text}`}>{teamNote(day)}</p>}
              <p className="mt-1 line-clamp-2 text-sm text-ink/75">{shownPost(day)}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" disabled={!canAct} onClick={() => onForward(day, 'post')} className="rounded-full bg-[#C9A96A] px-3 py-1.5 text-xs font-semibold text-[#0A0F0B] disabled:opacity-40">Пост</button>
                <button type="button" disabled={!canAct} onClick={() => onForward(day, 'theme')} className="rounded-full border border-ink/10 px-3 py-1.5 text-xs text-ink disabled:opacity-40">Тема</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  )
}

export function DayModalBody({ day, onCopy }) {
  return (
    <div className="space-y-3 text-base leading-relaxed text-ink/75">
      <div className="flex flex-wrap items-center gap-2">
        <StatusMark status={day.status} decidedBy={day.decidedBy} />
        <p className="text-sm text-gold">{day.pillar} • {day.dish} • {day.margin}</p>
      </div>
      {teamNote(day) && <p className={`text-sm font-semibold ${statusTone(day.status).text}`}>{teamNote(day)}</p>}
      {day.event?.title && <p className="text-sm text-[#C6FF5E]">Плюсом: {day.event.title}. {day.event.hook}</p>}
      <p className="whitespace-pre-wrap text-base leading-relaxed text-ink/80">{shownPost(day)}</p>
      <p className="text-xs text-ink/75"><span className="text-gold">Хук. </span>{day.reelHook}</p>
      <p className="text-xs text-ink/75"><span className="text-gold">Сценарий. </span>{day.reelScript}</p>
      <p className="text-xs text-ink/50">Звук: {day.reelAudio}</p>
      <p className="text-xs text-ink/60">{day.warmupTheme} • {day.kpi}</p>
      <Button3D tone="ghost" className="text-xs" onClick={() => onCopy(shownPost(day))}><Copy size={14} />Скопировать пост</Button3D>
    </div>
  )
}
