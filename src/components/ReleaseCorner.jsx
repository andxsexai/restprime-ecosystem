import { useState } from 'react'
import { dateForDay, formatLong } from '../lib/planDates.js'

export default function ReleaseCorner({ days, focus, onPick }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-[70] -translate-y-1/2 rounded-l-md border border-ink/10 border-r-0 bg-card/80 px-1 py-2 text-[10px] tracking-[0.18em] text-ink/35 [writing-mode:vertical-rl]"
        aria-label="Открыть угол выхода"
      >
        выход
      </button>
    )
  }

  return (
    <aside className="fixed bottom-6 right-0 z-[70] flex max-h-[58vh] w-[240px] flex-col rounded-l-2xl border border-ink/10 border-r-0 bg-card shadow-xl">
      <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.16em] text-ink/45">
        свернуть вбок
      </button>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {days.map((day) => (
          <button
            key={day.day}
            type="button"
            onClick={() => onPick(day)}
            className={`w-full rounded-xl px-2 py-1.5 text-left ${day.day === focus ? 'bg-paper' : ''}`}
          >
            <span className="block text-[11px] text-[#2f6b4f]">{formatLong(dateForDay(day.day))}</span>
            <span className="block text-xs leading-snug text-ink/80">{day.title}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
