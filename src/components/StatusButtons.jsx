export const DAY_STATUSES = [
  { id: 'review', label: 'На проверку' },
  { id: 'approved', label: 'Утвердил' },
  { id: 'agreed', label: 'Согласовано' },
]

export function statusLabel(id) {
  return DAY_STATUSES.find((item) => item.id === id)?.label || 'На проверку'
}

export default function StatusButtons({ value, disabled, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DAY_STATUSES.map((item) => {
        const active = value === item.id
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-40 ${active ? 'bg-[#C9A96A] text-[#0A0F0B]' : 'border border-[#C9A96A]/35 text-[#F4F0E6]'}`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
