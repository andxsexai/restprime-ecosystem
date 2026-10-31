import { useState } from 'react'
import { dateForDay, formatLong } from '../lib/planDates.js'

export default function ReleaseCorner({ days, focus, onPick }) {
  const [open, setOpen] = useState(true)
  const current = days.find((item) => item.day === focus)

  return (
    <aside className="fixed bottom-4 right-4 z-[80] w-[300px] overflow-hidden rounded-3xl border border-gold/40 bg-obsidian/95 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span>
          <span className="block text-[10px] uppercase tracking-[0.22em] text-gold">Угол выхода</span>
          <span className="font-fraunces text-2xl text-white">Когда выходит пост</span>
        </span>
        <span className="text-xs text-slate-300">{open ? 'свернуть' : '30 дней'}</span>
      </button>
      {current && (
        <p className="px-4 pb-2 text-xs text-slate-300">
          Сейчас день {current.day}: пост в <span className="text-gold">13:30</span>, Reels в <span className="text-pink-300">18:00</span>
        </p>
      )}
      {open && (
        <div className="max-h-[46vh] space-y-1 overflow-y-auto px-2 pb-3">
          {days.map((day) => {
            const date = dateForDay(day.day)
            const active = day.day === focus
            return (
              <button
                key={day.day}
                type="button"
                onClick={() => onPick(day)}
                className={`w-full rounded-2xl px-3 py-2 text-left ${active ? 'bg-kedr text-white' : 'hover:bg-white/5'}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-fraunces text-lg text-goldLight">{formatLong(date)}</span>
                  <span className="text-[11px] text-slate-300">день {day.day}</span>
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-white">{day.title}</span>
                <span className="mt-1 flex gap-3 text-[11px]">
                  <span className="text-gold">Пост 13:30</span>
                  <span className="text-pink-300">Reels 18:00</span>
                  <span className={day.status === 'approved' ? 'text-emerald-300' : 'text-amber-300'}>{day.status === 'approved' ? 'готов' : 'черновик'}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
