import { Check } from 'lucide-react'
import { POST_EXTENSIONS, extensionPresent } from '../lib/compose.js'

export default function ExtensionBar({ day, canAct, onToggle }) {
  const picked = day.extensions || []
  return (
    <div className="mt-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Дописать в конец</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {POST_EXTENSIONS.map((item) => {
          const inText = extensionPresent(day, item.id)
          const on = picked.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              disabled={!canAct || inText}
              onClick={() => onToggle(item.id)}
              title={inText ? 'Уже есть в тексте поста' : ''}
              className={`press inline-flex min-h-9 items-center gap-1 rounded-full border px-3 py-1.5 text-xs disabled:cursor-not-allowed ${inText ? 'border-white/10 text-[#7A8580]' : on ? 'border-gold bg-gold/20 font-semibold text-gold' : 'border-white/15 text-[#F4F0E6]/80'} ${!canAct && !inText ? 'opacity-40' : ''}`}
            >
              {(inText || on) && <Check size={12} />}
              {item.label}{inText ? ' · уже в тексте' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
