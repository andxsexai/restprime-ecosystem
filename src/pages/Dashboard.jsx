import { FLAGSHIP } from '../data/place.js'
import { shownPost } from '../lib/compose.js'
import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'
import StatusButtons, { StatusMark, statusTone, teamNote } from '../components/StatusButtons.jsx'
import GlassCard from '../components/ui/GlassCard.jsx'
import PremiumButton from '../components/ui/PremiumButton.jsx'
import ExtensionBar from '../components/ExtensionBar.jsx'

export default function Dashboard({
  day, canAct, decisions = [], onPublish, onEdit, onOpenPlan, onOpenAgent, onOpenChannels, onOpenThree, onOpenRework, onOpenCheck, onOpenEvents, onReview, onStatus, onToggleExtension,
}) {
  const date = dateForDay(day.day)
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <GlassCard className={`lg:col-span-8 ${statusTone(day.status).ring}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Сегодня</p>
          <StatusMark status={day.status} decidedBy={day.decidedBy} />
        </div>
        <h2 className="font-display mt-2 text-4xl italic text-[#F4F0E6]">Пост этого дня</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7A8580]">
          Обзор нужен для одного: прочитать текст на сегодняшнюю дату, поставить его на проверку и открыть Telegram. Календарь, агент и каналы живут в своих вкладках.
        </p>
        <p className="mt-4 text-sm text-[#C9A96A]">{formatLong(date)} · {formatWeekday(date)}</p>
        <h3 className="font-display mt-1 text-3xl italic text-[#F4F0E6]">{day.title}</h3>
        {day.event?.title && <p className="mt-2 text-sm text-[#C6FF5E]">Плюсом сегодня: {day.event.title}. {day.event.hook}</p>}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#F4F0E6]/90">{shownPost(day)}</p>
        {teamNote(day) && <p className={`mt-3 text-sm font-semibold ${statusTone(day.status).text}`}>{teamNote(day)}</p>}
        <div className="mt-4">
          <StatusButtons value={day.status} disabled={!canAct} onChange={(status) => onStatus(day.day, status)} onReview={() => onReview(day)} />
        </div>
        <ExtensionBar day={day} canAct={canAct} onToggle={(id) => onToggleExtension(day.day, id)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton disabled={!canAct} onClick={onPublish}>Скопировать и открыть Telegram</PremiumButton>
          <PremiumButton tone="ghost" onClick={onEdit}>Править текст</PremiumButton>
        </div>
      </GlassCard>
      <GlassCard className="space-y-3 lg:col-span-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96A]">Куда идти дальше</p>
        <button type="button" onClick={onOpenPlan} className="w-full rounded-2xl border border-[#C9A96A]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">План</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Все 30 дней, статусы и проверка</span>
        </button>
        <button type="button" onClick={onOpenAgent} className="w-full rounded-2xl border border-[#C9A96A]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">Агент</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Выбрать день и пересобрать текст</span>
        </button>
        <button type="button" onClick={onOpenChannels} className="w-full rounded-2xl border border-[#C9A96A]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">Каналы</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Чужие посты за три дня и переработка</span>
        </button>
        <button type="button" onClick={onOpenThree} className="w-full rounded-2xl border border-[#C6FF5E]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">3 дня вперёд</span>
          <span className="mt-1 block text-xs text-[#7A8580]">По три поста и три рилс на каждый день</span>
        </button>
        <button type="button" onClick={onOpenRework} className="w-full rounded-2xl border border-[#C6FF5E]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">Переработка</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Пересобиратор: тема ленты, свой текст «Кедра»</span>
        </button>
        <button type="button" onClick={onOpenCheck} className="w-full rounded-2xl border border-[#C6FF5E]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">Проверка</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Агент смотрит часы, скидку, чужие цитаты и мероприятия</span>
        </button>
        <button type="button" onClick={onOpenEvents} className="w-full rounded-2xl border border-[#C9A96A]/30 px-4 py-3 text-left">
          <span className="block text-sm font-semibold text-[#F4F0E6]">Мероприятия</span>
          <span className="mt-1 block text-xs text-[#7A8580]">Что уже стоит в плане плюсом к посту</span>
        </button>
        {decisions.length > 0 && (
          <div className="rounded-2xl border border-[#7DCE6A]/35 bg-[#7DCE6A]/10 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#7DCE6A]">Команда уже закрыла</p>
            {decisions.map((item) => (
              <p key={item.id} className="mt-1 text-xs text-[#F4F0E6]/80">{item.sender}: {item.text}</p>
            ))}
          </div>
        )}
        <a href={FLAGSHIP.site} target="_blank" rel="noreferrer" className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-[#C9A96A]">Сайт зала · kedr-res.ru</a>
      </GlassCard>
    </div>
  )
}
