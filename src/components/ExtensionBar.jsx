import { POST_EXTENSIONS } from '../lib/compose.js'

export default function ExtensionBar({ day, canAct, onToggle }) {
  const picked = day.extensions || []
  return (
    <div className="mt-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Расширения поста</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {POST_EXTENSIONS.map((item) => {
          const on = picked.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              disabled={!canAct}
              onClick={() => onToggle(item.id)}
              className={`press rounded-full border px-3 py-1.5 text-xs disabled:opacity-40 ${on ? 'border-gold bg-gold/20 font-semibold text-gold' : 'border-white/15 text-slate-300'}`}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
