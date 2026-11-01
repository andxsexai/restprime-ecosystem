export const DAY_STATUSES = [
  { id: 'review', label: 'На проверку' },
  { id: 'approved', label: 'Утвердил' },
  { id: 'agreed', label: 'Согласовано' },
]

export function statusLabel(id) {
  return DAY_STATUSES.find((item) => item.id === id)?.label || 'На проверку'
}

export function Chameleon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="currentColor" d="M4.2 13.6c.2-3.2 2.8-5.6 6.2-6.1 1.4-.2 2.6.1 3.6.7.3-1.2 1.2-2.2 2.4-2.7.2 1.3-.2 2.5-1.1 3.3 1.8.9 3 2.5 3.3 4.4.2 1.4-.1 2.8-.8 3.9 1.1.2 2.1-.2 2.8-1 .6 1.2.2 2.8-1 3.6-1.8 1.2-4.2 1.1-6.1.1-1.3 1.3-3.3 1.8-5.1 1.2-2.4-.8-3.9-3.1-4.2-5.6v-1.8Z" />
      <circle cx="18.6" cy="10.4" r="2.35" fill="currentColor" />
      <circle cx="19.2" cy="9.9" r=".7" fill="#0A0F0B" />
      <path fill="currentColor" d="M3.2 15.6c-1.4.1-2.2 1.3-1.8 2.4.5 1.3 2.4.8 3.1-.4.4-.8.2-1.8-.4-2.2-.3-.2-.6-.2-.9-.2Z" />
      <path fill="#0A0F0B" d="M8.2 12.2c.7 0 1.2.6 1.1 1.2 0 .4-.3.7-.7.7s-.8-.4-.8-.9.2-1 .4-1Z" opacity=".35" />
    </svg>
  )
}

export function statusTone(id) {
  if (id === 'approved') {
    return {
      active: 'bg-[#7DCE6A] text-[#0A0F0B]',
      idle: 'border border-[#7DCE6A]/40 text-[#7DCE6A]',
      chip: 'border border-[#7DCE6A]/40 bg-[#7DCE6A]/15 text-[#7DCE6A]',
      solid: 'bg-[#7DCE6A] text-[#0A0F0B]',
      text: 'text-[#7DCE6A]',
      ring: 'ring-2 ring-[#7DCE6A]/70',
    }
  }
  if (id === 'agreed') {
    return {
      active: 'bg-[#A8D48A] text-[#0A0F0B]',
      idle: 'border border-[#A8D48A]/40 text-[#A8D48A]',
      chip: 'border border-[#A8D48A]/40 bg-[#A8D48A]/12 text-[#A8D48A]',
      solid: 'bg-[#A8D48A] text-[#0A0F0B]',
      text: 'text-[#A8D48A]',
      ring: 'ring-1 ring-[#A8D48A]/50',
    }
  }
  return {
    active: 'bg-[#C9A96A] text-[#0A0F0B]',
    idle: 'border border-[#C9A96A]/35 text-[#F4F0E6]',
    chip: 'border border-[#C9A96A]/30 text-[#C9A96A]',
    solid: 'bg-[#C9A96A] text-[#0A0F0B]',
    text: 'text-[#C9A96A]',
    ring: '',
  }
}

export function teamNote(day) {
  if (!day) return ''
  if (day.status === 'approved' && day.decidedBy) return `${day.decidedBy} · команда утвердила`
  if (day.status === 'agreed' && day.decidedBy) return `${day.decidedBy} · команда согласовала`
  if (day.status === 'approved') return 'Команда утвердила'
  if (day.status === 'agreed') return 'Команда согласовала'
  return ''
}

export function StatusMark({ status, decidedBy, className = '' }) {
  const tone = statusTone(status)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone.chip} ${className}`}>
      {status === 'approved' && <Chameleon />}
      {statusLabel(status)}
      {decidedBy ? ` · ${decidedBy}` : ''}
    </span>
  )
}

export default function StatusButtons({ value, disabled, onChange, onReview }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAY_STATUSES.map((item) => {
        const active = value === item.id
        const tone = statusTone(item.id)
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => (item.id === 'review' && onReview ? onReview() : onChange(item.id))}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${active ? tone.active : tone.idle}`}
          >
            {item.id === 'approved' && <Chameleon />}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
