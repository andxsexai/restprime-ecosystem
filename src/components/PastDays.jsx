import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

export function splitPlanDays(days, todayNumber) {
  const now = todayNumber || 1
  const live = []
  const missed = []
  const passed = []
  for (const day of days || []) {
    if (day.day >= now) live.push(day)
    else if (day.status === 'approved' || day.status === 'agreed') passed.push(day)
    else missed.push(day)
  }
  return { live, missed, passed, past: [...missed, ...passed] }
}

export function splitIsoDays(items, todayIso, dateOf) {
  const live = []
  const past = []
  for (const item of items || []) {
    const iso = dateOf ? dateOf(item) : item.date
    if (!todayIso || iso >= todayIso) live.push(item)
    else past.push(item)
  }
  return { live, past }
}

export function PastDaysFold({ missed = [], passed = [], past = [], renderItem, title = 'Прошедшие дни', missedLabel = 'Пропущенные — можно добрать', passedLabel = 'Уже прошли', empty = '', pastGrid = 'grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5', itemGrid = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' }) {
  const [open, setOpen] = useState(false)
  const missedList = missed.length ? missed : []
  const passedList = passed.length ? passed : []
  const plainPast = !missed.length && !passed.length ? past : []
  const count = missedList.length + passedList.length + plainPast.length
  if (!count) return null

  return (
    <section className="past-fold overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0F0B]/50">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <span>
          <span className="block font-display text-2xl italic text-[#F4F0E6]">{title}</span>
          <span className="mt-1 block text-sm text-[#7A8580]">
            {missedList.length || passedList.length
              ? `${missedList.length ? `Пропущено ${missedList.length}` : empty || 'Пропущенных нет'}${passedList.length ? ` · уже прошли ${passedList.length}` : ''}`
              : `${empty ? `${empty} · ` : ''}${plainPast.length} дн.`}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-[#C9A96A]">
          {open ? 'Свернуть' : 'Открыть'}
          <ChevronDown size={16} className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="past-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.48, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4">
              {missedList.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-[11px] uppercase tracking-[0.16em] text-[#C9A96A]">{missedLabel}</p>
                  <div className={itemGrid}>
                    {missedList.map((item) => renderItem(item, 'missed'))}
                  </div>
                </div>
              )}
              {passedList.length > 0 && (
                <div>
                  <p className="mb-2 px-1 text-[11px] uppercase tracking-[0.16em] text-[#7A8580]">{passedLabel}</p>
                  <div className={`${itemGrid} opacity-70`}>
                    {passedList.map((item) => renderItem(item, 'passed'))}
                  </div>
                </div>
              )}
              {plainPast.length > 0 && (
                <div className={`grid ${pastGrid}`}>
                  {plainPast.map((item) => renderItem(item, 'past'))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function LiveDayWrap({ id, children }) {
  return (
    <motion.div
      layout
      key={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 14, scale: 0.98 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
