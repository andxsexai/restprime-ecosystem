import { X } from 'lucide-react'

export default function Modal({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1e3328]/35 p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-ink/10 bg-[#fffcf8] p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="font-fraunces text-3xl text-ink">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink/70" aria-label="Закрыть">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
