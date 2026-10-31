import { dateForDay, formatLong, formatWeekday } from '../lib/planDates.js'

export default function ReleaseCorner({ days, focus, open, source, onOpen, onClose, onPick }) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="fixed bottom-28 right-0 z-[70] rounded-l-xl border border-r-0 border-[#C9A96A]/45 bg-[#121A14]/95 px-1.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-l-2xl sm:px-2.5 sm:py-5"
        aria-label="Открыть цель"
      >
        <span className="font-fraunces block text-lg tracking-[0.24em] text-[#C9A96A] [writing-mode:vertical-rl] sm:text-3xl sm:tracking-[0.28em]">ЦЕЛЬ</span>
      </button>
    )
  }

  return (
    <aside className="fixed bottom-4 right-0 top-4 z-[70] flex w-[min(100vw,340px)] flex-col rounded-l-[28px] border border-[#C9A96A]/35 border-r-0 bg-[#121A14]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
      <div className="px-5 pb-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-fraunces text-6xl leading-none tracking-[0.14em] text-[#C9A96A]">ЦЕЛЬ</h2>
          <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-xs text-ink/70">
            свернуть
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          {source ? 'Выберите день. Чужой текст соберётся в формат KEDR, блюдо останется из меню этого дня.' : 'Выберите день плана.'}
        </p>
        {source?.text && <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-ink/45">{source.text}</p>}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-5">
        {days.map((item) => {
          const date = dateForDay(item.day)
          const active = item.day === focus
          return (
            <button
              key={item.day}
              type="button"
              onClick={() => onPick(item)}
              className={`w-full rounded-2xl border px-3 py-3 text-left transition ${active ? 'border-[#C9A96A] bg-[#C9A96A] text-[#0A0F0B]' : 'border-white/10 bg-white/[0.03] text-ink hover:border-[#C9A96A]/55'}`}
            >
              <span className="font-fraunces block text-3xl leading-none">{formatLong(date)}</span>
              <span className={`mt-1 block text-xs ${active ? 'text-[#0A0F0B]/70' : 'text-ink/55'}`}>
                {formatWeekday(date)} · {item.title}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
